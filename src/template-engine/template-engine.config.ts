import { WebsiteConfig } from '../config/website.config';
import * as Promise from 'promise';

export class TemplateEngineConfig {
    glob: (patterns: string[]) => Promise<string[]>;
    config: WebsiteConfig;
    fsx: any;
    handlebars: any;
}