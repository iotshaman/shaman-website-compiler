import "reflect-metadata";
import { MongoClient, Db } from 'mongodb';
import { injectable } from "inversify";
import { IQueryAdapter } from "./query.adapter";
import { QueryModel } from "../models/query-model";

interface MongoAdapterConfig {
  mongoUri: string;
  options: any;
}

@injectable()
export class MongoAdapter implements IQueryAdapter {

  client: Db;

  constructor(private config: MongoAdapterConfig) { }

  /* istanbul ignore next */
  openConnection = (): Promise<void> => {
    const client = new MongoClient(this.config.mongoUri, this.config.options);
    return client.connect().then(_ => client.db()).then(db => {
      this.client = db;
    })
  }

  run = (query: QueryModel): Promise<any[]> => {
    return this.open().then(_ => this.client.collection(query.path))
      .then(collection => collection.find(query.args).toArray())
      .then(result => {
        if (query.sort) result = this.sortEntities(query, result);
        if (query.limit) result = this.limitEntities(query, result);
        return result;
      })
  }

  private open = (): Promise<void> => {
    if (this.client) return Promise.resolve();
    return this.openConnection();
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