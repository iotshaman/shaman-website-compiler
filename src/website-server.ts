import * as _http from 'http';
import * as _fs from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { injectable } from "inversify";
import { IoC, TYPES } from "./composition/app.composition";
import { Route } from "./models";
import { ILogger, LogLevels } from './logger';
import { CompilerDataContext } from './data/compiler.context';
import { GetFileExtension, GetFileMimeType } from './functions/file.functions';

export interface IWebsiteServer {
  listening: boolean;
  start: (routes: Route[]) => void;
  updateRoutes: (routes: Route[]) => void;
}

const PORT = process.env.PORT || 3000;

@injectable()
export class WebsiteServer implements IWebsiteServer {

  protected routes: Route[];
  private logger: ILogger;
  private context: CompilerDataContext;
  private _listening: boolean = false;
  get listening(): boolean { return this._listening; }

  constructor() {
    this.logger = IoC.get<ILogger>(TYPES.Logger);
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
  }

  start = (routes: Route[]): void => {
    this.updateRoutes(routes);
    this._listening = true;
    _http.createServer(this.handleRequest).listen(PORT);
    this.logger.log(`Development server listening on port: ${PORT}`, LogLevels.info);
  }

  updateRoutes = (routes: Route[]): void => {
    this.routes = routes;
  }

  private handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
    let path = (req.url == "/" ? "/index.html" : req.url).slice(1);
    if (path.includes('?')) path = path.substring(0, path.indexOf('?'));
    if (this.isAssetRoute(path)) return this.handleAssetRequest(path, res);
    let route = this.routes.find(r => r.path == path);
    if (!route) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      this.logger.log(`Route not found: ${path}`, LogLevels.warn);
    } else { 
      res.writeHead(200, {'Content-Type': route.mimeType});
      this.logger.log(`Route found: ${path}`, LogLevels.info);
      res.write(route.content);
    }
    res.end();
  }

  private handleAssetRequest = (path: string, res: ServerResponse) => {
    let route = this.context.models.assets.find(path);
    if (!route) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      this.logger.log(`Route not found: ${path}`, LogLevels.warn);
      res.end();
      return;
    }
    res.writeHead(200, {'Content-Type': GetFileMimeType(route.extension)});
    var stream = _fs.createReadStream(route.path);
    stream.pipe(res);
  }

  private isAssetRoute = (path: string) => {
    if (path == 'sitemap.xml') return false;
    let extension = GetFileExtension(path);
    return ['js', 'css', 'html'].indexOf(extension) == -1;
  }

}