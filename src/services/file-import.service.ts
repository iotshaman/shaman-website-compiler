import * as fsx from 'fs-extra';
import { injectable } from "inversify";
import { IoC, TYPES } from "../composition/app.composition";
import { CompilerDataContext } from "../data/compiler.context";
import { IGlobService } from './glob.service';
import { IEventService } from "./event.service";
import { FileData, WebsiteConfig } from "../models";
import { ReduceFileData } from "../functions/file.functions";
import { IHandlebarsService } from './handlebars.service';
import { ILogger } from '../logger';

export interface IFileImportService {
  importPartialFilesFromGlobs(): Promise<FileData[]>;
  importFilesFromGlobs(): Promise<FileData[]>;
  importFileText: (file: FileData) => Promise<FileData>;
  importAssetFilesFromGlobs: () => Promise<FileData[]>;
  importHelperFilesFromGlobs: () => Promise<FileData[]>;
}

@injectable()
export class FileImportService implements IFileImportService {
  
  fsx = fsx;
  private config: WebsiteConfig;
  private logger: ILogger;
  private context: CompilerDataContext;
  private globService: IGlobService;
  private eventService: IEventService;
  private handlebarsService: IHandlebarsService;

  constructor() {
    this.config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
    this.logger = IoC.get<ILogger>(TYPES.Logger);
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
    this.globService = IoC.get<IGlobService>(TYPES.GlobService);
    this.eventService = IoC.get<IEventService>(TYPES.CompilerEvents);
    this.handlebarsService = IoC.get<IHandlebarsService>(TYPES.HandlebarsService);
  }

  importPartialFilesFromGlobs = (): Promise<FileData[]> => {
    return this.globService.GetFilesFromGlob(this.config.partials).then(files => {
      let operations = files.map(file => this.importFileText(file));
      return Promise.all(operations)
        .then(files => files.map(file => {
          file.extension = 'partial.html';
          file.available = true;
          return file;
        }))
        .then(this.handlebarsService.registerPartials)
        .then(files => this.addFilesToDatabase(files))
        .then(_ => (files));
    });
  }
  
  importFilesFromGlobs = (): Promise<FileData[]> => {
    let operations: Promise<FileData[]>[] = [
      this.globService.GetFilesFromGlob(this.config.pages),
      this.globService.GetFilesFromGlob(this.config.styles),
      this.globService.GetFilesFromGlob(this.config.scripts)
    ]
    return Promise.all(operations)
      .then(ReduceFileData)
      .then(files => { this.addFilesToDatabase(files); return files; })
      .then(files => { files.forEach(this.alertFileAdded); return files; })
  }
  
  importAssetFilesFromGlobs = (): Promise<FileData[]> => {
    return this.globService.GetFilesFromGlob(this.config.assets)
      .then(files => { this.addAssetFilesToDatabase(files); return files; })
  }
  
  importHelperFilesFromGlobs = (): Promise<FileData[]> => {
    return this.globService.GetFilesFromGlob(this.config.helpers);
  }

  importFileText = (file: FileData): Promise<FileData> => {
    return this.fsx.readFile(file.path, "utf8").then(text => {
      file.text = file.content = text;
      return file;
    })
  }

  private addFilesToDatabase = (files: FileData[]): Promise<void> => {
    files.forEach(file => {
      this.context.models.files.add(file.name, file);
      this.logger.log(`File '${file.name}' has been added to database.`);
    })
    return this.context.saveChanges();
  }

  private addAssetFilesToDatabase = (files: FileData[]): Promise<void> => {
    files.forEach(file => {
      this.context.models.assets.add(file.name, file);
      this.logger.log(`Asset file '${file.name}' has been added to database.`);
    })
    return this.context.saveChanges();
  }

  private alertFileAdded = (file: FileData) => {
    setTimeout(() => this.eventService.publish('file-added', file));
  }

}