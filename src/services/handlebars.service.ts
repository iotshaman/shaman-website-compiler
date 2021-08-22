import * as _handlebars from 'handlebars';
import * as _fsx from 'fs-extra';
import * as _moment from 'moment-timezone';
import { injectable } from 'inversify';
import { IoC, TYPES } from '../composition/app.composition';
import { WebsiteConfig, FileData } from '../models';
import { CreateBundleTags, CreateMinifiedBundleTags  } from '../functions/handlebars.functions';
import { CreateScript, CreateStyle } from '../functions/handlebars.functions';
import { ChangeExtension } from '../functions/file.functions';

export interface IHandlebarsService {
  registerPartials: (file: FileData[]) => FileData[];
  registerHelpers: (files: FileData[]) => Promise<void>;
  renderTemplate: (file: FileData, model?: any, query?: any) => string;
}

@injectable()
export class HandlebarsService implements IHandlebarsService {

  private config: WebsiteConfig

  constructor() {
    this.config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
    this.loadHandlebars();
    this.registerDefaultHelpers();
  }

  registerPartials = (files: FileData[]): FileData[] => {
    files.forEach(file => _handlebars.registerPartial(file.name, file.content));
    return files;
  }

  registerHelpers = (files: FileData[]): Promise<void> => {
    let operations = files.map(file => _fsx.readFile(file.path, "utf8"));
    return Promise.all(operations).then(contents => {
      contents.forEach(content => {
        let func = new Function('handlebars', 'moment', content);
        func(_handlebars, _moment);
      });
    })
  }

  renderTemplate = (file: FileData, model?: any, query?: any): string => {
    let compiler = _handlebars.compile(file.content);
    return compiler({ model: model || file.model, query: query });
  }

  private loadHandlebars = () => {
    this.config.handlebars(_handlebars);
  }

  /* istanbul ignore next */
  private registerDefaultHelpers = () => {
    let production = this.config.production;
    _handlebars.registerHelper('bundles', (bundles) => {
      if (!production) return CreateBundleTags(bundles);
      return CreateMinifiedBundleTags(bundles);
    });
    _handlebars.registerHelper('script', (name) => {
      if (production) name = ChangeExtension(name, 'js', 'min.js');
      return CreateScript(name);
    });
    _handlebars.registerHelper('style', (name) => {
      if (production) name = ChangeExtension(name, 'css', 'min.css');
      return CreateStyle(name);
    });
  }

}