"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var fsx = require("fs-extra");
var Promise = require("promise");
var nodePath = require("path");
require("reflect-metadata");
var FileService = /** @class */ (function () {
    function FileService() {
        var _this = this;
        this.fs = fsx;
        this.path = nodePath;
        this.ReadFile = function (cwd, path) {
            return new Promise(function (res, err) {
                var fullPath = nodePath.join(cwd, path);
                _this.fs.readFile(fullPath, "utf8", function (error, contents) {
                    if (error)
                        return err(error);
                    return res(contents);
                });
            });
        };
        this.ReadJson = function (cwd, path) {
            return new Promise(function (res) {
                var fullPath = _this.path.join(cwd, path);
                _this.fs.readJson(fullPath, function (error, data) {
                    return res(error ? {} : data);
                });
            });
        };
        this.WriteFile = function (cwd, path, contents) {
            return new Promise(function (res) {
                var fullPath = _this.path.join(cwd, path);
                return _this.fs.outputFile(fullPath, contents).then(function () { res(); });
            });
        };
    }
    FileService = __decorate([
        inversify_1.injectable(),
        __metadata("design:paramtypes", [])
    ], FileService);
    return FileService;
}());
exports.FileService = FileService;
//# sourceMappingURL=file.service.js.map