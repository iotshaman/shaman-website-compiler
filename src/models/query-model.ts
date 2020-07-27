export class QueryModel {
  name: string;
  path: string;
  dynamic?: boolean;
  args?: any[] | {};
  limit?: number;
  sort?: { key: string, descending?: boolean };
}