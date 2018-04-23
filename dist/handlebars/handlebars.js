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
function compileTemplates(runtime, handlebars, dynamicPages) {
    return new Promise(function (res) {
        var defaultOptions = {
            scripts: getScripts(runtime.contents, runtime.isProd, runtime.wwwRoot),
            styles: getStyles(runtime.contents, runtime.isProd, runtime.wwwRoot),
            defaults: {}
        };
        var preCompile = getPreCompileData(runtime, defaultOptions);
        var dynamicPreCompile = getPreCompileDynamicRoutes(runtime, defaultOptions, dynamicPages);
        preCompile = preCompile.concat(dynamicPreCompile);
        res(preCompile.map(function (data) {
            var compile = handlebars.compile(data.view);
            var name = data.name.indexOf('html') > -1 ? data.name.slice(0, -5) : data.name;
            var route = {
                name: name,
                contents: compile(data.model),
                type: 'router.html'
            };
            return route;
        }));
    });
}
exports.compileTemplates = compileTemplates;
function getPreCompileData(runtime, defaultOptions) {
    var pages = runtime.contents.filter(function (file) {
        return file.type == 'html';
    });
    return pages.map(function (file) {
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
}
function getPreCompileDynamicRoutes(runtime, defaultOptions, dynamicPages) {
    var pageGrid = dynamicPages.map(function (page) {
        var contents = runtime.contents.filter(function (file) {
            return file.type == 'dynamic' && file.name == page.template;
        });
        return page.routes.map(function (route) {
            return {
                name: route,
                contents: contents.length > 0 ? contents[0].contents : '',
                type: 'tmp'
            };
        });
    });
    var pages = pageGrid.reduce(function (a, b) {
        return a.concat(b);
    }, []);
    return pages.map(function (file) {
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
}
function getScripts(scripts, isProd, wwwRoot) {
    var filtered = scripts.filter(function (file) {
        if (isProd)
            return file.type == 'js.bundle.hash';
        return file.type == 'js';
    });
    return filtered.map(function (file) {
        if (!wwwRoot)
            return file.name;
        return file.name.replace(wwwRoot, '');
    });
}
function getStyles(styles, isProd, wwwRoot) {
    var filtered = styles.filter(function (file) {
        if (isProd)
            return file.type == 'css.bundle.hash';
        return file.type == 'css';
    });
    return filtered.map(function (file) {
        if (!wwwRoot)
            return file.name;
        return file.name.replace(wwwRoot, '');
    });
}
//# sourceMappingURL=handlebars.js.map