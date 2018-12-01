import { IOC, IOC_TYPES } from '../../inversify';
import { injectable } from 'inversify';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { IFileService, FileUtils } from '../../files';
import { FileData } from '../../files/file-data.model';
import * as Promise from 'promise';

@injectable()
export class FileLoader extends CompilerState {

  public state: string = 'load-files';
  private fileService: IFileService;
  private utils = FileUtils;

  constructor() {
    super();
    this.fileService = IOC.get<IFileService>(IOC_TYPES.FileService);
  }

  Process(data: CompilerData) {
    this.LoadFilesFromPatterns(data)
      .then(this.utils.ReduceFileData)
      .then((rslt: FileData[]) => {
        data.state = 'load-models';
        data.files = rslt;
        this.ChangeCompilerState(data);
      })
      .catch((ex: any) => {
        this.CompilerError(new Error(ex));
      })
  }

  private LoadFilesFromPatterns = (data: CompilerData): Promise<FileData[][]> => {
    let operations: Promise<FileData[]>[] = [
      this.LoadFilesByType(data.files, 'html', data.config.cwd),
      this.LoadFilesByType(data.files, 'partial.html', data.config.cwd),
      this.LoadFilesByType(data.files, 'css', data.config.cwd),
      this.LoadFilesByType(data.files, 'js', data.config.cwd),
      this.LoadFilesByType(data.files, 'dynamic.html', data.config.cwd)
    ];
    return Promise.all(operations);
  }

  private LoadFilesByType = (allFiles: FileData[], type: string, cwd: string) => {
    let files: FileData[] = allFiles.filter(file => file.type == type);
    let operations: Promise<FileData>[] = files.map((file: FileData) => {
      return this.fileService.ReadFile(cwd, file.name)
        .then((rslt: string) => {
          file.contents = rslt;
          return file;
        })
    })
    return Promise.all(operations);
  }

}