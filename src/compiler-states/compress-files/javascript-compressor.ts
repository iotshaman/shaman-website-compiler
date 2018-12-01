import { IOC, IOC_TYPES } from '../../inversify';
import { injectable } from 'inversify';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { IFileCompressor, FileData, FileUtils } from '../../files';
import * as Promise from 'promise';

@injectable()
export class JavascriptCompressor extends CompilerState {

  public state: string = 'compress-javascript';
  private compressor: IFileCompressor;
  private utils = FileUtils;

  constructor() {
    super();
    this.compressor = IOC.get<IFileCompressor>(IOC_TYPES.FileCompressor);
  }

  Process(data: CompilerData) {
    this.CompressJavascriptFiles(data)
      .then((rslt: FileData[]) => {
        data.state = 'compress-css';
        data.files = data.files.concat(rslt);
        this.ChangeCompilerState(data);
      })
      .catch((ex: any) => {
        this.CompilerError(new Error(ex));
      })
  }

  private CompressJavascriptFiles = (data: CompilerData): Promise<FileData[]> => {
    let files: FileData[] = data.files.filter(file => file.type == 'js');
    let operations: Promise<FileData>[] = files.map((file: FileData) => {
      return this.compressor.MinifyJs(file, null)
        .then((rslt: string) => {
          let newFile: FileData = {
            name: this.utils.ChangeFileType(file.name, 'js', 'min.js'),
            contents: rslt,
            type: 'min.js'
          }
          return newFile;
        })
    })
    return Promise.all(operations);
  }

}