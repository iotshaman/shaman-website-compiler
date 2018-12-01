"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var MinifyJs = require("uglify-es");
var MinifyCss = require("clean-css");
var Promise = require("promise");
require("reflect-metadata");
var FileCompressor = /** @class */ (function () {
    function FileCompressor() {
        var _this = this;
        this.minifyJs = MinifyJs.minify;
        this.minifyCss = MinifyCss;
        this.MinifyJs = function (file, options) {
            if (options === void 0) { options = null; }
            return new Promise(function (res, err) {
                if (!options)
                    options = _this.getDefaultJsOptions();
                var map = {};
                map[file.name] = file.contents;
                var rslt = _this.minifyJs(map, options);
                if (rslt.error) {
                    return err(new Error(rslt.error));
                }
                res(rslt.code);
            });
        };
        this.BundleJs = function (files, name, options) {
            if (options === void 0) { options = null; }
            return new Promise(function (res, err) {
                if (!options)
                    options = _this.getDefaultJsOptions();
                var map = files.reduce(function (a, b) { a[b.name] = b.contents; return a; }, {});
                var rslt = _this.minifyJs(map, options);
                if (rslt.error) {
                    return err(new Error(rslt.error));
                }
                res({
                    name: name,
                    type: 'bundle.js',
                    contents: rslt.code
                });
            });
        };
        this.MinifyCss = function (file) {
            return new Promise(function (res) {
                var rslt = new _this.minifyCss({}).minify(file.contents);
                res(rslt.styles);
            });
        };
        this.BundleCss = function (files, name) {
            return new Promise(function (res, err) {
                var amalg = files.reduce(function (a, b) { return a += b.contents; }, '');
                var rslt = new _this.minifyCss({}).minify(amalg);
                res({
                    name: name,
                    type: 'bundle.css',
                    contents: rslt.styles
                });
            });
        };
        this.getDefaultJsOptions = function () {
            return {
                compress: { passes: 2 },
                nameCache: {},
                output: {
                    beautify: false,
                    preamble: "/* uglified */"
                }
            };
        };
    }
    FileCompressor = __decorate([
        inversify_1.injectable(),
        __metadata("design:paramtypes", [])
    ], FileCompressor);
    return FileCompressor;
}());
exports.FileCompressor = FileCompressor;
//# sourceMappingURL=file-compressor.js.map