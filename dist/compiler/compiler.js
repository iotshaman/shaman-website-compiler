"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var compiler_runtime_1 = require("./compiler.runtime");
var glob_data_1 = require("../glob-data");
var file_contents_1 = require("../file-contents");
var file_model_1 = require("../file-model");
var handlebars_1 = require("../handlebars");
var ShamanWebsiteCompiler = /** @class */ (function () {
    function ShamanWebsiteCompiler(config) {
        var _this = this;
        this.router = function (req, res, next) {
            if (!_this.runtime.routes)
                return next(0);
            if (req.method == "GET" && _this.runtime.routeMap[req.url] != null) {
                return next(1);
            }
            else if (req.method == "GET" && req.url.indexOf('swc.bundle.min.js') > -1) {
                return next(2);
            }
            else if (req.method == "GET" && req.url.indexOf('swc.bundle.min.css') > -1) {
                return next(3);
            }
            next(4);
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
        this.bundleRuntimeContents = function () {
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
            return file_model_1.transformFileData(_this.runtime.models, _this.transformModels)
                .then(function (models) {
                _this.runtime.models = models;
                return;
            });
        };
        this.loadHandlebarsResources = function () {
            return new Promise(function (res) {
                handlebars_1.registerHandlebars(_this.runtime, _this.handlebars);
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
        this.loadRouteMap = function () {
            return new Promise(function (res) {
                _this.runtime.routeMap = _this.runtime.routes.reduce(function (a, b, i) {
                    a[b.name] = i;
                    return a;
                }, {});
                res();
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
        this.dynamicPages = !!config.dynamicPages ? config.dynamicPages : [];
        this.isProd = !!config.isProd;
        this.outDir = !!config.outDir ? config.outDir : '';
        this.wwwRoot = !!config.wwwRoot ? config.wwwRoot : '';
        this.noHtmlSuffix = !!config.noHtmlSuffix;
        this.autoWatch = !!config.autoWatch;
        this.transformModels = config.transformModels;
    };
    ShamanWebsiteCompiler.prototype.compile = function () {
        var _this = this;
        return this.loadRuntimeFiles()
            .then(this.loadRuntimeContent)
            .then(this.bundleRuntimeContents)
            .then(this.loadRuntimeModels)
            .then(this.transformRuntimeModels)
            .then(this.loadHandlebarsResources)
            .then(this.compileHandlebarsTemplates)
            .then(this.addAssetRoutes)
            .then(this.loadRouteMap)
            .then(function () {
            return _this.runtime;
        });
    };
    return ShamanWebsiteCompiler;
}());
exports.ShamanWebsiteCompiler = ShamanWebsiteCompiler;
//# sourceMappingURL=compiler.js.map