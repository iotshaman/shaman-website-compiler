import { WebsiteConfig, WebpageDefaults, DynamicPage } from '../config/website.config';
import * as Promise from 'promise';

export class TemplateEngineConfig {
    fsx: any;
    handlebars: any;
    cwd: string;
    defaults: WebpageDefaults;
    pages: string[];
    dynamicPages?: DynamicPage[];
    partials?: string[];
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
    wwwRoot?: string;
    noHtmlSuffix?: boolean;
    transformData?: (path: string) => any;
}