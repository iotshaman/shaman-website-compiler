import { injectable } from "inversify";

export interface ILogger {
  log: (message: string, logLevel?: number) => void;
}

@injectable()
export class Logger implements ILogger {

  console = console;
  public level: number;
  
  constructor(level: string = "info") {
    if (LogLevels[level] === undefined) this.level = LogLevels.info;
    else this.level = LogLevels[level];
  }

  log = (message: string, logLevel: number = 3): void => {
    if (logLevel > this.level) return;
    let color = LogLevelColors[logLevel]
    let level = LogLevelStrings[logLevel];
    let prefix: string = `${this.timestamp} ${level}:`;
    this.console.log(`${color}%s\x1b[0m %s`, prefix, message);
  }

  private get timestamp(): string {
    let date = new Date();
    let offset = date.getTimezoneOffset() * 60000;
    let rslt = new Date(date.getTime() - offset).toISOString();
    return rslt.slice(0, -1);
  }

}

export const LogLevels = { 
  error: 0, 
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4
}

const LogLevelStrings = {
  0: "ERROR",
  1: "WARN",
  2: "INFO",
  3: "VERBOSE",
  4: "DEBUG"
}

const LogLevelColors = {
  0: "\x1b[31m",
  1: "\x1b[33m",
  2: "\x1b[0m",
  3: "\x1b[0m",
  4: "\x1b[0m"
}