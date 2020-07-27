import "reflect-metadata";
import { injectable } from "inversify";
import { RepositoryContext, IRepository, Repository } from "json-repo";
import { IQueryAdapter } from "./query.adapter";
import { QueryModel } from "../models/query-model";

interface JsonRepoAdapterConfig {
  dataPath: string;
  models: string[];
}

@injectable()
export class JsonRepoAdapter implements IQueryAdapter {

  protected context: DynamicJsonRepoContext;

  constructor(config: JsonRepoAdapterConfig) {
    this.context = new DynamicJsonRepoContext(config.dataPath, config.models);
  }

  openConnection = (): Promise<void> => {
    return this.context.initialize().then(_ => {
      this._open = Promise.resolve();
    })
  }

  run = (query: QueryModel): Promise<any> => {
    return this.open().then(_ => {
      if (!query.path) throw new Error("Query parameter missing");
      if (!this.context.models[query.path]) {
        throw new Error(`Model '${query.path}' not found, please check configuration.`);
      }
      let result;
      if (!Array.isArray(query.args) || !query.args[0] || query.args[0] == "*") {
        result = this.getAllEntities(query.path); 
      }
      else result = this.filterEntities(query);
      if (query.sort) result = this.sortEntities(query, result);
      if (query.limit) result = this.limitEntities(query, result);
      return result;
    });
  }

  private _open: Promise<void>;
  private open = (): Promise<void> => {
    if (this._open) return this._open;
    return this.openConnection();
  }

  private getAllEntities = (model: string) => {
    return this.context.models[model].filter(x => !!x);
  }

  private filterEntities = (query: QueryModel) => {
    let prop = query.args[0];
    let val = query.args[1];
    return this.context.models[query.path].filter(x => x[prop] == val);
  }

  private sortEntities = (query: QueryModel, entities: any[]) => {
    let key = query.sort.key;
    let result = entities.sort((a, b) => a[key] < b[key] ? -1 : 1);
    if (query.sort.descending) result = result.reverse();
    return result;
  }

  private limitEntities = (query: QueryModel, entities: any[]) => {
    if (entities.length <= query.limit) return entities;
    return entities.slice(0, query.limit);
  }

}

class DynamicJsonRepoContext extends RepositoryContext {
  
  models: {[model: string]: IRepository<any>} = {};

  constructor(dataPath: string, models: string[]) {
    super(dataPath);
    models.forEach(model => this.models[model] = new Repository());
  }

}