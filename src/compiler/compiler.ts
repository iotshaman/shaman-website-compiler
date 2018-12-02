import { IOC, IOC_TYPES } from '../inversify';
import * as Gaze from 'gaze';
import * as NodePath from 'path';
import * as Promise from 'promise';
import { CompilerConfig } from "./compiler-config.model";
import { ICompilerState } from '../compiler-states/compiler-state';
import { CompilerData } from './compiler-data.model';
import { ShamanRouter } from '../router/shaman-router';
import { FileData, IFileService } from '../files';
import { RouteData } from '../router/shaman-route.model';

export class Compiler {

  gaze: any = Gaze;
  private config: CompilerConfig;
  private states: ICompilerState[]
  private currentState: ICompilerState
  private fileService: IFileService;
  private shamanRouter: ShamanRouter;
  private listening: boolean = false;
  public onCompileEnd: any;
  public onCompileError: any;

  constructor() {
    this.states = IOC.getAll<ICompilerState>(IOC_TYPES.CompilerState);
    this.fileService = IOC.get<IFileService>(IOC_TYPES.FileService);
  }

  Configure = (config: CompilerConfig) => {
    if (!config.pages) config.pages = ["**/*.html", "!**/*.partial.html", "!**/*.dynamic.html"];
    if (!config.dynamics) config.dynamics = ["**/*.dynamic.html"];
    if (!config.partials) config.partials = ["**/*.partial.html"];
    if (!config.styles) config.styles = ["**/*.css"];
    if (!config.scripts) config.scripts = ["**/*.js"];
    this.config = config;
  }

  Compile = () => {
    this.CompilerStateChanged(new CompilerData(this.config));
  }

  private CompilerStateChanged = (data: CompilerData) => {
    if (data.state == 'finish') {
      this.FinishCompilation(data);
      this.currentState = null;
      return;
    }
    this.currentState = this.GetCompilerState(data);
    this.currentState.OnStateChange(this.CompilerStateChanged);
    this.currentState.OnCompilerError(this.CompilerError);
    this.currentState.Process(data);
  }

  private CompilerError = (error: Error) => {
    if (!this.onCompileError) throw error;
    this.onCompileError(error);
  }

  private FinishCompilation = (data: CompilerData) => {
    data.endTime = new Date();
    if (!this.listening) {
      this.shamanRouter = new ShamanRouter(data);
      this.WriteFilesToDisk(this.shamanRouter).then(() => {        
        if (this.config.autoWatch) this.WatchFiles(data, this.Compile);
        this.onCompileEnd({ data: data, router: this.shamanRouter });
      });
    } else {
      this.shamanRouter.LoadRoutes(data);
      this.WriteFilesToDisk(this.shamanRouter);
    }    
  }

  private GetCompilerState = (data: CompilerData): ICompilerState => {
    let state = this.states.find(s => s.state == data.state);
    if (!state) throw new Error(`Invalid state: ${data.state}`);
    return state;
  }

  private WatchFiles = (data: CompilerData, callback: any) => {
    this.listening = true;
    let watchList = this.getWatchList(data); 
    this.gaze(watchList, function (ex, watcher) {
        if (ex) return this.onCompileError(ex);
        this.on('changed', () => { 
          console.log('Updating express routes...');
          callback();
        });
    });
  }

  private getWatchList = (data: CompilerData) => {
    return data.files
      .filter((file: FileData) => {
        return file.type.indexOf('html') > -1 || file.type == 'js' || file.type == 'css' ;
      })
      .map((file: FileData) => {
        return NodePath.join(this.config.cwd, file.name);
      });
  }

  private WriteFilesToDisk = (router: ShamanRouter): Promise<void> => {  
    if (!this.config.outputFolder) return Promise.resolve();
    let keys: string[] = Object.keys(router.routes);  
    let files: RouteData[] = keys.map((key: string) => {
      return router.routes[key];
    });
    let operations: Promise<void>[] = files.map((route: RouteData) => {
      return this.fileService.WriteFile(this.config.outputFolder, route.path, route.content);
    });
    return Promise.all(operations).then(() => { return; }).catch((ex) => {
      this.onCompileError(ex);
    });
  }

}