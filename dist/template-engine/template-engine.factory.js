"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob_factory_1 = require("../glob-factory/glob.factory");
var template_engine_1 = require("./template-engine");
function TemplateEngineFactory(config) {
    var glob = glob_factory_1.GlobFactory({ cwd: config.cwd });
    var handlebars = require('handlebars');
    registerHandlebarsHelpers(handlebars);
    return template_engine_1.TemplateEngine({
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
exports.TemplateEngineFactory = TemplateEngineFactory;
function registerHandlebarsHelpers(handlebars) {
    handlebars.registerHelper('raw-block', function (options) {
        return options.fn(this);
    });
    handlebars.registerHelper('equals', function (item1, item2, options) {
        if (item1 == item2) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('isNullOrEmpty', function (item, options) {
        if (!item) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    handlebars.registerHelper('isNotNullOrEmpty', function (item, options) {
        if (!!item) {
            return options.fn(this);
        }
        else {
            return options.inverse(this);
        }
    });
    return handlebars;
}
exports.registerHandlebarsHelpers = registerHandlebarsHelpers;
//# sourceMappingURL=template-engine.factory.js.map