import { AdapterConfig } from "../models";
import { IQueryAdapter } from "../adapters";

export function RequireAdapter(config: AdapterConfig): IQueryAdapter {
  const Adapter = require(config.module)[config.name];
  return new Adapter(config.configuration);
}