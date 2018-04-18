import { WebsiteConfig, WebpageDefaults } from '../config/website.config';
import * as Promise from 'promise';

export class JavascriptEngineConfig {
    fsx: any;
    cwd: string;
    minify: any;
    scripts: string[];
    isProd?: boolean;
}