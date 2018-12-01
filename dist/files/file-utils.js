"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileUtils;
(function (FileUtils) {
    function ReduceFileData(files) {
        return files.reduce(function (a, b) {
            return a.concat(b);
        }, []);
    }
    FileUtils.ReduceFileData = ReduceFileData;
    function GetJsonExtensionFromHtml(file) {
        var index = file.lastIndexOf('.html');
        return file.substring(0, index) + ".json";
    }
    FileUtils.GetJsonExtensionFromHtml = GetJsonExtensionFromHtml;
    function ChangeFileType(file, oldExtension, newExtention) {
        var index = file.lastIndexOf("." + oldExtension);
        return file.substring(0, index) + "." + newExtention;
    }
    FileUtils.ChangeFileType = ChangeFileType;
    function RemoveExtension(file, extension) {
        var index = file.lastIndexOf("." + extension);
        return file.substring(0, index);
    }
    FileUtils.RemoveExtension = RemoveExtension;
})(FileUtils = exports.FileUtils || (exports.FileUtils = {}));
//# sourceMappingURL=file-utils.js.map