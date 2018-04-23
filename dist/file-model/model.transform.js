"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
function transformFileData(runtime, transform) {
    return new Promise(function (res) {
        if (!transform)
            res(runtime.models);
        var rslt = runtime.models.map(function (fileData) {
            fileData.data = transform(fileData.template, fileData.data);
            return fileData;
        });
        res(rslt);
    });
}
exports.transformFileData = transformFileData;
function transformDynamicFileData(runtime, dynamicPages, transform) {
    //----------------------------------------------
    return new Promise(function (res) {
        if (!transform || dynamicPages.length == 0)
            res(runtime.models);
        var pageGrid = dynamicPages.map(function (page) {
            var model = runtime.models.filter(function (data) {
                return data.template == page.template;
            });
            return page.routes.map(function (path) {
                return {
                    template: path,
                    data: model[0].data
                };
            });
        });
        var pages = pageGrid.reduce(function (a, b) {
            return a.concat(b);
        }, []);
        var rslt = pages.map(function (fileData) {
            var rslt = JSON.parse(JSON.stringify(fileData));
            rslt.data = transform(rslt.template, rslt.data);
            return rslt;
        });
        res(rslt.concat(runtime.models));
    });
}
exports.transformDynamicFileData = transformDynamicFileData;
//# sourceMappingURL=model.transform.js.map