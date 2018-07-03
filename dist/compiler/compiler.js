"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var compiler_runtime_1 = require("./compiler.runtime");
var glob_data_1 = require("../glob-data");
var file_contents_1 = require("../file-contents");
var file_model_1 = require("../file-model");
var handlebars_1 = require("../handlebars");
var nodePath = require("path");
var ShamanWebsiteCompiler = /** @class */ (function () {
    function ShamanWebsiteCompiler(config) {
        var _this = this;
        this.compiled = false;
        this.compile = function () {
            _this.lastModified = new Date((new Date()).toUTCString());
            return Promise.resolve()
                .then(_this.loadRuntimeFiles)
                .then(_this.loadRuntimeContent)
                .then(_this.bundleRuntimeContent)
                .then(_this.loadRuntimeModels)
                .then(_this.transformRuntimeModels)
                .then(_this.transformDynamicRuntimeModels)
                .then(_this.loadHandlebarsResources)
                .then(_this.compileHandlebarsTemplates)
                .then(_this.addAssetRoutes)
                .then(_this.transformRouteNames)
                .then(_this.loadRouteMap)
                .then(function () {
                _this.finishCompilation();
                return _this.runtime;
            });
        };
        this.updateTransform = function (transform) {
            _this.transformModels = transform;
        };
        this.router = function (req, res, next) {
            if (!_this.runtime.routes) {
                next();
                return;
            }
            else if (req.method == "GET" && req.url == '/') {
                _this.loadExpressRoute(req, res, next, '/index', null);
                return;
            }
            else if (req.method == "GET" && _this.runtime.routeMap[req.url] != null) {
                _this.loadExpressRoute(req, res, next, req.url, null);
                return;
            }
            else if (_this.isProd && req.method == "GET" && req.url.indexOf('swc.bundle.min.js') > -1) {
                _this.loadExpressRoute(req, res, next, req.url, 'js');
                return;
            }
            else if (_this.isProd && req.method == "GET" && req.url.indexOf('swc.bundle.min.css') > -1) {
                _this.loadExpressRoute(req, res, next, req.url, 'css');
                return;
            }
            else if (req.method == 'GET' && req.url == '/env/rebuild') {
                _this.compile();
                res.json({ status: 'success' });
                return;
            }
            next();
            return;
        };
        this.loadRuntimeFiles = function () {
            return glob_data_1.loadFileNamesFromGlobs(_this.runtime, _this.glob)
                .then(function (files) {
                _this.runtime.files = files;
                return;
            });
        };
        this.loadRuntimeContent = function () {
            return file_contents_1.loadFileContents(_this.runtime, _this.dynamicPages, _this.fsx)
                .then(function (contents) {
                _this.runtime.contents = contents;
                return;
            });
        };
        this.bundleRuntimeContent = function () {
            return new Promise(function (res) {
                if (!_this.isProd)
                    res();
                var bundles = file_contents_1.bundleFileContents(_this.runtime, _this.objectHash, _this.minify, _this.minifyCss);
                _this.runtime.contents = _this.runtime.contents.concat(bundles);
                res();
            });
        };
        this.loadRuntimeModels = function () {
            return file_model_1.loadFileDataModels(_this.runtime, _this.fsx)
                .then(function (models) {
                _this.runtime.models = models;
                return;
            });
        };
        this.transformRuntimeModels = function () {
            return file_model_1.transformFileData(_this.runtime, _this.transformModels)
                .then(function (models) {
                _this.runtime.models = models;
                return;
            });
        };
        this.transformDynamicRuntimeModels = function () {
            return file_model_1.transformDynamicFileData(_this.runtime, _this.dynamicPages, _this.transformModels)
                .then(function (models) {
                _this.runtime.models = models;
                return;
            });
        };
        this.loadHandlebarsResources = function () {
            return new Promise(function (res) {
                handlebars_1.registerHandlebars(_this.runtime, _this.handlebars);
                if (!!_this.handlebarsHelpers)
                    _this.handlebarsHelpers(_this.handlebars);
                res();
            });
        };
        this.compileHandlebarsTemplates = function () {
            return handlebars_1.compileTemplates(_this.runtime, _this.handlebars, _this.dynamicPages)
                .then(function (routes) {
                _this.runtime.routes = routes;
                return;
            });
        };
        this.addAssetRoutes = function () {
            return new Promise(function (res) {
                var assets = _this.runtime.contents.filter(function (file) {
                    if (_this.isProd)
                        return file.type.indexOf('.bundle.hash') > -1;
                    return file.type == 'css' || file.type == 'js';
                });
                _this.runtime.routes = _this.runtime.routes.concat(assets);
                res();
            });
        };
        this.transformRouteNames = function () {
            return new Promise(function (res) {
                if (!_this.wwwRoot) {
                    res();
                    return;
                }
                _this.runtime.routes = _this.runtime.routes.map(function (route) {
                    route.name = "/" + route.name.replace(_this.wwwRoot, '');
                    return route;
                });
                res();
                return;
            });
        };
        this.loadRouteMap = function () {
            return new Promise(function (res) {
                _this.runtime.routeMap = _this.runtime.routes.reduce(function (a, b, i) {
                    a[b.name] = i;
                    return a;
                }, {});
                res();
            });
        };
        this.finishCompilation = function () {
            var cleanup = [];
            if (!_this.compiled && _this.autoWatch) {
                var watchFiles = _this.getWatchFileList();
                cleanup.push(_this.beginWatchFiles(watchFiles, _this.compile));
            }
            if (_this.outDir != '') {
                _this.outputFilesToDirectory();
            }
            Promise.all(cleanup);
            _this.compiled = true;
            console.log('Compilation complete!');
        };
        this.beginWatchFiles = function (fileList, callback) {
            return new Promise(function (res, err) {
                _this.gaze(fileList, function (ex, watcher) {
                    if (ex)
                        return err(ex);
                    this.on('changed', function () {
                        console.log('Updating express routes...');
                        callback();
                    });
                    return res();
                });
            });
        };
        this.outputFilesToDirectory = function () {
            var operations = _this.runtime.routes.map(function (file) {
                var path = nodePath.join(_this.outDir, file.name);
                if (file.type == 'router.html') {
                    path = path + ".html";
                }
                return _this.fsx.outputFile(path, file.contents);
            });
            return Promise.all(operations).then(function () {
                return;
            });
        };
        this.loadExpressRoute = function (req, res, next, path, bundleType) {
            if (!!req.headers && !!req.headers['if-modified-since']) {
                if (_this.lastModified <= new Date(req.headers['if-modified-since'])) {
                    res.status(304).send('Not Modified');
                    return;
                }
            }
            var route = [];
            if (!bundleType) {
                route = _this.runtime.routes.filter(function (file) {
                    return file.name == path;
                });
            }
            else {
                route = _this.runtime.routes.filter(function (file) {
                    return file.type == bundleType + ".bundle.hash";
                });
            }
            if (!route || route.length == 0) {
                next();
                return;
            }
            return _this.sendResponse(route[0].contents, route[0].type, res);
        };
        this.sendResponse = function (content, contentType, res) {
            var mimeType = _this.getMimeType(contentType);
            var cacheInterval = _this.cacheIntervals[mimeType];
            _this.applyHttpHeaders(mimeType, cacheInterval, res);
            res.write(content);
            res.end();
            return;
        };
        this.applyHttpHeaders = function (mimeType, cacheInterval, res) {
            if (!!cacheInterval && cacheInterval != -1) {
                _this.applyCacheHeaders(cacheInterval, res);
            }
            else if (!cacheInterval && !!_this.cacheIntervals['*']) {
                if (_this.cacheIntervals['*'] != -1) {
                    _this.applyCacheHeaders(_this.cacheIntervals['*'], res);
                }
            }
            res.writeHead(200, { 'Content-Type': mimeType });
        };
        this.getMimeType = function (contentType) {
            if (contentType.indexOf('css') > -1)
                return 'text/css';
            if (contentType.indexOf('js') > -1)
                return 'text/javascript';
            if (contentType.indexOf('html') > -1)
                return 'text/html';
            return 'text/plain';
        };
        this.getWatchFileList = function () {
            if (!_this.runtime)
                return [];
            var rslt = _this.runtime.files.pages.concat(_this.runtime.files.scripts);
            rslt = rslt.concat(_this.runtime.files.styles);
            rslt = rslt.concat(_this.runtime.files.partials);
            rslt = rslt.concat(_this.dynamicPages.map(function (page) {
                return page.template;
            }));
            return rslt.map(function (path) {
                return nodePath.join(_this.runtime.cwd, path);
            });
        };
        if (!config.cwd)
            throw new Error('Must provide current working directory (cwd) in config.');
        this.glob = glob_data_1.GlobFactory({ cwd: config.cwd });
        this.fsx = require('fs-extra');
        this.handlebars = require('handlebars');
        this.minify = require('uglify-es').minify;
        this.minifyCss = require('clean-css');
        this.gaze = require('gaze');
        var hashFactory = require('node-object-hash');
        this.objectHash = hashFactory({ sort: true, coerce: true }).hash;
        this.setDefaults(config);
    }
    ShamanWebsiteCompiler.prototype.setDefaults = function (config) {
        this.runtime = new compiler_runtime_1.CompilerRuntime(config.isProd);
        this.runtime.cwd = config.cwd;
        this.runtime.globs = {
            pages: !!config.pages ? config.pages : ['**/*.html', '!**/*.partial.html', '!**/*.dynamic.html'],
            partials: !!config.partials ? config.partials : ['**/*.partial.html'],
            styles: !!config.styles ? config.styles : ['**/*.css'],
            scripts: !!config.scripts ? config.scripts : ['**/*.js']
        };
        this.runtime.wwwRoot = config.wwwRoot;
        this.dynamicPages = !!config.dynamicPages ? config.dynamicPages : [];
        this.isProd = !!config.isProd;
        this.outDir = !!config.outDir ? config.outDir : '';
        this.wwwRoot = !!config.wwwRoot ? config.wwwRoot : '';
        this.noHtmlSuffix = !!config.noHtmlSuffix;
        this.autoWatch = !!config.autoWatch;
        this.transformModels = config.transformModels;
        this.cacheIntervals = !!config.cacheIntervals ? config.cacheIntervals : {};
    };
    ShamanWebsiteCompiler.prototype.applyCacheHeaders = function (milliseconds, res) {
        res.header('Last-Modified', this.lastModified.toUTCString());
        res.header("Cache-Control\", \"public, max-age=" + milliseconds);
        res.header("Expires", new Date(Date.now() + milliseconds).toUTCString());
    };
    return ShamanWebsiteCompiler;
}());
exports.ShamanWebsiteCompiler = ShamanWebsiteCompiler;
//# sourceMappingURL=compiler.js.map