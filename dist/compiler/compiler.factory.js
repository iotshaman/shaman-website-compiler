"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob_factory_1 = require("../glob-factory/glob.factory");
var compiler_1 = require("./compiler");
var template_engine_factory_1 = require("../template-engine/template-engine.factory");
function ShamanWebsiteCompilerFactory(config) {
    var glob = glob_factory_1.GlobFactory({ cwd: config.cwd });
    return compiler_1.ShamanWebsiteCompiler({
        glob: glob,
        fsx: require('fs-extra'),
        handlebars: template_engine_factory_1.registerHandlebarsHelpers(require('handlebars')),
        minify: require('uglify-es').minify,
        minifyCss: require('clean-css'),
        gaze: require('gaze'),
        cwd: config.cwd,
        partials: config.partials,
        pages: config.pages,
        defaults: config.defaults,
        scripts: config.scripts,
        styles: config.styles,
        isProd: config.isProd,
        outDir: config.outDir,
        wwwRoot: config.wwwRoot,
        noHtmlSuffix: config.noHtmlSuffix,
        autoWatch: config.autoWatch,
        transformData: config.transformData
    });
}
exports.ShamanWebsiteCompilerFactory = ShamanWebsiteCompilerFactory;
//# sourceMappingURL=compiler.factory.js.map