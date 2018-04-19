"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
var handlebars_partials_1 = require("./handlebars.partials");
var handlebars_helpers_1 = require("./handlebars.helpers");
function registerHandlebars(runtime, handlebars) {
    handlebars_partials_1.registerHandlebarsPartials(runtime, handlebars);
    handlebars_helpers_1.registerHandlebarsHelpers(handlebars);
}
exports.registerHandlebars = registerHandlebars;
function compileTemplates(runtime, handlebars) {
    return new Promise(function (res) {
        var defaultOptions = {
            scripts: getScripts(runtime.contents, runtime.isProd),
            styles: getStyles(runtime.contents, runtime.isProd),
            defaults: {}
        };
        var pages = runtime.contents.filter(function (file) {
            return file.type == 'html';
        });
        var preCompile = pages.map(function (file) {
            var models = runtime.models.filter(function (data) {
                return data.template == file.name;
            });
            var obj = {
                model: models.length > 0 ? models[0].data : {},
                view: file.contents,
                name: file.name
            };
            obj.model["$"] = defaultOptions;
            return obj;
        });
        res(preCompile.map(function (data) {
            var compile = handlebars.compile(data.view);
            var route = {
                name: data.name.slice(0, -5),
                contents: compile(data.model),
                type: 'router.html'
            };
            return route;
        }));
    });
}
exports.compileTemplates = compileTemplates;
function getScripts(scripts, isProd) {
    var filtered = scripts.filter(function (file) {
        if (isProd)
            return file.type == 'js.bundle.hash';
        return file.type == 'js';
    });
    return filtered.map(function (file) {
        return file.name;
    });
}
function getStyles(styles, isProd) {
    var filtered = styles.filter(function (file) {
        if (isProd)
            return file.type == 'css.bundle.hash';
        return file.type == 'css';
    });
    return filtered.map(function (file) {
        return file.name;
    });
}
//# sourceMappingURL=handlebars.js.map