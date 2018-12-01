import { injectable } from "inversify";
import * as FastGlob from 'fast-glob';
import * as Promise from 'promise';
import "reflect-metadata";

import { IGlobOptions } from './glob-options.model';
import { FileData } from "../files/file-data.model";

export interface IGlobService {
  GetFilesFromGlob: (patterns: string[], type: string, options: IGlobOptions) => Promise<FileData[]>
}

@injectable()
export class GlobService implements IGlobService {

  fastGlob: any = FastGlob;

  constructor() {}

  GetFilesFromGlob = (patterns: string[], type: string, options: IGlobOptions): Promise<FileData[]> => {
    return this.fastGlob(patterns, options).then((rslt: string[]) => {
      return rslt.map((file: string) => {
        return {
          name: file,
          contents: '',
          type: type
        }
      })
    });
  }

}