"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function registerHandlebarsPartials(runtime, handlebars) {
    var partials = runtime.contents.filter(function (file) {
        return file.type == 'partial';
    });
    for (var i = 0; i < partials.length; i++) {
        handlebars.registerPartial(partials[i].name, partials[i].contents);
    }
    registerStylesPartial(handlebars);
    registerScriptsPartial(handlebars);
    registerMetaTagPartial(handlebars);
}
exports.registerHandlebarsPartials = registerHandlebarsPartials;
function registerStylesPartial(handlebars) {
    var styleLink = '<link href="/{{this}}" rel="stylesheet" type="text/css">';
    handlebars.registerPartial('$.styles', "{{#each $.styles}}\r\n" + styleLink + "\r\n{{/each}}");
}
function registerScriptsPartial(handlebars) {
    var scriptLink = '<script src="/{{this}}" type="text/javascript"></script>';
    handlebars.registerPartial('$.scripts', "{{#each $.scripts}}\r\n" + scriptLink + "\r\n{{/each}}");
}
function registerMetaTagPartial(handlebars) {
    var tagElements = tags.reduce(function (a, b) {
        return "" + a + b;
    }, '');
    handlebars.registerPartial('$.tags', tagElements);
}
var tags = [
    pageTitle(),
    metaTag('description', 'description'),
    openGraph('og:type', 'og_type'),
    openGraph('og:title', 'title'),
    openGraph('og:description', 'description'),
    openGraph('og:url', 'og_url'),
    openGraph('og:image', 'og_image'),
    twitterCardTag(),
    twitterTag('twitter:site', '$.defaults.twitter_user'),
    twitterTag('twitter:title', 'title'),
    twitterTag('twitter:description', 'description'),
    googlePublisherTag()
];
function truthy(condition, val) {
    return "{{#if " + condition + "}}" + val + "{{/if}}";
}
function ifElse(condition, a, b) {
    return "{{#if " + condition + "}}{{ " + a + " }}{{else}}{{ " + b + " }}{{/if}}";
}
function pageTitle() {
    return "<title>" + ifElse('title', 'title', '$.defaults.title') + "</title>\r\n";
}
function metaTag(name, prop, defaultVal) {
    if (!defaultVal)
        defaultVal = "$.defaults." + prop;
    return "<meta name=\"" + name + "\" content=\"" + ifElse(prop, name, defaultVal) + "\">\r\n";
}
function openGraph(prop, val) {
    var newProp = "<meta property=\"" + prop + "\" content=\"{{" + val + "}}\">\r\n";
    return truthy(val, newProp);
}
function twitterCardTag() {
    var condition = "{{#if twitter_type}}{{ twitter_type }}{{else}}summary{{/if}}";
    return truthy('$.defaults.twitter_user', "<meta name=\"twitter:card\" content=\"" + condition + "\">\r\n");
}
function twitterTag(prop, val) {
    var newProp = "<meta name=\"" + prop + "\" content=\"{{" + val + "}}\">\r\n";
    return truthy('$.defaults.twitter_user', truthy(val, newProp));
}
function googlePublisherTag() {
    var newProp = "<link rel=\"publisher\" href=\"{{ google_address }}\">\r\n";
    return truthy('google_address', newProp);
}
//# sourceMappingURL=handlebars.partials.js.map