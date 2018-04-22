"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var nodePath = require("path");
function loadFileDataModels(runtime, fsx) {
    var operations = runtime.files.pages.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(runtime.cwd, getJsonExtensionFromHtml(file));
            return fsx.readJson(path, function (err, data) {
                res({
                    template: file,
                    data: err ? {} : data
                });
            });
        });
    });
    return Promise.all(operations);
}
exports.loadFileDataModels = loadFileDataModels;
function getJsonExtensionFromHtml(file) {
    var index = file.lastIndexOf('.html');
    return file.substring(0, index) + ".json";
}
//# sourceMappingURL=file.model.js.map