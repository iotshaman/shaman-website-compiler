"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tags = [
    pageTitle(),
    metaTag('description'),
    openGraph('og:title', 'og_title'),
    openGraph('og:type', 'og_type'),
    openGraph('og:description', 'og_description'),
    openGraph('og:url', 'og_url'),
    openGraph('og:image', 'og_image'),
    twitterCardTag(),
    twitterTag('twitter:site', 'twitter_user'),
    twitterTag('twitter:title', 'title'),
    twitterTag('twitter:description', 'description'),
    googlePublisherTag()
];
function GetMetaTagsTemplate() {
    return tags.reduce(function (a, b) {
        return "" + a + b;
    }, '');
}
exports.GetMetaTagsTemplate = GetMetaTagsTemplate;
function truthy(condition, val) {
    return "{{#if " + condition + "}}" + val + "{{/if}}";
}
function ifElse(condition, a, b) {
    return "{{#if " + condition + "}}{{ " + a + " }}{{else}}{{ " + b + " }}{{/if}}";
}
function pageTitle() {
    return "<title>" + ifElse('title', 'title', '$.defaults.title') + "</title>\r\n";
}
function metaTag(name) {
    var defaultVal = "$.defaults." + name;
    return "<meta name=\"" + name + "\" content=\"" + ifElse(name, name, defaultVal) + "\">\r\n";
}
function openGraph(prop, val) {
    var newProp = "<meta property=\"" + prop + "\" content=\"{{" + val + "}}\">\r\n";
    return truthy(val, newProp);
}
function twitterCardTag() {
    var condition = "{{#if twitter_type}}{{ twitter_type }}{{else}}summary{{/if}}";
    return "<meta name=\"twitter:card\" content=\"" + condition + "\">\r\n";
}
function twitterTag(prop, val) {
    var newProp = "<meta name=\"" + prop + "\" content=\"{{" + val + "}}\">\r\n";
    return truthy(val, newProp);
}
function googlePublisherTag() {
    var newProp = "<link rel=\"publisher\" href=\"{{ google_address }}\">\r\n";
    return truthy('google_address', newProp);
}
//# sourceMappingURL=meta-tags.js.map