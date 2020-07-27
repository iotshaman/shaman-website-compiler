import * as path from 'path';
import * as FastGlob from 'fast-glob';
import { injectable } from "inversify";
import { IoC, TYPES } from "../composition/app.composition";
import { FileData, WebsiteConfig } from "../models";

export interface IGlobService {
  GetFilesFromGlob: (patterns: string[]) => Promise<FileData[]>
}

@injectable()
export class GlobService implements IGlobService {

  fastGlob: any = FastGlob;
  private config: WebsiteConfig;

  constructor() {
    this.config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
  }

  GetFilesFromGlob = (patterns: string[]): Promise<FileData[]> => {
    let options = { cwd: this.config.root };
    return this.fastGlob(patterns, options).then((rslt: string[]) => {
      return rslt.map((file: string) => {
        let filePath = path.join(this.config.root, file);
        return new FileData(file, filePath)
      })
    });
  }

}