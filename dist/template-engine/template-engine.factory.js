"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob_factory_1 = require("../glob-factory/glob.factory");
var template_engine_1 = require("./template-engine");
function TemplateEngineFactory(config) {
    var glob = glob_factory_1.GlobFactory({ cwd: config.cwd });
    return template_engine_1.TemplateEngine({
        glob: glob,
        config: config,
        fsx: require('fs-extra'),
        handlebars: require('handlebars')
    });
}
exports.TemplateEngineFactory = TemplateEngineFactory;
//# sourceMappingURL=template-engine.factory.js.map