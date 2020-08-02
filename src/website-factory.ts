import 'reflect-metadata';
import { Configure } from "./composition/app.composition";
import { WebsiteConfig } from "./models";
import { Website } from './website';

export function WebsiteFactory(config: WebsiteConfig) {
  if (process.argv.includes("--prod", 2)) config.production = true;
  Configure(new WebsiteConfig(config));
  return new Website();
}