import { CompilerConfig } from './compiler.config';
import { FileContents } from '../config/website.config';
import { CompilerEngineApi, CompilerEngine } from './compiler.engine';
import { TemplateEngine } from '../template-engine/template-engine';
import { JavascriptEngine } from '../javascript-engine/javascript-engine';
import { CssEngine } from '../css-engine/css-engine';
import * as Promise from 'promise';
import * as nodePath from 'path';
import { watchFile } from 'fs-extra';

export function ShamanWebsiteCompiler(config: CompilerConfig) {
    return {
        compile: (express?: any) => { return compileWebsite(config, express); }
    }
}

export function compileWebsite(config: CompilerConfig, express?: any) {
    if (!config.outDir && !express) {
        var e = "Shaman compiler: Please specify 'outDir' or pass an express server as an input parameter";
        throw new Error(e);
    }
    return loadFileDataFromGlobs(config).then((globMap: GlobMap) => {
        return loadCompilerEngines(config, globMap);  
    }).then((engines: CompilerEngineList) => {
        return CompilerEngine(engines);
    }).then((compilerEngine: CompilerEngineApi): Promise<void> => {
        if (!!express) {
            return generateExpressRoutes(config, compilerEngine, express).then(function(routes) {
                express.all('*', routes);
                return;
            });
        }        
        return compilerEngine.generateFileOutput().then((files: FileContents[]) => {
            return writeFilesToOutputDir(config, files);
        })
    });
}

// LOAD FILE FROM GLOB CONFIG
export function loadFileDataFromGlobs(config: CompilerConfig): Promise<GlobMap> {
    let globOperations: Promise<GlobResult>[] = [
        loadGlobData(config.glob, 'pages', config.pages),
        loadGlobData(config.glob, 'partials', config.partials),
        loadGlobData(config.glob, 'styles', config.styles),
        loadGlobData(config.glob, 'scripts', config.scripts),
    ]
    return Promise.all(globOperations).then((globs: GlobResult[]) => {
        return mapGlobData(globs);
    });
}

export function loadGlobData(glob: any, name: string, pattern: string[]): Promise<GlobResult> {
    return glob(pattern).then((files: string[]) => {
        return { name: name, files: sortFiles(files) }
    });
}

export function sortFiles(globs: string[]) {
    return globs.sort((a: string, b: string) => {
        return a.toUpperCase().localeCompare(b.toUpperCase());
    });
}

export function mapGlobData(globs: GlobResult[]) {
    var map = {};
    for (var i = 0; i < globs.length; i++) {
        map[globs[i].name] = globs[i].files;
    }
    return map;
}

export interface GlobResult {
    name: string;
    files: string[];
}

export interface GlobMap {
    [type: string]: string[];
}

// LOAD ENGINES
export function loadCompilerEngines(config: CompilerConfig, globMap: GlobMap) {
    let engines: CompilerEngineList = {
        templateEngine: TemplateEngine({
            fsx: config.fsx,
            handlebars: config.handlebars,
            cwd: config.cwd,
            defaults: config.defaults,
            pages: !globMap['pages'] ? [] : globMap['pages'],
            partials: !globMap['partials'] ? [] : globMap['partials'],
            styles: !globMap['styles'] ? [] : globMap['styles'],
            scripts: !globMap['scripts'] ? [] : globMap['scripts'],
            isProd: config.isProd,
            wwwRoot: config.wwwRoot,
            noHtmlSuffix: config.noHtmlSuffix
        }),
        javascriptEngine: JavascriptEngine({
            fsx: config.fsx,
            minify: config.minify,
            cwd: config.cwd,
            scripts: !globMap['scripts'] ? [] : globMap['scripts'],
            isProd: config.isProd
        }),
        cssEngine: CssEngine({
            fsx: config.fsx,
            minify: config.minifyCss,
            cwd: config.cwd,
            styles: !globMap['styles'] ? [] : globMap['styles'],
            isProd: config.isProd
        })
    }
    return engines;
}

export interface CompilerEngineList {
    templateEngine: CompilerEngineApi;
    javascriptEngine: CompilerEngineApi;
    cssEngine: CompilerEngineApi;
}

// GENERATE NEW FILES IN OUTPUT DIRECTORY
export function writeFilesToOutputDir(config: CompilerConfig, files: FileContents[]) {
    let operations: Promise<void>[] = files.map((file: FileContents) => {
        return config.fsx.outputFile(nodePath.join(config.outDir, file.name), file.contents);
    });
    return Promise.all(operations).then(() => { 
        return; 
    });
}

// CREATE EXPRESS ROUTES
let watching: boolean = false;
export function generateExpressRoutes(config: CompilerConfig, compilerEngine: CompilerEngineApi, express: any) {
    return new Promise(function(res, err) {
        compilerEngine.generateExpressRoutes().then(function(map) {
            if (!!config.autoWatch && !watching) {
                watching = true;
                watchFiles(config, function() {
                    generateExpressRoutes(config, compilerEngine, express);
                });
            }
            return res(generateExpressMap(express, map));
        });
    })
}

let expressMap = function(req, res, next) { next('Not Implemented'); }
export function generateExpressMap(express: any, map: any) {
    expressMap = function(req, res, next) {
        if (req.method == "GET" && !!map[req.url]) {
            map[req.url](req, res, next);
        } else {
            next();
        }
    }
    return expressMap;
}

// WATCH FILES
export function watchFiles(config: CompilerConfig, callback: () => void) {
    return new Promise(function(res, err) {
        config.gaze(config.pages, function(ex, watcher) {
            if (ex) return err(ex); 
            this.on('changed', function(filepath) {
                callback();
            });
            return res();
        });
    });
}