import { IOC, IOC_TYPES } from '../../inversify';
import { injectable } from 'inversify';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { IFileService, FileData, FileUtils } from '../../files';
import * as Promise from 'promise';

@injectable()
export class ModelLoader extends CompilerState {

  public state: string = 'load-models';
  private fileService: IFileService;
  private utils = FileUtils;

  constructor() {
    super();
    this.fileService = IOC.get<IFileService>(IOC_TYPES.FileService);
  }

  Process(data: CompilerData) {
    this.LoadFilesFromPatterns(data)
      .then((rslt: FileData[]) => {
        data.state = 'compress-javascript';
        data.files = this.CombineResults(data.files, rslt);
        this.ChangeCompilerState(data);
      })
      .catch((ex: any) => {
        this.CompilerError(new Error(ex));
      })
  }

  private LoadFilesFromPatterns = (data: CompilerData): Promise<FileData[]> => {
    let files: FileData[] = data.files.filter(file => file.type == 'html' || file.type == 'dynamic.html');
    let operations: Promise<FileData>[] = files.map((file: FileData) => {
      let fileName = this.utils.GetJsonExtensionFromHtml(file.name);
      return this.fileService.ReadJson(data.config.cwd, fileName)
        .then((rslt: string) => {
          file.data = rslt;
          return file;
        })
    })
    return Promise.all(operations);
  }

  private CombineResults = (allFiles: FileData[], htmlFiles: FileData[]): FileData[] => {
    let files: FileData[] = allFiles.filter(file => file.type != "html" && file.type != 'dynamic.html');
    return htmlFiles.concat(files);
  }

}