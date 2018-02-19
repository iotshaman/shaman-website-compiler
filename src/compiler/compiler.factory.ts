import { WebsiteConfig } from '../config/website.config';
import { GlobFactory } from '../glob-factory/glob.factory';
import { ShamanWebsiteCompiler } from './compiler';
import * as Promise from 'promise';

export function ShamanWebsiteCompilerFactory(config: WebsiteConfig) {
    var glob = GlobFactory({ cwd: config.cwd });
    return ShamanWebsiteCompiler({ 
        glob: glob, 
        fsx: require('fs-extra'),
        handlebars: require('handlebars'),
        minify: require('uglify-es').minify,
        minifyCss: require('clean-css'),
        cwd: config.cwd,
        partials: config.partials,
        pages: config.pages,
        defaults: config.defaults,
        scripts: config.scripts,
        styles: config.styles,
        isProd: config.isProd,
        express: config.express
    });
}