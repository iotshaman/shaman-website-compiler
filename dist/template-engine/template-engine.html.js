"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var meta_tags_1 = require("./defaults/meta-tags");
var styles_1 = require("./defaults/styles");
var scripts_1 = require("./defaults/scripts");
var nodePath = require("path");
var Promise = require("promise");
function HtmlTemplateEngine(config) {
    return generatePartials(config)
        .then(function () { return generateTemplatesFromFiles(config); })
        .then(function (templates) { return generateHtmlOutput(config, templates); });
}
exports.HtmlTemplateEngine = HtmlTemplateEngine;
// GENERATE PARTIAL FILES
function generatePartials(config) {
    return generatePartialsFromFiles(config).then(function () {
        config.handlebars.registerPartial('$.tags', meta_tags_1.GetMetaTagsTemplate());
        config.handlebars.registerPartial('$.styles', styles_1.GetStylesTemplate());
        config.handlebars.registerPartial('$.scripts', scripts_1.GetScriptsTemplate());
    });
}
exports.generatePartials = generatePartials;
function generatePartialsFromFiles(config) {
    var operations = getHtmlPartialFiles(config);
    return insertHandlebarsPartials(operations);
}
exports.generatePartialsFromFiles = generatePartialsFromFiles;
function getHtmlPartialFiles(config) {
    var rslt = config.partials.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.cwd, file);
            return config.fsx.readFile(path, "utf8", function (err, contents) {
                config.handlebars.registerPartial(file, contents);
                res();
            });
        });
    });
    return rslt;
}
exports.getHtmlPartialFiles = getHtmlPartialFiles;
function insertHandlebarsPartials(operations) {
    return Promise.all(operations).then(function () { return; });
}
exports.insertHandlebarsPartials = insertHandlebarsPartials;
// GENERATE TEMPALTE OBJECT
function generateTemplatesFromFiles(config) {
    return getTemplateData(config).then(function (data) {
        return createTemplateObject(config, data);
    });
}
exports.generateTemplatesFromFiles = generateTemplatesFromFiles;
function getTemplateData(config) {
    var operations = config.pages.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.cwd, file);
            return config.fsx.readFile(path, "utf8", function (err, contents) {
                res({
                    file: file,
                    contents: contents
                });
            });
        });
    });
    return Promise.all(operations);
}
exports.getTemplateData = getTemplateData;
function createTemplateObject(config, data) {
    var rslt = [];
    for (var i = 0; i < data.length; i++) {
        rslt.push({
            name: data[i].file,
            compile: config.handlebars.compile(data[i].contents)
        });
    }
    return rslt;
}
exports.createTemplateObject = createTemplateObject;
// GENERATE HTML OUTPUT
function generateHtmlOutput(config, templates) {
    return getDataFromJsonFiles(config).then(function (templateData) {
        return compileTemplates(config, templates, templateData);
    });
}
exports.generateHtmlOutput = generateHtmlOutput;
function getDataFromJsonFiles(config) {
    var operations = config.pages.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.cwd, getJsonExtensionFromHtml(file));
            return config.fsx.readJson(path, function (err, data) {
                res({
                    name: file,
                    data: data
                });
            });
        });
    });
    return Promise.all(operations);
}
exports.getDataFromJsonFiles = getDataFromJsonFiles;
function compileTemplates(config, templates, data) {
    var dataMap = {};
    var systemOptions = {
        scripts: (config.isProd && config.scripts.length > 0) ? ['scripts.bundle.min.js'] : config.scripts,
        styles: (config.isProd && config.styles.length > 0) ? ['styles.bundle.min.css'] : config.styles,
        defaults: config.defaults
    };
    for (var i = 0; i < data.length; i++) {
        dataMap[data[i].name] = data[i].data;
        dataMap[data[i].name]["$"] = systemOptions;
    }
    var rslt = templates.map(function (template) {
        return {
            name: template.name,
            contents: template.compile(dataMap[template.name])
        };
    });
    return rslt;
}
exports.compileTemplates = compileTemplates;
function getJsonExtensionFromHtml(file) {
    var index = file.lastIndexOf('.html');
    return file.substring(0, index) + ".json";
}
exports.getJsonExtensionFromHtml = getJsonExtensionFromHtml;
//# sourceMappingURL=template-engine.html.js.map