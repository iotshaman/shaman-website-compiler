import { injectable } from "inversify";
import * as MinifyJs from 'uglify-es';
import * as MinifyCss from 'clean-css';
import * as Promise from 'promise';
import "reflect-metadata";
import { FileData } from "./file-data.model";

export interface IFileCompressor {
  MinifyJs(file: FileData, options: any): Promise<string>;
  BundleJs(files: FileData[], name: string, options: any): Promise<FileData>;
  MinifyCss(file: FileData): Promise<string>;
  BundleCss(files: FileData[], name: string): Promise<FileData>;
}

@injectable()
export class FileCompressor implements IFileCompressor {

  minifyJs: any = MinifyJs.minify;
  minifyCss: any = MinifyCss;

  constructor() {}

  MinifyJs = (file: FileData, options: any = null): Promise<string> => {
    return new Promise((res, err) => {
      if (!options) options = this.getDefaultJsOptions();
      let map = {}; 
      map[file.name] = file.contents;
      var rslt = this.minifyJs(map, options);
      if (rslt.error) { return err(new Error(rslt.error)); }
      res(rslt.code);
    });
  }

  BundleJs = (files: FileData[], name: string, options: any = null): Promise<FileData> => {
    return new Promise((res, err) => {
      if (!options) options = this.getDefaultJsOptions();
      let map = files.reduce((a, b) => { a[b.name] = b.contents; return a; }, {});
      var rslt = this.minifyJs(map, options);
      if (rslt.error) { return err(new Error(rslt.error)); }
      res({
        name: name,
        type: 'bundle.js',
        contents: rslt.code
      });
    });
  }

  MinifyCss = (file: FileData): Promise<string> => {
    return new Promise((res) => {  
      let rslt = new this.minifyCss({}).minify(file.contents);
      res(rslt.styles);
    });
  }

  BundleCss = (files: FileData[], name: string): Promise<FileData> => {
    return new Promise((res, err) => {    
      let amalg = files.reduce((a, b) => { return a += b.contents; }, '');  
      let rslt = new this.minifyCss({}).minify(amalg);
      res({
        name: name,
        type: 'bundle.css',
        contents: rslt.styles
      });
    });
  }

  private getDefaultJsOptions = () => {
    return {
      compress: { passes: 2 },
        nameCache: {},
        output: {
            beautify: false,
            preamble: "/* uglified */"
        }
    }
  }

}