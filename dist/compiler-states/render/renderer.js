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
var inversify_1 = require("inversify");
var Handlebars = require("handlebars");
var DefaultHelpers = require("../../../handlebars/default-helpers");
var compiler_state_1 = require("../compiler-state");
var Renderer = /** @class */ (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        var _this = _super.call(this) || this;
        _this.handlebars = Handlebars;
        _this.state = 'render';
        _this.LoadPlugins = function (data) {
            if (!data.config.handlebarsPlugin)
                return;
            data.config.handlebarsPlugin(_this.handlebars, data);
        };
        _this.LoadHelpers = function (data) {
            DefaultHelpers(_this.handlebars, data);
        };
        _this.LoadPartials = function (data) {
            var files = data.files.filter(function (file) { return file.type == 'partial.html'; });
            for (var i = 0; i < files.length; i++) {
                _this.handlebars.registerPartial(files[i].name, files[i].contents);
            }
        };
        _this.RenderTemplates = function (data) {
            return data.files.map(function (file) {
                if (file.type != "html")
                    return file;
                var compiler = _this.handlebars.compile(file.contents);
                file.contents = compiler({ compiler: data, model: file.data });
                return file;
            });
        };
        return _this;
    }
    Renderer.prototype.Process = function (data) {
        this.LoadPlugins(data);
        this.LoadHelpers(data);
        this.LoadPartials(data);
        data.files = this.RenderTemplates(data);
        data.state = 'finish';
        this.ChangeCompilerState(data);
    };
    Renderer = __decorate([
        inversify_1.injectable(),
        __metadata("design:paramtypes", [])
    ], Renderer);
    return Renderer;
}(compiler_state_1.CompilerState));
exports.Renderer = Renderer;
//# sourceMappingURL=renderer.js.map