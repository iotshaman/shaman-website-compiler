import { WebsiteConfig, WebpageDefaults } from '../config/website.config';
import * as Promise from 'promise';

export class CompilerConfig {
    glob: (patterns: string[]) => Promise<string[]>;
    fsx: any;
    handlebars: any;
    minify: (contents: string) => any;
    minifyCss: (contents: string) => any;
    cwd: string;
    partials: string[];
    pages: string[];
    defaults: WebpageDefaults;
    scripts?: string[];
    styles?: string[];
    isProd?: boolean;
    outDir?: string;
    wwwRoot: string;
}