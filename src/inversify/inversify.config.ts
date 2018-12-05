import { Container } from "inversify";
import { IOC_TYPES } from './invesify.types';
import "reflect-metadata";

import { IGlobService, GlobService } from "../globs";
import { IFileService, FileService, IFileCompressor, FileCompressor } from '../files';
import { ICompilerState } from '../compiler-states/compiler-state';
import { GlobLoader } from '../compiler-states/load-globs/glob-loader';
import { FileLoader } from '../compiler-states/load-files/file-loader';
import { ModelLoader } from "../compiler-states/load-models/model-loader";
import { JavascriptCompressor } from "../compiler-states/compress-files/javascript-compressor";
import { CssCompressor } from "../compiler-states/compress-files/css-compressor";
import { JavascriptBundler } from "../compiler-states/bundle-files/javascript-bundler";
import { CssBundler } from "../compiler-states/bundle-files/css-bundler";
import { Renderer } from "../compiler-states/render/renderer";
import { ISitemapFactory, SitemapFactory } from "../router/sitemap-factory";

export const IOC = new Container();

export function Configure() {
  IOC.bind<IGlobService>(IOC_TYPES.GlobService).to(GlobService);
  IOC.bind<IFileService>(IOC_TYPES.FileService).to(FileService);
  IOC.bind<IFileCompressor>(IOC_TYPES.FileCompressor).to(FileCompressor);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(GlobLoader);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(FileLoader);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(ModelLoader);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(JavascriptCompressor);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(CssCompressor);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(JavascriptBundler);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(CssBundler);
  IOC.bind<ICompilerState>(IOC_TYPES.CompilerState).to(Renderer);
  IOC.bind<ISitemapFactory>(IOC_TYPES.SitemapFactory).to(SitemapFactory);
  return IOC;
}