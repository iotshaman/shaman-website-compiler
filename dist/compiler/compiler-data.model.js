"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompilerData = /** @class */ (function () {
    function CompilerData(config) {
        this.config = config;
        this.state = 'load-globs';
        this.files = [];
        this.startTime = new Date();
    }
    return CompilerData;
}());
exports.CompilerData = CompilerData;
//# sourceMappingURL=compiler-data.model.js.map