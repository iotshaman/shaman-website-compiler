import * as _fsx from 'fs-extra';
import * as _path from 'path';
import * as _upath from 'upath';
import * as _gaze from 'gaze';
import { IoC, TYPES } from "./composition/app.composition";
import { WebsiteCompiler } from "./website-compiler";
import { Route, WebsiteConfig, FileData, Bundle } from "./models";
import { IWebsiteServer } from './website-server';
import { CompilerDataContext } from './data/compiler.context';
import { ILogger, LogLevels } from './logger';
import { IEventService } from './services/event.service';

export class Website {

  gaze = _gaze;
  routes: Route[];
  get config(): WebsiteConfig { return this._config; }
  private _config: WebsiteConfig;
  private compiler: WebsiteCompiler;
  private server: IWebsiteServer;
  private context: CompilerDataContext;
  private eventService: IEventService;
  private logger: ILogger;

  constructor() {
    this._config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
    this.compiler = IoC.get<WebsiteCompiler>(TYPES.WebsiteCompiler);
    this.server = IoC.get<IWebsiteServer>(TYPES.WebsiteServer);
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
    this.eventService = IoC.get<IEventService>(TYPES.CompilerEvents);
    this.logger = IoC.get<ILogger>(TYPES.Logger);
  }

  build = (): Promise<Route[]> => {
    return this.compiler.compile()
      .then(this.outputFiles)
      .then(this.startServer)
      .then(routes => {
        this.routes = routes;
        this.watchFiles();
        return routes;
      });
  }

  private outputFiles = (routes: Route[], skipAssets: boolean = false): Promise<Route[]> => {
    if (!this.config.output) return Promise.resolve(routes);
    let operations = routes.map(route => {
      let path = _path.join(this.config.output, route.path);
      return _fsx.ensureFile(path).then(_ => _fsx.outputFile(path, route.content));
    });
    let assets = this.context.models.assets.filter(a => !!a)
    if (!skipAssets) {
      operations = operations.concat(assets.map(asset => {
        let path = _path.join(this.config.output, asset.name);
        return _fsx.copy(asset.path, path);
      }));
    }
    return Promise.all(operations).then(_ => (routes));
  }

  private startServer = (routes: Route[]): Promise<Route[]> => {
    if (!this.config.serve) return Promise.resolve(routes);
    if (this.server.listening) return Promise.resolve(routes);
    this.server.start(routes);
    return Promise.resolve(routes);
  }

  private watchFiles = (): void => {
    if (!this.config.serve) return;
    let watchlist = this.context.models.files.filter(f => !!f).map(f => f.path);
    this.gaze(watchlist, (ex, watcher) => {
      if (ex) {
        this.logger.log(`Error starting file watcher: ${ex.message}`, LogLevels.error);
        return;
      }
      watcher.on('changed', this.fileChanged);
    });
  }

  fileChanged = (path: string): Promise<void> => {
    path = _upath.resolve(path);
    let fileName = path.replace(_upath.resolve(this.config.root), "").slice(1);
    this.logger.log(`File change detected: ${fileName}`, LogLevels.info);
    this.context.models.files.update(fileName, f => { f.available = false; return f; });
    let file = this.context.models.files.find(fileName);
    setTimeout(() => this.eventService.publish('file-added', file));
    return this.context.saveChanges()
      .then(this.compiler.compile)
      .then(routes => this.outputFiles(routes, true))
      .then(routes => {
        this.routes = routes;
        this.server.updateRoutes(routes);
        this.logger.log(`File updated: ${fileName}`, LogLevels.info);
      });
  }

  getFileData = (path: string): FileData => {
    path = _upath.resolve(path);
    let fileName = path.replace(_upath.resolve(this.config.root), "").slice(1);
    return this.context.models.files.find(fileName);
  }

  getBundleData = (name: string): Bundle => {
    return this.context.models.bundles.find(name);
  }

  reloadHtmlPages = (): Promise<Route[]> => {
    this.logger.log(`Website rebuild requested.`, LogLevels.info);
    let pages = this.context.models.files.filter(f => f.extension == 'html');
    pages.forEach(page => { 
      page.available = false; 
      this.context.models.files.update(page.name, f => { 
        f.available = false; 
        return f; 
      });
    });
    return this.context.saveChanges()
      .then(this.compiler.compile)
      .then(routes => this.outputFiles(routes, true))
      .then(routes => {
        this.routes = routes;
        this.server.updateRoutes(routes);
        this.logger.log(`Rebuild complete.`, LogLevels.info);
        return routes;
      });
  }

}