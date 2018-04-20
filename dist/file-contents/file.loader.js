"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var nodePath = require("path");
function loadFileContents(runtime, dynamicPages, fsx) {
    var dynamicTemplates = dynamicPages.map(function (page) {
        return page.template;
    });
    var fileLoaderOperations = [
        fileLoaderFactory(runtime.cwd, runtime.files.pages, 'html', fsx),
        fileLoaderFactory(runtime.cwd, runtime.files.styles, 'css', fsx),
        fileLoaderFactory(runtime.cwd, runtime.files.scripts, 'js', fsx),
        fileLoaderFactory(runtime.cwd, runtime.files.partials, 'partial', fsx),
        fileLoaderFactory(runtime.cwd, dynamicTemplates, 'dynamic', fsx)
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