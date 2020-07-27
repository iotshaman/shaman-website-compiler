import { EventHandler } from "./event-handler";
import { IoC, TYPES } from "../composition/app.composition";
import { minify as _minify } from 'html-minifier';
import { IHandlebarsService } from "../services/handlebars.service";
import { FileData } from "../models";
import { LogLevels } from "../logger";
import { DynamicRoute } from "../models/dynamic-route";
import { IQueryAdapter } from "../adapters";

export class HtmlContentHandler extends EventHandler {

  minify = _minify;
  public event: string = 'file-model-processed';
  private handlebarsService: IHandlebarsService;
  private queryAdapter: IQueryAdapter;
  private minifyOptions = { collapseWhitespace: true }

  constructor() {
    super();
    this.handlebarsService = IoC.get<IHandlebarsService>(TYPES.HandlebarsService);
    this.queryAdapter = IoC.get<IQueryAdapter>(TYPES.QueryAdapter);
  }

  processEvent = (file: FileData): Promise<void> => {
    if (file.extension != 'html') return Promise.resolve();
    if (file.model.shaman.dynamic) return this.processDynamicFiles(file);
    let options = this.minifyOptions;
    this.context.models.files.update(file.name, f => {
      f.content = this.handlebarsService.renderTemplate(file, null, file.query);
      if (!!this.config.production) f.content = this.minify(f.content, options);
      return f;
    });
    return this.context.saveChanges().then(_ => this.alertFileAvailable(file));
  }

  private processDynamicFiles = (file: FileData): Promise<void> => {
    let query = file.model.shaman.query.find(q => q.dynamic);
    if (!query) {
      let err = `File '${file.name}' was marked as dynamic, but no queries were found.`;
      return this.dynamicWarning(err, file);
    }
    return this.queryAdapter.run(query).then(models => {
      if (models.length == 0) {
        let err = `File '${file.name}' was marked as dynamic, but no models were found.`;
        return this.dynamicWarning(err, file);
      }      
      models.forEach(model => this.processDynamicFile(file, model));
      return this.context.saveChanges().then(_ => this.alertFileAvailable(file));
    });
  }

  private processDynamicFile = (file: FileData, model: any): void => {
    const options = this.minifyOptions;
    const path = file.model.shaman.dynamic.path;
    const key = file.model.shaman.dynamic.key;
    let route = new DynamicRoute();
    route.path = `${path}${model[key]}`;
    route.file = file.name;
    route.content = this.handlebarsService.renderTemplate(file, model);
    if (!!this.config.production) route.content = _minify(route.content, options);
    this.context.models.dynamicRoutes.upsert(route.path, route);
  }

  private dynamicWarning = (message: string, file: FileData) => {
    this.logger.log(message, LogLevels.warn);
    return this.alertFileAvailable(file)
  }

}