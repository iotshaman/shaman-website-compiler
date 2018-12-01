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
var Promise = require("promise");
var inversify_2 = require("inversify");
var compiler_state_1 = require("../compiler-state");
var files_1 = require("../../files");
var GlobLoader = /** @class */ (function (_super) {
    __extends(GlobLoader, _super);
    function GlobLoader() {
        var _this = _super.call(this) || this;
        _this.state = 'load-globs';
        _this.utils = files_1.FileUtils;
        _this.LoadGlobsFromPatterns = function (data) {
            var options = { cwd: data.config.cwd };
            var operations = [
                _this.globService.GetFilesFromGlob(data.config.pages, 'html', options),
                _this.globService.GetFilesFromGlob(data.config.partials, 'partial.html', options),
                _this.globService.GetFilesFromGlob(data.config.styles, 'css', options),
                _this.globService.GetFilesFromGlob(data.config.scripts, 'js', options),
                _this.globService.GetFilesFromGlob(data.config.dynamics, 'dynamic.html', options)
            ];
            return Promise.all(operations);
        };
        _this.globService = inversify_1.IOC.get(inversify_1.IOC_TYPES.GlobService);
        return _this;
    }
    GlobLoader.prototype.Process = function (data) {
        var _this = this;
        this.LoadGlobsFromPatterns(data)
            .then(this.utils.ReduceFileData)
            .then(function (rslt) {
            data.state = 'load-files';
            data.files = rslt;
            _this.ChangeCompilerState(data);
        })
            .catch(function (ex) {
            _this.CompilerError(new Error(ex));
        });
    };
    GlobLoader = __decorate([
        inversify_2.injectable(),
        __metadata("design:paramtypes", [])
    ], GlobLoader);
    return GlobLoader;
}(compiler_state_1.CompilerState));
exports.GlobLoader = GlobLoader;
//# sourceMappingURL=glob-loader.js.map