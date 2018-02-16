"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var template_engine_html_1 = require("./template-engine.html");
function TemplateEngine(config) {
    return function () {
        return template_engine_html_1.HtmlTemplateEngine(config);
    };
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=template-engine.js.map