"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodePath = require("path");
var Promise = require("promise");
function JavascriptEngine(config) {
    return {
        generateFileOutput: function () { return generateJavascriptFiles(config); },
    };
}
exports.JavascriptEngine = JavascriptEngine;
function generateJavascriptFiles(config) {
    return getJavascriptFiles(config).then(function (files) {
        if (!config.isProd) {
            return files;
        }
        var bundle = getCompressedJavascriptFiles(config.minify, files);
        return [{
                name: 'scripts.bundle.min.js',
                contents: bundle
            }];
    });
}
exports.generateJavascriptFiles = generateJavascriptFiles;
function getJavascriptFiles(config) {
    var operations = config.scripts.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.cwd, file);
            return config.fsx.readFile(path, "utf8", function (err, contents) {
                res({
                    name: file,
                    contents: contents
                });
            });
        });
    });
    return Promise.all(operations);
}
exports.getJavascriptFiles = getJavascriptFiles;
// FILE COMPRESSION
function getCompressedJavascriptFiles(minify, files) {
    var options = {
        compress: { passes: 2 },
        nameCache: {},
        output: {
            beautify: false,
            preamble: "/* uglified */"
        }
    };
    var map = getJavascriptFileMap(files);
    var rslt = minify(map, options);
    if (rslt.error) {
        throw new Error(rslt.error);
    }
    return rslt.code;
}
exports.getCompressedJavascriptFiles = getCompressedJavascriptFiles;
function getJavascriptFileMap(files) {
    var map = {};
    for (var i = 0; i < files.length; i++) {
        map[files[i].name] = files[i].contents;
    }
    return map;
}
exports.getJavascriptFileMap = getJavascriptFileMap;
//# sourceMappingURL=javascript-engine.js.map