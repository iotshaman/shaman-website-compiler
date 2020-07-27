import { IoC, TYPES } from "../composition/app.composition";
import { EventHandler } from "./event-handler";
import { FileData, Bundle } from "../models";
import { IQueryAdapter } from "../adapters";

export class ProcessModelHandler extends EventHandler {

  public event: string = 'file-model-added';
  private queryAdapter: IQueryAdapter;

  constructor() {
    super();    
    this.queryAdapter = IoC.get<IQueryAdapter>(TYPES.QueryAdapter);
  }

  processEvent = (file: FileData): Promise<void> => {
    if (file.extension != "html") return Promise.resolve();
    return this.addBundlesToDatabase(file)
      .then(_ => this.updateQueryData(file))
      .then(_ => {
        this.logger.log(`Model has been processed for file '${file.name}'.`);
        this.eventService.publish('file-model-processed', file);
      });
  }

  private addBundlesToDatabase = (file: FileData): Promise<void> => {
    file.model.shaman.bundles.forEach(b => {
      let bundle = new Bundle(b);
      if (this.config.production) bundle.extension = `min.${b.type}`;
      this.context.models.bundles.upsert(b.name, bundle);
    });
    return this.context.saveChanges();
  }

  private updateQueryData = (file: FileData): Promise<void> => {
    let queries = file.model.shaman.query.filter(q => !q.dynamic);
    let operations = queries.map(q => {
      return this.queryAdapter.run(q).then(rslt => ({name: q.name, rslt: rslt}));
    });
    return Promise.all(operations).then(rslt => {
      file.query = rslt.reduce((a, b) => { a[b.name] = b.rslt; return a }, {});
      this.context.models.files.update(file.name, f => {
        f.query = file.query;
        return f;
      });
      return this.context.saveChanges();
    });
  }
}