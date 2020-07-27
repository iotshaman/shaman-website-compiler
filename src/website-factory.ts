import 'reflect-metadata';
import { Configure } from "./composition/app.composition";
import { WebsiteConfig } from "./models";
import { Website } from './website';

export function WebsiteFactory(config: WebsiteConfig) {
  Configure(new WebsiteConfig(config));
  return new Website();
}