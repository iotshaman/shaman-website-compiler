"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var invesify_types_1 = require("./invesify.types");
require("reflect-metadata");
var globs_1 = require("../globs");
var files_1 = require("../files");
var glob_loader_1 = require("../compiler-states/load-globs/glob-loader");
var file_loader_1 = require("../compiler-states/load-files/file-loader");
var model_loader_1 = require("../compiler-states/load-models/model-loader");
var javascript_compressor_1 = require("../compiler-states/compress-files/javascript-compressor");
var css_compressor_1 = require("../compiler-states/compress-files/css-compressor");
var javascript_bundler_1 = require("../compiler-states/bundle-files/javascript-bundler");
var css_bundler_1 = require("../compiler-states/bundle-files/css-bundler");
var renderer_1 = require("../compiler-states/render/renderer");
exports.IOC = new inversify_1.Container();
function Configure() {
    exports.IOC.bind(invesify_types_1.IOC_TYPES.GlobService).to(globs_1.GlobService);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.FileService).to(files_1.FileService);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.FileCompressor).to(files_1.FileCompressor);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(glob_loader_1.GlobLoader);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(file_loader_1.FileLoader);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(model_loader_1.ModelLoader);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(javascript_compressor_1.JavascriptCompressor);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(css_compressor_1.CssCompressor);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(javascript_bundler_1.JavascriptBundler);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(css_bundler_1.CssBundler);
    exports.IOC.bind(invesify_types_1.IOC_TYPES.CompilerState).to(renderer_1.Renderer);
    return exports.IOC;
}
exports.Configure = Configure;
//# sourceMappingURL=inversify.config.js.map