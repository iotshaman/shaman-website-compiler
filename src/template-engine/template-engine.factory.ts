import { WebsiteConfig } from '../config/website.config';
import { GlobFactory } from '../glob-factory/glob.factory';
import { TemplateEngine } from './template-engine';
import * as Promise from 'promise';

export function TemplateEngineFactory(config: WebsiteConfig) {
    var glob = GlobFactory({ cwd: config.cwd });
    var handlebars = require('handlebars');
    registerHandlebarsHelpers(handlebars);
    return TemplateEngine({ 
        fsx: require('fs-extra'),        
        handlebars: handlebars,
        cwd: config.cwd,
        defaults: config.defaults,
        pages: config.pages,
        partials: config.partials,
        styles: config.styles,
        scripts: config.scripts,
        wwwRoot: config.wwwRoot
    });
}

export function registerHandlebarsHelpers(handlebars) {
    handlebars.registerHelper('raw-block', function(options) {
        return options.fn(this);
    });
    return handlebars;
}