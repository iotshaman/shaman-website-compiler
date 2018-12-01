import { IOC, IOC_TYPES } from '../../inversify';
import * as Promise from 'promise';
import { injectable } from 'inversify';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { IGlobService } from '../../globs';
import { IGlobOptions } from '../../globs/glob-options.model';
import { FileUtils, FileData } from '../../files';

@injectable()
export class GlobLoader extends CompilerState {

  public state: string = 'load-globs';
  private globService: IGlobService;
  private utils = FileUtils;

  constructor() {
    super();
    this.globService = IOC.get<IGlobService>(IOC_TYPES.GlobService);
  }

  Process(data: CompilerData) {
    this.LoadGlobsFromPatterns(data)
      .then(this.utils.ReduceFileData)
      .then((rslt: FileData[]) => {
        data.state = 'load-files';
        data.files = rslt;
        this.ChangeCompilerState(data);
      })
      .catch((ex: any) => {
        this.CompilerError(new Error(ex));
      })
  }

  private LoadGlobsFromPatterns = (data: CompilerData): Promise<FileData[][]> => {
    let options: IGlobOptions = { cwd: data.config.cwd };
    let operations: Promise<FileData[]>[] = [
      this.globService.GetFilesFromGlob(data.config.pages, 'html', options),
      this.globService.GetFilesFromGlob(data.config.partials, 'partial.html', options),
      this.globService.GetFilesFromGlob(data.config.styles, 'css', options),
      this.globService.GetFilesFromGlob(data.config.scripts, 'js', options),
      this.globService.GetFilesFromGlob(data.config.dynamics, 'dynamic.html', options)
    ]
    return Promise.all(operations);
  }

}