"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
function CompilerEngine(engines) {
    return {
        generateFileOutput: function () { return generateAllFiles(engines); },
        generateExpressRoutes: function () { return generateAllExpressRoutes(engines); }
    };
}
exports.CompilerEngine = CompilerEngine;
function generateAllFiles(engines) {
    return Promise.all([
        engines.templateEngine.generateFileOutput(),
        engines.javascriptEngine.generateFileOutput(),
        engines.cssEngine.generateFileOutput()
    ]).then(function (contents) {
        return contents.reduce(function (a, b) { return a.concat(b); });
    });
}
exports.generateAllFiles = generateAllFiles;
function generateAllExpressRoutes(engines) {
    return Promise.all([
        engines.templateEngine.generateExpressRoutes(),
        engines.javascriptEngine.generateExpressRoutes(),
        engines.cssEngine.generateExpressRoutes()
    ]).then(function (maps) {
        return maps.reduce(function (a, b) {
            var keys = Object.keys(b);
            for (var i = 0; i < keys.length; i++) {
                a[keys[i]] = b[keys[i]];
            }
            return a;
        }, {});
    });
}
exports.generateAllExpressRoutes = generateAllExpressRoutes;
//# sourceMappingURL=compiler.engine.js.map