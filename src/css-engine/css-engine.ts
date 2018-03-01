import { CompilerEngineApi } from '../compiler/compiler.engine';
import { CssEngineConfig } from './css-engine.config';
import { FileContents } from '../config/website.config';
import * as nodePath from 'path';
import * as Promise from 'promise';

export function CssEngine(config: CssEngineConfig): CompilerEngineApi {
    return {
        generateFileOutput: () => { return generateCssFiles(config); },
        generateExpressRoutes: () => { return generateExpressRoutes(config); }
    }
}

export function generateCssFiles(config: CssEngineConfig) {
    return loadCssFiles(config).then((files: FileContents[]) => {
        if (!config.isProd) {
            return files;
        }
        let bundle: string = getCompressedCssFiles(config.minify, files);
        return [{
            name: 'styles.bundle.min.css',
            contents: bundle
        }];
    });
}

export function loadCssFiles(config: CssEngineConfig) {
    let operations: Promise<FileContents>[] = config.styles.map((file: string) => {
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
export function getCompressedCssFiles(minifyCss: any, files: FileContents[]) {
    var reducedFileList = reduceCssFiles(files);
    var rslt = new minifyCss({}).minify(reducedFileList);
    return rslt.styles;
}

export function reduceCssFiles(files: FileContents[]) {
    return files.reduce((a: string, b: FileContents) => {
        return a += b.contents;
    }, '');
}

function generateExpressRoutes(config: CssEngineConfig) {
    return generateCssFiles(config).then((templates: FileContents[]) => {
        return mapExpressRoutes(templates, 'text/css');
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