"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promise = require("promise");
// LOAD FILE FROM GLOB CONFIG
function loadFileDataFromGlobs(config, glob) {
    var globOperations = [
        loadGlobData(glob, 'pages', config.globs.pages),
        loadGlobData(glob, 'partials', config.globs.partials),
        loadGlobData(glob, 'styles', config.globs.styles),
        loadGlobData(glob, 'scripts', config.globs.scripts),
    ];
    return Promise.all(globOperations).then(function (globs) {
        return mapGlobData(globs);
    });
}
exports.loadFileDataFromGlobs = loadFileDataFromGlobs;
function loadGlobData(glob, name, pattern) {
    return glob(pattern).then(function (files) {
        return { name: name, files: sortFiles(files) };
    });
}
function sortFiles(globs) {
    return globs.sort(function (a, b) {
        return a.toUpperCase().localeCompare(b.toUpperCase());
    });
}
function mapGlobData(globs) {
    var map = {
        pages: [],
        partials: [],
        styles: [],
        scripts: []
    };
    for (var i = 0; i < globs.length; i++) {
        map[globs[i].name] = globs[i].files;
    }
    return map;
}
//# sourceMappingURL=glob-contents.js.map