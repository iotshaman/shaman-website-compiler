"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GetScriptsTemplate() {
    var scriptLink = '<script src="{{this}}" type="text/javascript"></script>';
    return "\r\n{{#each $.scripts}}\r\n" + scriptLink + "\r\n{{/each}}";
}
exports.GetScriptsTemplate = GetScriptsTemplate;
//# sourceMappingURL=scripts.js.map