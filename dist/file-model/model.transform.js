"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
function transformFileData(fileDataList, transform) {
    return new Promise(function (res) {
        if (!transform)
            res(fileDataList);
        res(fileDataList.map(function (fileData) {
            fileData.data = transform(fileData.template, fileData.data);
            return fileData;
        }));
    });
}
exports.transformFileData = transformFileData;
//# sourceMappingURL=model.transform.js.map