"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var template_engine_1 = require("../template-engine/template-engine");
var javascript_engine_1 = require("../javascript-engine/javascript-engine");
var css_engine_1 = require("../css-engine/css-engine");
var Promise = require("promise");
var compiler_engine_1 = require("./compiler.engine");
function ShamanWebsiteCompiler(config) {
    return {
        compile: function () { return compileWebsite(config); }
    };
}
exports.ShamanWebsiteCompiler = ShamanWebsiteCompiler;
function compileWebsite(config) {
    return loadFileDataFromGlobs(config).then(function (globMap) {
        return loadCompilerEngines(config, globMap);
    }).then(function (engines) {
        return compiler_engine_1.CompilerEngine(engines);
    });
}
exports.compileWebsite = compileWebsite;
// LOAD FILE FROM GLOB CONFIG
function loadFileDataFromGlobs(config) {
    var globOperations = [
        loadGlobData(config.glob, 'pages', config.pages),
        loadGlobData(config.glob, 'partials', config.partials),
        loadGlobData(config.glob, 'styles', config.styles),
        loadGlobData(config.glob, 'scripts', config.scripts),
    ];
    return Promise.all(globOperations).then(function (globs) {
        return mapGlobData(globs);
    });
}
exports.loadFileDataFromGlobs = loadFileDataFromGlobs;
function loadGlobData(glob, name, pattern) {
    return glob(pattern).then(function (files) {
        return { name: name, files: files };
    });
}
exports.loadGlobData = loadGlobData;
function mapGlobData(globs) {
    var map = {};
    for (var i = 0; i < globs.length; i++) {
        map[globs[i].name] = globs[i].files;
    }
    return map;
}
exports.mapGlobData = mapGlobData;
// LOAD ENGINES
function loadCompilerEngines(config, globMap) {
    var engines = {
        templateEngine: template_engine_1.TemplateEngine({
            fsx: config.fsx,
            handlebars: config.handlebars,
            cwd: config.cwd,
            defaults: config.defaults,
            pages: !globMap['pages'] ? [] : globMap['pages'],
            partials: !globMap['partials'] ? [] : globMap['partials'],
            styles: !globMap['styles'] ? [] : globMap['styles'],
            scripts: !globMap['scripts'] ? [] : globMap['scripts'],
            isProd: config.isProd
        }),
        javascriptEngine: javascript_engine_1.JavascriptEngine({
            fsx: config.fsx,
            minify: config.minify,
            cwd: config.cwd,
            scripts: !globMap['scripts'] ? [] : globMap['scripts'],
            isProd: config.isProd
        }),
        cssEngine: css_engine_1.CssEngine({
            fsx: config.fsx,
            minify: config.minifyCss,
            cwd: config.cwd,
            styles: !globMap['styles'] ? [] : globMap['styles'],
            isProd: config.isProd
        })
    };
    return engines;
}
exports.loadCompilerEngines = loadCompilerEngines;
//# sourceMappingURL=compiler.js.map