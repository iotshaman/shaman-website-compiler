"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var inversify_1 = require("../../inversify");
var inversify_2 = require("inversify");
var compiler_state_1 = require("../compiler-state");
var files_1 = require("../../files");
var Promise = require("promise");
var ModelLoader = /** @class */ (function (_super) {
    __extends(ModelLoader, _super);
    function ModelLoader() {
        var _this = _super.call(this) || this;
        _this.state = 'load-models';
        _this.utils = files_1.FileUtils;
        _this.LoadFilesFromPatterns = function (data) {
            var files = data.files.filter(function (file) { return file.type == 'html' || file.type == 'dynamic.html'; });
            var operations = files.map(function (file) {
                var fileName = _this.utils.GetJsonExtensionFromHtml(file.name);
                return _this.fileService.ReadJson(data.config.cwd, fileName)
                    .then(function (rslt) {
                    file.data = rslt;
                    return file;
                });
            });
            return Promise.all(operations);
        };
        _this.CombineResults = function (allFiles, htmlFiles) {
            var files = allFiles.filter(function (file) { return file.type != "html" && file.type != 'dynamic.html'; });
            return htmlFiles.concat(files);
        };
        _this.fileService = inversify_1.IOC.get(inversify_1.IOC_TYPES.FileService);
        return _this;
    }
    ModelLoader.prototype.Process = function (data) {
        var _this = this;
        this.LoadFilesFromPatterns(data)
            .then(function (rslt) {
            data.state = 'compress-javascript';
            data.files = _this.CombineResults(data.files, rslt);
            _this.ChangeCompilerState(data);
        })
            .catch(function (ex) {
            _this.CompilerError(new Error(ex));
        });
    };
    ModelLoader = __decorate([
        inversify_2.injectable(),
        __metadata("design:paramtypes", [])
    ], ModelLoader);
    return ModelLoader;
}(compiler_state_1.CompilerState));
exports.ModelLoader = ModelLoader;
//# sourceMappingURL=model-loader.js.map