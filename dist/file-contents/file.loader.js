"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var nodePath = require("path");
function loadFileContents(config, fsx) {
    var fileLoaderOperations = [
        fileLoaderFactory(config.cwd, config.files.pages, 'html', fsx),
        fileLoaderFactory(config.cwd, config.files.partials, 'partial', fsx),
        fileLoaderFactory(config.cwd, config.files.styles, 'css', fsx),
        fileLoaderFactory(config.cwd, config.files.scripts, 'js', fsx),
    ];
    return Promise.all(fileLoaderOperations).then(function (contents) {
        return contents.reduce(function (a, b) {
            return a.concat(b);
        }, []);
    });
}
exports.loadFileContents = loadFileContents;
function fileLoaderFactory(root, obj, type, fsx) {
    var operations = obj.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(root, file);
            return fsx.readFile(path, "utf8", function (err, contents) {
                res({
                    name: file,
                    contents: contents,
                    type: type
                });
            });
        });
    });
    return Promise.all(operations);
}
//# sourceMappingURL=file.loader.js.map