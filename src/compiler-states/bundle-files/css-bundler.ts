import { IOC, IOC_TYPES } from '../../inversify';
import { injectable } from 'inversify';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { IFileCompressor, FileData } from '../../files';
import { BundlerUtils, FileBundle } from './bundler-utils';
import * as Promise from 'promise';

@injectable()
export class CssBundler extends CompilerState {

  public state: string = 'bundle-css';
  private compressor: IFileCompressor;
  private bundlerUtils = BundlerUtils;

  constructor() {
    super();
    this.compressor = IOC.get<IFileCompressor>(IOC_TYPES.FileCompressor);
  }

  Process(data: CompilerData) {
    this.LoadFileBundles(data)
      .then(this.GenerateFileBundles)
      .then((rslt: FileData[]) => {
        data.files = data.files.concat(rslt);
        data.state = 'render';
        this.ChangeCompilerState(data);
      })
      .catch((ex: any) => {
        this.CompilerError(new Error(ex));
      })
  }

  private LoadFileBundles = (data: CompilerData): Promise<FileBundle[]> => {
    return new Promise((res) => {
      let specs = this.bundlerUtils.GetBundleSpecsFromConfig(data);
      let bundles = this.bundlerUtils.LoadBundleContent(specs, 'css', data.files);
      res(bundles);
    });
  }

  private GenerateFileBundles = (bundles: FileBundle[]): Promise<FileData[]> => {
    let operations: Promise<FileData>[] = bundles.map((bundle: FileBundle) => {
      return this.compressor.BundleCss(bundle.files, bundle.name);
    })
    return Promise.all(operations);
  }

}