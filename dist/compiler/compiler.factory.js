"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inversify_1 = require("../inversify");
var compiler_1 = require("./compiler");
function CompilerFactory(config) {
    inversify_1.Configure();
    var compiler = new compiler_1.Compiler();
    compiler.Configure(config);
    return compiler;
}
exports.CompilerFactory = CompilerFactory;
//# sourceMappingURL=compiler.factory.js.map