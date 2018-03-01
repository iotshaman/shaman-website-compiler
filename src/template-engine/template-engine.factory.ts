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
    handlebars.registerHelper('equals', function(item1, item2, options) {
        if (item1 == item2) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('isNullOrEmpty', function(item, options) {
        if (!item) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('isNotNullOrEmpty', function(item, options) {
        if (!!item) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
    return handlebars;
}