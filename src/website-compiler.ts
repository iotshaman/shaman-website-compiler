import { injectable } from "inversify";
import { IoC, TYPES } from "./composition/app.composition";
import { CompilerDataContext } from "./data/compiler.context";
import { IEventService } from "./services/event.service";
import { IEventHandler } from "./events/event-handler";
import { IFileImportService } from "./services/file-import.service";
import { IBundleService } from './services/bundle.service';
import { FileData, Route } from "./models";
import { IWebsiteRouter } from "./website-router";
import { ILogger, LogLevels } from "./logger";
import { IHandlebarsService } from "./services/handlebars.service";
import { IQueryAdapter } from "./adapters";

@injectable()
export class WebsiteCompiler {
  
  private context: CompilerDataContext;
  private logger: ILogger;
  private router: IWebsiteRouter;
  private eventService: IEventService;
  private eventHandlers: IEventHandler[];
  private fileService: IFileImportService;
  private bundleService: IBundleService;
  private handlebarsService: IHandlebarsService;
  private queryAdapter: IQueryAdapter;
  private globFiles: FileData[];
  private assetFiles: FileData[];
  private helperFiles: FileData[];

  constructor() {
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
    this.logger = IoC.get<ILogger>(TYPES.Logger);
    this.router = IoC.get<IWebsiteRouter>(TYPES.WebsiteRouter);
    this.eventService = IoC.get<IEventService>(TYPES.CompilerEvents);
    this.eventHandlers = IoC.getAll<IEventHandler>(TYPES.CompilerEventHandler);
    this.fileService = IoC.get<IFileImportService>(TYPES.FileImportService);
    this.bundleService = IoC.get<IBundleService>(TYPES.BundleService);
    this.handlebarsService = IoC.get<IHandlebarsService>(TYPES.HandlebarsService);
    this.queryAdapter = IoC.get<IQueryAdapter>(TYPES.QueryAdapter);
    this.eventHandlers.forEach(handler => handler.listen());
  }

  compile = (): Promise<Route[]> => {
    this.logger.log('Starting compilation', LogLevels.info);
    let start = new Date();
    return this.queryAdapter.openConnection()
      .then(this.importHelperFilesFromGlobs)
      .then(this.importAssetFilesFromGlobs)
      .then(this.importFilesFromGlobs)
      .then(this.waitForFileAvailability)
      .then(this.bundleService.updateBundleContent)
      .then(this.router.getAllRoutes)
      .then(routes => {
        var diff = Math.abs(start.getTime() - (new Date()).getTime());
        this.logger.log(`Compilation finished (ms): ${diff}`, LogLevels.info);
        return routes;
      })
  }

  private importHelperFilesFromGlobs = (): Promise<void> => {
    if (this.helperFiles) return Promise.resolve();
    return this.fileService.importHelperFilesFromGlobs()
      .then(rslt => { this.helperFiles = rslt; return rslt; })
      .then(this.handlebarsService.registerHelpers);
  }

  private importAssetFilesFromGlobs = (): Promise<void> => {
    if (this.assetFiles) return Promise.resolve();
    return this.fileService.importAssetFilesFromGlobs()
      .then(rslt => { this.assetFiles = rslt; })
  }

  private importFilesFromGlobs = (): Promise<FileData[]> => {
    if (this.globFiles) return Promise.resolve(this.globFiles);
    return this.fileService.importPartialFilesFromGlobs()
      .then(_ => this.fileService.importFilesFromGlobs())
      .then(files => { this.globFiles = files; return files; });
  }

  private waitForFileAvailability = (): Promise<void> => {
    var allFilesAvailable = (): boolean => {
      let unavailableFiles = this.context.models.files.filter(f => !f.available);
      return unavailableFiles.length == 0;
    }
    return new Promise((res) => {
      if (allFilesAvailable()) res();
      this.eventService.subscribe('file-available', () => {
        if (allFilesAvailable()) res();
      });
    });
  }

}