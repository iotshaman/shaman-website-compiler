import { WebsiteConfig, WebpageDefaults } from '../config/website.config';
import * as Promise from 'promise';

export class TemplateEngineConfig {
    fsx: any;
    handlebars: any;
    cwd: string;
    defaults: WebpageDefaults;
    pages: string[];
    partials?: string[];
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
}