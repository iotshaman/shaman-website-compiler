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
var bundler_utils_1 = require("./bundler-utils");
var Promise = require("promise");
var CssBundler = /** @class */ (function (_super) {
    __extends(CssBundler, _super);
    function CssBundler() {
        var _this = _super.call(this) || this;
        _this.state = 'bundle-css';
        _this.bundlerUtils = bundler_utils_1.BundlerUtils;
        _this.LoadFileBundles = function (data) {
            return new Promise(function (res) {
                var specs = _this.bundlerUtils.GetBundleSpecsFromConfig(data);
                var bundles = _this.bundlerUtils.LoadBundleContent(specs, 'css', data.files);
                res(bundles);
            });
        };
        _this.GenerateFileBundles = function (bundles) {
            var operations = bundles.map(function (bundle) {
                return _this.compressor.BundleCss(bundle.files, bundle.name);
            });
            return Promise.all(operations);
        };
        _this.compressor = inversify_1.IOC.get(inversify_1.IOC_TYPES.FileCompressor);
        return _this;
    }
    CssBundler.prototype.Process = function (data) {
        var _this = this;
        this.LoadFileBundles(data)
            .then(this.GenerateFileBundles)
            .then(function (rslt) {
            data.files = data.files.concat(rslt);
            data.state = 'render';
            _this.ChangeCompilerState(data);
        })
            .catch(function (ex) {
            _this.CompilerError(new Error(ex));
        });
    };
    CssBundler = __decorate([
        inversify_2.injectable(),
        __metadata("design:paramtypes", [])
    ], CssBundler);
    return CssBundler;
}(compiler_state_1.CompilerState));
exports.CssBundler = CssBundler;
//# sourceMappingURL=css-bundler.js.map