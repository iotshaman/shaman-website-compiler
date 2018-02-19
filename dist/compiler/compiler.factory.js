"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var glob_factory_1 = require("../glob-factory/glob.factory");
var compiler_1 = require("./compiler");
function ShamanWebsiteCompilerFactory(config) {
    var glob = glob_factory_1.GlobFactory({ cwd: config.cwd });
    return compiler_1.ShamanWebsiteCompiler({
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
exports.ShamanWebsiteCompilerFactory = ShamanWebsiteCompilerFactory;
//# sourceMappingURL=compiler.factory.js.map