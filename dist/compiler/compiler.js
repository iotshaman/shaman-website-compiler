"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var compiler_runtime_1 = require("./compiler.runtime");
var glob_data_1 = require("../glob-data");
var file_contents_1 = require("../file-contents");
var ShamanWebsiteCompiler = /** @class */ (function () {
    function ShamanWebsiteCompiler(config) {
        var _this = this;
        this.loadRuntimeFiles = function () {
            return glob_data_1.loadFileNamesFromGlobs(_this.runtime, _this.glob)
                .then(function (files) {
                _this.runtime.files = files;
                return;
            });
        };
        this.loadRuntimeContent = function () {
            return file_contents_1.loadFileContents(_this.runtime, _this.fsx)
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
        this.runtime = new compiler_runtime_1.CompilerRuntime();
        this.runtime.cwd = config.cwd;
        this.runtime.globs = {
            pages: !!config.pages ? config.pages : ['**/*.html', '!**/*.partial.html'],
            partials: !!config.partials ? config.partials : ['**/*.partial.html'],
            styles: !!config.styles ? config.styles : ['**/*.css'],
            scripts: !!config.scripts ? config.scripts : ['**/*.js']
        };
        this.isProd = !!config.isProd;
        this.outDir = !!config.outDir ? config.outDir : '';
        this.wwwRoot = !!config.wwwRoot ? config.wwwRoot : '';
        this.noHtmlSuffix = !!config.noHtmlSuffix;
        this.autoWatch = !!config.autoWatch;
    };
    ShamanWebsiteCompiler.prototype.compile = function () {
        var _this = this;
        return this.loadRuntimeFiles()
            .then(this.loadRuntimeContent)
            .then(this.bundleRuntimeContents)
            .then(function () {
            return _this.runtime;
        });
    };
    return ShamanWebsiteCompiler;
}());
exports.ShamanWebsiteCompiler = ShamanWebsiteCompiler;
//# sourceMappingURL=compiler.js.map