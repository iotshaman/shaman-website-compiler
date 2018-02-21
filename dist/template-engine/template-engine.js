"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var template_engine_html_1 = require("./template-engine.html");
function TemplateEngine(config) {
    return {
        generateFileOutput: function () { return template_engine_html_1.HtmlTemplateEngine(config); },
        generateExpressRoutes: function (express) { return generateExpressRoutes(config, express); }
    };
}
exports.TemplateEngine = TemplateEngine;
function generateExpressRoutes(config, express) {
    return template_engine_html_1.HtmlTemplateEngine(config).then(function (templates) {
        return mapExpressRoutes(templates, 'text/html', config.wwwRoot);
    }).then(function (map) {
        express.all('*', function (req, res, next) {
            if (req.method == "GET" && !!map[req.url]) {
                map[req.url](req, res, next);
            }
            else {
                next();
            }
        });
        return;
    });
}
function mapExpressRoutes(templates, mimeType, wwwRoot) {
    var map = {};
    var _loop_1 = function (i) {
        var name_1 = wwwRoot ? templates[i].name.replace(wwwRoot, '') : templates[i].name;
        map["/" + name_1] = function (req, res, next) {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.write(templates[i].contents);
            return res.end();
        };
    };
    for (var i = 0; i < templates.length; i++) {
        _loop_1(i);
    }
    return map;
}
//# sourceMappingURL=template-engine.js.map