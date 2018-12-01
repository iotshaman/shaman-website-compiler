import { IOC, IOC_TYPES } from '../../inversify';
import { injectable } from 'inversify';
import * as Handlebars from 'handlebars';
import * as DefaultHelpers from '../../../handlebars/default-helpers';
import { CompilerState } from '../compiler-state';
import { CompilerData } from '../../compiler/compiler-data.model';
import { FileUtils } from '../../files';
import { FileData } from '../../files/file-data.model';
import * as Promise from 'promise';

@injectable()
export class Renderer extends CompilerState {

  handlebars: any = Handlebars;
  public state: string = 'render';

  constructor() {
    super();
  }

  Process(data: CompilerData) {
    this.LoadPlugins(data);
    this.LoadHelpers(data);
    this.LoadPartials(data);
    data.files = this.RenderTemplates(data);
    data.state = 'finish';
    this.ChangeCompilerState(data);
  }

  private LoadPlugins = (data: CompilerData): void => {
    if (!data.config.handlebarsPlugin) return;
    data.config.handlebarsPlugin(this.handlebars, data);
  }

  private LoadHelpers = (data: CompilerData): void => {
    DefaultHelpers(this.handlebars, data);
  }

  private LoadPartials = (data: CompilerData): void => {
    let files = data.files.filter(file => file.type == 'partial.html');
    for (var i = 0; i < files.length; i++) {
      this.handlebars.registerPartial(files[i].name, files[i].contents);
    }
  }

  private RenderTemplates = (data: CompilerData): FileData[]=> {
    return data.files.map((file: FileData) => {
      if (file.type != "html") return file;
      let compiler = this.handlebars.compile(file.contents);
      file.contents = compiler({ compiler: data, model: file.data });
      return file;
    });

  }

}