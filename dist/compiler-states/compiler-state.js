"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("inversify");
var CompilerState = /** @class */ (function () {
    function CompilerState() {
        var _this = this;
        this.OnStateChange = function (callback) {
            _this.onStateChange = callback;
        };
        this.OnCompilerError = function (callback) {
            _this.onError = callback;
        };
        this.ChangeCompilerState = function (data) {
            if (!!_this.onStateChange) {
                _this.onStateChange(data);
            }
        };
        this.CompilerError = function (error) {
            if (!!_this.onError) {
                _this.onError(error);
            }
        };
    }
    CompilerState = __decorate([
        inversify_1.injectable()
    ], CompilerState);
    return CompilerState;
}());
exports.CompilerState = CompilerState;
//# sourceMappingURL=compiler-state.js.map