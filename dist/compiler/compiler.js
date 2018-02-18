"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var template_engine_1 = require("../template-engine/template-engine");
var Promise = require("promise");
function ShamanWebsiteCompiler(config) {
    return {
        compile: function () { return compileWebsite(config); }
    };
}
exports.ShamanWebsiteCompiler = ShamanWebsiteCompiler;
function compileWebsite(config) {
    return loadFileDataFromGlobs(config).then(function (globMap) {
        return loadCompilerEngines(config, globMap);
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
            scripts: !globMap['scripts'] ? [] : globMap['scripts']
        })
    };
    return engines.templateEngine.generateFileOutput().then(function (data) {
        return data;
    });
}
exports.loadCompilerEngines = loadCompilerEngines;
//# sourceMappingURL=compiler.js.map