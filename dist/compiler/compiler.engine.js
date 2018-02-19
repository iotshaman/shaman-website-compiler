"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
function CompilerEngine(engines) {
    return {
        generateFileOutput: function () { return generateAllFiles(engines); },
        generateExpressRoutes: function (express) { return generateAllExpressRoutes(engines, express); }
    };
}
exports.CompilerEngine = CompilerEngine;
function generateAllFiles(engines) {
    return Promise.all([
        engines.templateEngine.generateFileOutput(),
        engines.javascriptEngine.generateFileOutput()
    ]).then(function (contents) {
        return contents.reduce(function (a, b) { return a.concat(b); });
    });
}
exports.generateAllFiles = generateAllFiles;
function generateAllExpressRoutes(engines, express) {
    return Promise.all([
        engines.templateEngine.generateExpressRoutes(express),
        engines.javascriptEngine.generateExpressRoutes(express)
    ]).then(function () { return; });
}
exports.generateAllExpressRoutes = generateAllExpressRoutes;
//# sourceMappingURL=compiler.engine.js.map