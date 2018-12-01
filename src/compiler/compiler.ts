import { IOC, IOC_TYPES } from '../inversify';
import { CompilerConfig } from "./compiler-config.model";
import { ICompilerState } from '../compiler-states/compiler-state';
import { CompilerData } from './compiler-data.model';
import { ShamanRouter } from '../router/shaman-router';

export class Compiler {

  private config: CompilerConfig;
  private states: ICompilerState[]
  private currentState: ICompilerState
  public onCompileEnd: any;
  public onCompileError: any;

  constructor() {
    this.states = IOC.getAll<ICompilerState>(IOC_TYPES.CompilerState);
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
    data.compiled = true;
    data.endTime = new Date();
    let router = new ShamanRouter(data);
    this.onCompileEnd({ data: data, router: router });
  }

  private GetCompilerState = (data: CompilerData): ICompilerState => {
    let state = this.states.find(s => s.state == data.state);
    if (!state) throw new Error(`Invalid state: ${data.state}`);
    return state;
  }

}