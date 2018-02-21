"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob_factory_1 = require("../glob-factory/glob.factory");
var template_engine_1 = require("./template-engine");
function TemplateEngineFactory(config) {
    var glob = glob_factory_1.GlobFactory({ cwd: config.cwd });
    return template_engine_1.TemplateEngine({
        fsx: require('fs-extra'),
        handlebars: require('handlebars'),
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
//# sourceMappingURL=template-engine.factory.js.map