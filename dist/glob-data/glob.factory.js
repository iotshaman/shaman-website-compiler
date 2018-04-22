"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FastGlob = require("fast-glob");
var Promise = require("promise");
function GlobFactory(options) {
    return function (patterns) {
        return new Promise(function (res) { return FastGlob(patterns, options).then(res); });
    };
}
exports.GlobFactory = GlobFactory;
//# sourceMappingURL=glob.factory.js.map