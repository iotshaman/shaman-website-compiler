"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var compiler_engine_1 = require("./compiler.engine");
var template_engine_1 = require("../template-engine/template-engine");
var javascript_engine_1 = require("../javascript-engine/javascript-engine");
var css_engine_1 = require("../css-engine/css-engine");
var Promise = require("promise");
var nodePath = require("path");
function ShamanWebsiteCompiler(config) {
    return {
        compile: function (express) { return compileWebsite(config, express); }
    };
}
exports.ShamanWebsiteCompiler = ShamanWebsiteCompiler;
function compileWebsite(config, express) {
    if (!config.outDir && !express) {
        var e = "Shaman compiler: Please specify 'outDir' or pass an express server as an input parameter";
        throw new Error(e);
    }
    return loadFileDataFromGlobs(config).then(function (globMap) {
        return loadCompilerEngines(config, globMap);
    }).then(function (engines) {
        return compiler_engine_1.CompilerEngine(engines);
    }).then(function (compilerEngine) {
        if (!!express) {
            return generateExpressRoutes(config, compilerEngine, express).then(function (routes) {
                express.all('*', routes);
                return;
            });
        }
        return compilerEngine.generateFileOutput().then(function (files) {
            return writeFilesToOutputDir(config, files);
        });
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
        return { name: name, files: sortFiles(files) };
    });
}
exports.loadGlobData = loadGlobData;
function sortFiles(globs) {
    return globs.sort(function (a, b) {
        return a.toUpperCase().localeCompare(b.toUpperCase());
    });
}
exports.sortFiles = sortFiles;
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
            isProd: config.isProd,
            wwwRoot: config.wwwRoot,
            noHtmlSuffix: config.noHtmlSuffix
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
// GENERATE NEW FILES IN OUTPUT DIRECTORY
function writeFilesToOutputDir(config, files) {
    var operations = files.map(function (file) {
        return config.fsx.outputFile(nodePath.join(config.outDir, file.name), file.contents);
    });
    return Promise.all(operations).then(function () {
        return;
    });
}
exports.writeFilesToOutputDir = writeFilesToOutputDir;
// CREATE EXPRESS ROUTES
var watching = false;
function generateExpressRoutes(config, compilerEngine, express) {
    return new Promise(function (res, err) {
        compilerEngine.generateExpressRoutes().then(function (map) {
            if (!!config.autoWatch && !watching) {
                watching = true;
                watchFiles(config, function () {
                    generateExpressRoutes(config, compilerEngine, express);
                });
            }
            return res(generateExpressMap(express, map));
        });
    });
}
exports.generateExpressRoutes = generateExpressRoutes;
var expressMap = function (req, res, next) { next('Not Implemented'); };
function generateExpressMap(express, map) {
    expressMap = function (req, res, next) {
        if (req.method == "GET" && !!map[req.url]) {
            map[req.url](req, res, next);
        }
        else {
            next();
        }
    };
    return expressMap;
}
exports.generateExpressMap = generateExpressMap;
// WATCH FILES
function watchFiles(config, callback) {
    return new Promise(function (res, err) {
        config.gaze(config.pages, function (ex, watcher) {
            if (ex)
                return err(ex);
            this.on('changed', function (filepath) {
                callback();
            });
            return res();
        });
    });
}
exports.watchFiles = watchFiles;
//# sourceMappingURL=compiler.js.map