import { IOC, IOC_TYPES } from '../../inversify';
import { injectable } from 'inversify';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { IFileCompressor, FileData, FileUtils } from '../../files';
import * as Promise from 'promise';

@injectable()
export class CssCompressor extends CompilerState {

  public state: string = 'compress-css';
  private compressor: IFileCompressor;
  private utils = FileUtils;

  constructor() {
    super();
    this.compressor = IOC.get<IFileCompressor>(IOC_TYPES.FileCompressor);
  }

  Process(data: CompilerData) {
    this.CompressCssFiles(data)
      .then((rslt: FileData[]) => {
        data.state = 'bundle-javascript';
        data.files = data.files.concat(rslt);
        this.ChangeCompilerState(data);
      })
      .catch((ex: any) => {
        this.CompilerError(new Error(ex));
      })
  }

  private CompressCssFiles = (data: CompilerData): Promise<FileData[]> => {
    if (!data.config.minify) return Promise.resolve([]);
    let files: FileData[] = data.files.filter(file => file.type == 'css');
    let operations: Promise<FileData>[] = files.map((file: FileData) => {
      return this.compressor.MinifyCss(file)
        .then((rslt: string) => {
          let newFile: FileData = {
            name: this.utils.ChangeFileType(file.name, 'css', 'min.css'),
            contents: rslt,
            type: 'min.css'
          }
          return newFile;
        })
    })
    return Promise.all(operations);
  }

}