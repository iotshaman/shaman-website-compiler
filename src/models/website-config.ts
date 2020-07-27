import { injectable } from "inversify";
import { AdapterConfig } from "./adapter-config";
import { IQueryAdapter } from "../adapters";

export interface IWebsiteConfig {
  root?: string;
  logLevel?: string;
  production?: boolean;
  pages?: string[];
  partials?: string[];
  helpers?: string[];
  scripts?: string[];
  styles?: string[];
  assets?: string[];
  output?: string;
  serve?: boolean;
  sitemap?: SitemapConfig;
  adapter?: AdapterConfig;
  handlebars?: (handlebars: any) => void;
}

@injectable()
export class WebsiteConfig {

  root: string;
  logLevel?: string;
  production?: boolean;
  pages?: string[];
  partials?: string[];
  helpers?: string[];
  scripts?: string[];
  styles?: string[];
  assets?: string[];
  output?: string;
  serve?: boolean;
  sitemap?: SitemapConfig;
  adapter?: AdapterConfig;
  handlebars?: (handlebars: any) => void;

  constructor(config: IWebsiteConfig = {}) {
    this.root = config.root || "./src";
    this.logLevel = config.logLevel || "info";
    this.production = config.production || false;
    this.pages = config.pages || ["**/*.html", "!**/*.partial.html"];
    this.partials = config.partials || ["**/*.partial.html"];
    this.helpers = config.helpers || ["**/*.helper.js"],
    this.scripts = config.scripts || ["**/*.js", "!**/*.helper.js"];
    this.styles = config.styles || ["**/*.css"];
    this.assets = config.assets || this.assetGlobs;
    this.output = config.output;
    this.serve = config.serve || !config.production;
    this.sitemap = config.sitemap || { hostname: 'http://localhost:3000/' };
    this.adapter = config.adapter || this.defaultAdapter;
    if (!this.adapter.module) this.adapter.module = this.defaultAdapter.module;
    this.handlebars = config.handlebars || function() {};
  }

  private assetGlobs: string[] = [
    "**/*.png", 
    "**/*.svg", 
    "**/*.ico", 
    "**/*.jpg",
    "**/*.jpeg"
  ]

  private get defaultAdapter(): AdapterConfig {
    let config = new AdapterConfig();
    config.module = 'shaman-factory';
    config.name = 'JsonRepoAdapter';
    config.configuration = { dataPath: null, models: [] };
    return config;
  }

}

export class SitemapConfig {
  hostname: string;
}