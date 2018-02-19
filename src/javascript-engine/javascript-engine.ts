import { CompilerEngineApi } from '../compiler/compiler.engine';
import { JavascriptEngineConfig } from './javascript-engine.config';
import { FileContents } from '../config/website.config';
import * as nodePath from 'path';
import * as Promise from 'promise';

export function JavascriptEngine(config: JavascriptEngineConfig): CompilerEngineApi {
    return {
        generateFileOutput: () => { return generateJavascriptFiles(config); },
        generateExpressRoutes: (express) => { return generateExpressRoutes(config, express); }
    }
}

export function generateJavascriptFiles(config: JavascriptEngineConfig) {
    return loadJavascriptFiles(config).then((files: FileContents[]) => {
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

export function loadJavascriptFiles(config: JavascriptEngineConfig) {
    let operations: Promise<FileContents>[] = config.scripts.map((file: string) => {
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

function generateExpressRoutes(config: JavascriptEngineConfig, express: any) {
    return generateJavascriptFiles(config).then((templates: FileContents[]) => {
        return mapExpressRoutes(templates, 'text/javascript');
    }).then((map: any) => {
        express.all('*', function(req, res, next) {
            if (req.method == "GET" && !!map[req.url]) {
                map[req.url](req, res, next);
            } else {
                next();
            }
        });
        return;
    });
}

function mapExpressRoutes(templates: FileContents[], mimeType: string) {
    var map = {};
    for (let i = 0; i < templates.length; i++) {
        map[`/${templates[i].name}`] = (req, res, next) => {
            res.writeHead(200, {'Content-Type': mimeType});
            res.write(templates[i].contents);
            return res.end();
        }
    }
    return map;
}