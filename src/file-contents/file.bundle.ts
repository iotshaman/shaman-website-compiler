import * as Promise from 'promise';
import { CompilerRuntime } from '../compiler';
import { FileContents } from './file.contents';

export function bundleFileContents(
    config: CompilerRuntime, 
    objectHash: any,
    minifyJs: (contents: any, opts: any) => any,
    minifyCss: any) {
    //---------------------------------------
    let jsFiles = config.contents.filter((file: FileContents) => {
        return file.type == 'js';
    });
    let jsBundle = getCompressedJavascriptFiles(minifyJs, jsFiles);

    let cssFiles = config.contents.filter((file: FileContents) => {
        return file.type == 'css';
    });
    let cssBundle = getCompressedCssFiles(minifyCss, cssFiles);
    
    let bundles: FileContents[] = [];
    bundles.push({
        name: `${objectHash(jsBundle).substring(0, 25)}.bundle.min.js`,
        contents: jsBundle,
        type: 'js.bundle.hash'
    })
    bundles.push({
        name: `scripts.bundle.min.js`,
        contents: jsBundle,
        type: 'js.bundle'
    })
    bundles.push({
        name: `${objectHash(cssBundle).substring(0, 25)}.bundle.min.css`,
        contents: cssBundle,
        type: 'css.bundle.hash'
    })
    
    bundles.push({
        name: `styles.bundle.min.css`,
        contents: cssBundle,
        type: 'css.bundle'
    })
    return bundles;
}

function getCompressedJavascriptFiles(minify: (contents: any, opts: any) => any, files: FileContents[]) {
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
    if (rslt.error) { throw new Error(rslt.error); }
    return rslt.code;
}

function getJavascriptFileMap(files: FileContents[]) {
    var map = {};
    for (var i = 0; i < files.length; i++) {
        map[files[i].name] = files[i].contents;
    }
    return map;
}

function getCompressedCssFiles(minifyCss: any, files: FileContents[]) {
    var reducedFileList = reduceCssFiles(files);
    var rslt = new minifyCss({}).minify(reducedFileList);
    return rslt.styles;
}

function reduceCssFiles(files: FileContents[]) {
    return files.reduce((a: string, b: FileContents) => {
        return a += b.contents;
    }, '');
}