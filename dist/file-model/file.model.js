"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var nodePath = require("path");
function loadFileDataModels(runtime, fsx) {
    var fileList = getJsonFileList(runtime);
    var operations = fileList.map(function (file) {
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
function getJsonFileList(runtime) {
    var dynamicPages = runtime.contents.filter(function (file) {
        return file.type == 'dynamic';
    });
    return runtime.files.partials.concat(dynamicPages.map(function (file) {
        return file.name;
    }));
}
function getJsonExtensionFromHtml(file) {
    var index = file.lastIndexOf('.html');
    return file.substring(0, index) + ".json";
}
//# sourceMappingURL=file.model.js.map