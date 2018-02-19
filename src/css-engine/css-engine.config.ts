import { WebsiteConfig, WebpageDefaults } from '../config/website.config';
import * as Promise from 'promise';

export class CssEngineConfig {
    fsx: any;
    cwd: string;
    minify: any;
    styles: string[];
    isProd?: boolean;
}