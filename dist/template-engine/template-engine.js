"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var template_engine_html_1 = require("./template-engine.html");
function TemplateEngine(config) {
    return {
        generateFileOutput: function () {
            return template_engine_html_1.HtmlTemplateEngine(config).then(function (templates) {
                if (!!config.transformData) {
                    return transformTemplates(config, templates);
                }
                return templates;
            });
        },
        generateExpressRoutes: function () { return generateExpressRoutes(config); }
    };
}
exports.TemplateEngine = TemplateEngine;
function transformTemplates(config, templates) {
    return templates.map(function (template) {
        var compile = config.handlebars.compile(template.contents);
        var data = config.transformData(template.name);
        var rslt = {
            name: template.name,
            contents: compile(!data ? {} : data)
        };
        return rslt;
    });
}
function generateExpressRoutes(config) {
    return template_engine_html_1.HtmlTemplateEngine(config).then(function (templates) {
        if (!!config.transformData) {
            return transformTemplates(config, templates);
        }
        return templates;
    }).then(function (templates) {
        return mapExpressRoutes(templates, config.wwwRoot, config.noHtmlSuffix);
    });
}
function mapExpressRoutes(templates, wwwRoot, noHtmlSuffix) {
    var map = {};
    var _loop_1 = function (i) {
        var name_1 = wwwRoot ? templates[i].name.replace(wwwRoot, '') : templates[i].name;
        if (!!noHtmlSuffix) {
            name_1 = name_1.replace('.html', '');
        }
        map["/" + name_1] = function (req, res, next) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(templates[i].contents);
            return res.end();
        };
        if (name_1.toLocaleLowerCase() == 'index.html' || (!!noHtmlSuffix && name_1.toLowerCase() == 'index')) {
            map['/'] = map["/" + name_1];
        }
    };
    for (var i = 0; i < templates.length; i++) {
        _loop_1(i);
    }
    return map;
}
//# sourceMappingURL=template-engine.js.map