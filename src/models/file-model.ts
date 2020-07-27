import { Bundle } from "./bundle";
import { QueryModel } from "./query-model";

export class FileModel {
  [property: string]: any;
  route?: string;
  shaman?: FileModelConfig;
}

export class FileModelConfig {
  dynamic?: { path: string, key: string };
  query?: QueryModel[];
  bundles?: Bundle[];
}