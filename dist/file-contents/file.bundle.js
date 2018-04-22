"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function bundleFileContents(config, objectHash, minifyJs, minifyCss) {
    //---------------------------------------
    var jsFiles = config.contents.filter(function (file) {
        return file.type == 'js';
    });
    var jsBundle = getCompressedJavascriptFiles(minifyJs, jsFiles);
    var cssFiles = config.contents.filter(function (file) {
        return file.type == 'css';
    });
    var cssBundle = getCompressedCssFiles(minifyCss, cssFiles);
    var bundles = [];
    bundles.push({
        name: objectHash(jsBundle).substring(0, 20) + "swc.bundle.min.js",
        contents: jsBundle,
        type: 'js.bundle.hash'
    });
    bundles.push({
        name: "scripts.bundle.min.js",
        contents: jsBundle,
        type: 'js.bundle'
    });
    bundles.push({
        name: objectHash(cssBundle).substring(0, 20) + "swc.bundle.min.css",
        contents: cssBundle,
        type: 'css.bundle.hash'
    });
    bundles.push({
        name: "styles.bundle.min.css",
        contents: cssBundle,
        type: 'css.bundle'
    });
    return bundles;
}
exports.bundleFileContents = bundleFileContents;
function getCompressedJavascriptFiles(minify, files) {
    var options = {
        compress: { passes: 2 },
        nameCache: {},
        output: {
            beautify: false,
            preamble: "/* uglified */"
        }
    };
    var map = getJavascriptFileMap(files);
    var rslt = minify(map, options);
    if (rslt.error) {
        throw new Error(rslt.error);
    }
    return rslt.code;
}
function getJavascriptFileMap(files) {
    var map = {};
    for (var i = 0; i < files.length; i++) {
        map[files[i].name] = files[i].contents;
    }
    return map;
}
function getCompressedCssFiles(minifyCss, files) {
    var reducedFileList = reduceCssFiles(files);
    var rslt = new minifyCss({}).minify(reducedFileList);
    return rslt.styles;
}
function reduceCssFiles(files) {
    return files.reduce(function (a, b) {
        return a += b.contents;
    }, '');
}
//# sourceMappingURL=file.bundle.js.map