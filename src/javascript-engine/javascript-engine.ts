import { JavascriptEngineConfig } from './javascript-engine.config';
import * as nodePath from 'path';
import * as Promise from 'promise';
import { FileContents } from '../config/website.config';
import { lchmod } from 'fs-extra';

export interface JavascriptEngineApi {
    generateFileOutput: () => Promise<any>;
}

export function JavascriptEngine(config: JavascriptEngineConfig): JavascriptEngineApi {
    return {
        generateFileOutput: () => { return generateJavascriptFiles(config); },
    }
}

export function generateJavascriptFiles(config: JavascriptEngineConfig) {
    return getJavascriptFiles(config).then((files: FileContents[]) => {
        if (!config.isProd) {
            return files;
        }
        let bundle: string = getCompressedJavascriptFiles(config.minify, files);
        return [{
            name: 'scripts.bundle.min.js',
            contents: bundle
        }];
    });
}

export function getJavascriptFiles(config: JavascriptEngineConfig) {
    let operations: Promise<ScriptMap>[] = config.scripts.map((file: string) => {
        return new Promise((res, err) => {            
            let path = nodePath.join(config.cwd, file);
            return config.fsx.readFile(path,  "utf8", (err: any, contents: string) => {
                res({
                    name: file,
                    contents: contents
                });
            });
        })
    });
    return Promise.all(operations);
}

// FILE COMPRESSION
export function getCompressedJavascriptFiles(minify: any, files: FileContents[]) {
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

export function getJavascriptFileMap(files: FileContents[]) {
    var map = {};
    for (var i = 0; i < files.length; i++) {
        map[files[i].name] = files[i].contents;
    }
    return map;
}

export interface ScriptMap {
    name: string;
    contents: any;
}