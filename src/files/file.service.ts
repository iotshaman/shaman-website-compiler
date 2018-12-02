import { injectable } from "inversify";
import * as fsx from 'fs-extra';
import * as Promise from 'promise';
import * as nodePath from 'path';
import "reflect-metadata";

export interface IFileService {
  ReadFile(cwd: string, path: string): Promise<string>;
  ReadJson(cwd: string, path: string): Promise<any>;
  WriteFile(cwd: string, path: string, contents: string): Promise<any>;
}

@injectable()
export class FileService implements IFileService {

  fs = fsx;
  path = nodePath;

  constructor() {}

  ReadFile = (cwd: string, path: string): Promise<string> => {
    return new Promise((res, err) => {
      let fullPath = nodePath.join(cwd, path);
      this.fs.readFile(fullPath,  "utf8", (error: any, contents: string) => {
        if (error) return err(error);
        return res(contents);
      });
    });
  }

  ReadJson = (cwd: string, path: string): Promise<any> => {
    return new Promise((res) => {
      let fullPath = this.path.join(cwd, path);
      this.fs.readJson(fullPath, (error: any, data: string) => {
        return res(error ? {} : data);
      });
    });
  }

  WriteFile = (cwd: string, path: string, contents: string): Promise<void> => {
    return new Promise((res) => {
      let fullPath = this.path.join(cwd, path);
      return this.fs.outputFile(fullPath, contents).then(() => { res(); })
    })
  }

}