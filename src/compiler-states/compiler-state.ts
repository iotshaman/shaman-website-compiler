import { injectable } from 'inversify';
import { CompilerData } from "../compiler/compiler-data.model";

export interface ICompilerState {
  state: string;
  Process(data: CompilerData);
  OnStateChange(callback: (data: CompilerData) => void);
  OnCompilerError(callback: (error: Error) => void);
}

@injectable()
export abstract class CompilerState implements ICompilerState {

  public abstract state: string;
  public abstract Process(data: CompilerData);
  private onStateChange: (data: CompilerData) => void;
  private onError: (error: Error) => void;

  public OnStateChange = (callback: (data: CompilerData) => void) => {
    this.onStateChange = callback;
  }

  public OnCompilerError = (callback: (error: Error) => void) => {
    this.onError = callback;
  }

  protected ChangeCompilerState = (data: CompilerData) => {
    if (!!this.onStateChange) {
      this.onStateChange(data);
    }
  }

  protected CompilerError = (error: Error) => {
    if (!!this.onError) {
      this.onError(error);
    }
  }

}