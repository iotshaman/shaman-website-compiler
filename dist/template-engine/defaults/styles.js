"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function GetStylesTemplate() {
    var styleLink = '<link href="{{this}}" rel="stylesheet" type="text/css">';
    return "{{#each $.styles}}\r\n" + styleLink + "\r\n{{/each}}";
}
exports.GetStylesTemplate = GetStylesTemplate;
//# sourceMappingURL=styles.js.map