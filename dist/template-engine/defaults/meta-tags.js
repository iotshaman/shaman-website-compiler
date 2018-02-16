"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tags = [
    '<title>{{ title }}</title>',
    '<meta name="description" content="{{ description }}">'
];
function GetMetaTagsTemplate() {
    return tags.reduce(function (a, b) {
        return "" + a + (!a ? '' : '\r\n') + b;
    }, '');
}
exports.GetMetaTagsTemplate = GetMetaTagsTemplate;
//# sourceMappingURL=meta-tags.js.map