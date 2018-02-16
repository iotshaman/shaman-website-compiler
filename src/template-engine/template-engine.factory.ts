import { WebsiteConfig } from '../config/website.config';
import { GlobFactory } from '../glob-factory/glob.factory';
import { TemplateEngine } from './template-engine';
import * as Promise from 'promise';

export function TemplateEngineFactory(config: WebsiteConfig) {
    var glob = GlobFactory({ cwd: config.cwd });
    return TemplateEngine({ 
        glob: glob, 
        config: config,
        fsx: require('fs-extra'),
        handlebars: require('handlebars')
    });
}