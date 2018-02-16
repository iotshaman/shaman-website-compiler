"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var meta_tags_1 = require("./defaults/meta-tags");
var nodePath = require("path");
var Promise = require("promise");
function HtmlTemplateEngine(config) {
    return generatePartials(config)
        .then(function () {
        return generateTemplatesFromFiles(config);
    })
        .then(function (templates) {
        return generateHtmlOutput(config, templates);
    });
}
exports.HtmlTemplateEngine = HtmlTemplateEngine;
// GENERATE PARTIAL FILES
function generatePartials(config) {
    return generatePartialsFromFiles(config).then(function () {
        config.handlebars.registerPartial('$.tags', meta_tags_1.GetMetaTagsTemplate());
    });
}
exports.generatePartials = generatePartials;
function generatePartialsFromFiles(config) {
    return config.glob(config.config.partials)
        .then(function (files) {
        return createInsertOperations(config, files);
    })
        .then(insertHandlebarsPartials);
}
exports.generatePartialsFromFiles = generatePartialsFromFiles;
function createInsertOperations(config, files) {
    return files.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.config.cwd, file);
            return config.fsx.readFile(path, "utf8", function (err, contents) {
                config.handlebars.registerPartial(file, contents);
                res();
            });
        });
    });
}
exports.createInsertOperations = createInsertOperations;
function insertHandlebarsPartials(operations) {
    return Promise.all(operations).then(function () { return; });
}
exports.insertHandlebarsPartials = insertHandlebarsPartials;
// GENERATE TEMPALTE OBJECT
function generateTemplatesFromFiles(config) {
    return config.glob(config.config.pages)
        .then(function (files) {
        return getTemplateData(config, files);
    })
        .then(function (data) {
        return createTemplateObject(config, data);
    });
}
exports.generateTemplatesFromFiles = generateTemplatesFromFiles;
function getTemplateData(config, files) {
    var operations = files.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.config.cwd, file);
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
    return config.glob(config.config.pages)
        .then(function (files) {
        return getDataFromJsonFiles(config, files);
    }).then(function (templateData) {
        return compileTemplates(templates, templateData);
    });
}
exports.generateHtmlOutput = generateHtmlOutput;
function getDataFromJsonFiles(config, files) {
    var operations = files.map(function (file) {
        return new Promise(function (res, err) {
            var path = nodePath.join(config.config.cwd, getJsonExtensionFromHtml(file));
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
function compileTemplates(templates, data) {
    var dataMap = {};
    for (var i = 0; i < data.length; i++) {
        dataMap[data[i].name] = data[i].data;
    }
    var rslt = templates.map(function (template) {
        return {
            name: template.name,
            data: template.compile(dataMap[template.name])
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