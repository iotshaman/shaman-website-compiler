import { WebsiteConfig, WebpageDefaults, DynamicPage } from '../config/website.config';
import * as Promise from 'promise';

export class CompilerConfig {
    glob: (patterns: string[]) => Promise<string[]>;
    fsx: any;
    handlebars: any;
    minify: (contents: string) => any;
    minifyCss: (contents: string) => any;
    gaze: (pattern: string | string[], callback: any) => void;
    cwd: string;
    partials: string[];
    pages: string[];
    defaults: WebpageDefaults;
    dynamicPages?: DynamicPage[];
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
    outDir?: string;
    wwwRoot?: string;
    noHtmlSuffix?: boolean;
    autoWatch?: boolean;
    transformData?: (path: string) => any;
}