"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("../inversify");
var compiler_data_model_1 = require("./compiler-data.model");
var shaman_router_1 = require("../router/shaman-router");
var Gaze = require("gaze");
var NodePath = require("path");
var Compiler = /** @class */ (function () {
    function Compiler() {
        var _this = this;
        this.gaze = Gaze;
        this.listening = false;
        this.Configure = function (config) {
            if (!config.pages)
                config.pages = ["**/*.html", "!**/*.partial.html", "!**/*.dynamic.html"];
            if (!config.dynamics)
                config.dynamics = ["**/*.dynamic.html"];
            if (!config.partials)
                config.partials = ["**/*.partial.html"];
            if (!config.styles)
                config.styles = ["**/*.css"];
            if (!config.scripts)
                config.scripts = ["**/*.js"];
            _this.config = config;
        };
        this.Compile = function () {
            _this.CompilerStateChanged(new compiler_data_model_1.CompilerData(_this.config));
        };
        this.CompilerStateChanged = function (data) {
            if (data.state == 'finish') {
                _this.FinishCompilation(data);
                _this.currentState = null;
                return;
            }
            _this.currentState = _this.GetCompilerState(data);
            _this.currentState.OnStateChange(_this.CompilerStateChanged);
            _this.currentState.OnCompilerError(_this.CompilerError);
            _this.currentState.Process(data);
        };
        this.CompilerError = function (error) {
            if (!_this.onCompileError)
                throw error;
            _this.onCompileError(error);
        };
        this.FinishCompilation = function (data) {
            data.endTime = new Date();
            if (_this.listening) {
                _this.shamanRouter.LoadRoutes(data);
                return;
            }
            _this.shamanRouter = new shaman_router_1.ShamanRouter(data);
            if (_this.config.autoWatch)
                _this.WatchFiles(data, _this.Compile);
            _this.onCompileEnd({ data: data, router: _this.shamanRouter });
        };
        this.GetCompilerState = function (data) {
            var state = _this.states.find(function (s) { return s.state == data.state; });
            if (!state)
                throw new Error("Invalid state: " + data.state);
            return state;
        };
        this.WatchFiles = function (data, callback) {
            _this.listening = true;
            var watchList = _this.getWatchList(data);
            _this.gaze(watchList, function (ex, watcher) {
                if (ex)
                    return this.onCompileError(ex);
                this.on('changed', function () {
                    console.log('Updating express routes...');
                    callback();
                });
            });
        };
        this.getWatchList = function (data) {
            return data.files
                .filter(function (file) {
                return file.type.indexOf('html') > -1 || file.type == 'js' || file.type == 'css';
            })
                .map(function (file) {
                return NodePath.join(_this.config.cwd, file.name);
            });
        };
        this.states = inversify_1.IOC.getAll(inversify_1.IOC_TYPES.CompilerState);
    }
    return Compiler;
}());
exports.Compiler = Compiler;
//# sourceMappingURL=compiler.js.map