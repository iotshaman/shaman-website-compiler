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
var CssCompressor = /** @class */ (function (_super) {
    __extends(CssCompressor, _super);
    function CssCompressor() {
        var _this = _super.call(this) || this;
        _this.state = 'compress-css';
        _this.utils = files_1.FileUtils;
        _this.CompressCssFiles = function (data) {
            if (!data.config.minify)
                return Promise.resolve([]);
            var files = data.files.filter(function (file) { return file.type == 'css'; });
            var operations = files.map(function (file) {
                return _this.compressor.MinifyCss(file)
                    .then(function (rslt) {
                    var newFile = {
                        name: _this.utils.ChangeFileType(file.name, 'css', 'min.css'),
                        contents: rslt,
                        type: 'min.css'
                    };
                    return newFile;
                });
            });
            return Promise.all(operations);
        };
        _this.compressor = inversify_1.IOC.get(inversify_1.IOC_TYPES.FileCompressor);
        return _this;
    }
    CssCompressor.prototype.Process = function (data) {
        var _this = this;
        this.CompressCssFiles(data)
            .then(function (rslt) {
            data.state = 'bundle-javascript';
            data.files = data.files.concat(rslt);
            _this.ChangeCompilerState(data);
        })
            .catch(function (ex) {
            _this.CompilerError(new Error(ex));
        });
    };
    CssCompressor = __decorate([
        inversify_2.injectable(),
        __metadata("design:paramtypes", [])
    ], CssCompressor);
    return CssCompressor;
}(compiler_state_1.CompilerState));
exports.CssCompressor = CssCompressor;
//# sourceMappingURL=css-compressor.js.map