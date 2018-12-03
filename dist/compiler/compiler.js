"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("../inversify");
var Gaze = require("gaze");
var NodePath = require("path");
var Promise = require("promise");
var compiler_data_model_1 = require("./compiler-data.model");
var shaman_router_1 = require("../router/shaman-router");
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
            if (!_this.listening) {
                _this.shamanRouter = new shaman_router_1.ShamanRouter(data);
                _this.WriteFilesToDisk(_this.shamanRouter).then(function () {
                    if (_this.config.autoWatch)
                        _this.WatchFiles(data, _this.Compile);
                    _this.onCompileEnd({ data: data, router: _this.shamanRouter });
                });
            }
            else {
                _this.shamanRouter.LoadRoutes(data);
                var update = _this.WriteFilesToDisk(_this.shamanRouter);
                update.then(function () { console.log('Routes successfully updated!'); });
                update.catch(function (ex) { console.log("An error occured while updating routes: " + ex.message); });
            }
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
        this.WriteFilesToDisk = function (router) {
            if (!_this.config.outputFolder)
                return Promise.resolve();
            var keys = Object.keys(router.routes);
            var files = keys.map(function (key) {
                return router.routes[key];
            });
            var operations = files.map(function (route) {
                return _this.fileService.WriteFile(_this.config.outputFolder, route.path, route.content);
            });
            return Promise.all(operations).then(function () { return; }).catch(function (ex) {
                _this.onCompileError(ex);
            });
        };
        this.states = inversify_1.IOC.getAll(inversify_1.IOC_TYPES.CompilerState);
        this.fileService = inversify_1.IOC.get(inversify_1.IOC_TYPES.FileService);
    }
    return Compiler;
}());
exports.Compiler = Compiler;
//# sourceMappingURL=compiler.js.map