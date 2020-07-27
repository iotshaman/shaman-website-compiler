import "reflect-metadata";
import * as _http from 'http';
import * as _https from 'https';
import { injectable } from "inversify";
import { IQueryAdapter } from "./query.adapter";
import { QueryModel } from "../models/query-model";

interface HttpAdapterConfig {
  apiBaseUri: string;
}

@injectable()
export class HttpAdapter implements IQueryAdapter {

  constructor(private config: HttpAdapterConfig) { }

  openConnection = (): Promise<void> => {
    return Promise.resolve();
  }

  run = (query: QueryModel): Promise<any> => {
    return this.httpRequest(query).then(result => {
      if (query.sort) result = this.sortEntities(query, result);
      if (query.limit) result = this.limitEntities(query, result);
      return result;
    })
  }

  private httpRequest = (query: QueryModel): Promise<any> => {
    return new Promise((res, err) => {
      let lib = this.config.apiBaseUri.startsWith('https') ? _https : _http;
      const request = lib.get(`${this.config.apiBaseUri}${query.path}`, response => {
        if (response.statusCode < 200 || response.statusCode > 299) { 
          err(new Error(response.statusMessage));
        }
        const body = [];
        response.on('data', chunk => body.push(chunk));
        response.on('end', (_: any) => res(JSON.parse(body.join(''))))
      });
      request.on('error', ex => err(ex));
    });
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