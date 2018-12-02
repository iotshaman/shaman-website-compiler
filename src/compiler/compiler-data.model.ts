import { CompilerConfig } from "./compiler-config.model";
import { FileData } from "../files/file-data.model";

export class CompilerData {

  config: CompilerConfig;
  state: string;
  files: FileData[];
  startTime: Date;
  endTime: Date;

  constructor(config: CompilerConfig) {
    this.config = config;
    this.state = 'load-globs';
    this.files = [];
    this.startTime = new Date();
  }

}