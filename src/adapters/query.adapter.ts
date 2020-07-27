import { QueryModel } from "../models/query-model";

export interface IQueryAdapter {
  openConnection: () => Promise<void>;
  run: (query: QueryModel) => Promise<any[]>;
}