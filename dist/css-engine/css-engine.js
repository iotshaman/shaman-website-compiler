"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var nodePath = require("path");
var Promise = require("promise");
function CssEngine(config) {
    return {
        generateFileOutput: function () { return generateCssFiles(config); },
        generateExpressRoutes: function () { return generateExpressRoutes(config); }
    };
}
exports.CssEngine = CssEngine;
function generateCssFiles(config) {
    return loadCssFiles(config).then(function (files) {
        if (!config.isProd) {
            return files;
        }
        var bundle = getCompressedCssFiles(config.minify, files);
        return [{
                name: 'styles.bundle.min.css',
                contents: bundle
            }];
    });
}
exports.generateCssFiles = generateCssFiles;
function loadCssFiles(config) {
    var operations = config.styles.map(function (file) {
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
exports.loadCssFiles = loadCssFiles;
// FILE COMPRESSION
function getCompressedCssFiles(minifyCss, files) {
    var reducedFileList = reduceCssFiles(files);
    var rslt = new minifyCss({}).minify(reducedFileList);
    return rslt.styles;
}
exports.getCompressedCssFiles = getCompressedCssFiles;
function reduceCssFiles(files) {
    return files.reduce(function (a, b) {
        return a += b.contents;
    }, '');
}
exports.reduceCssFiles = reduceCssFiles;
function generateExpressRoutes(config) {
    return generateCssFiles(config).then(function (templates) {
        return mapExpressRoutes(templates, 'text/css');
    });
}
function mapExpressRoutes(templates, mimeType) {
    var map = {};
    var _loop_1 = function (i) {
        map["/" + templates[i].name] = function (req, res, next) {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.write(templates[i].contents);
            return res.end();
        };
    };
    for (var i = 0; i < templates.length; i++) {
        _loop_1(i);
    }
    return map;
}
//# sourceMappingURL=css-engine.js.map