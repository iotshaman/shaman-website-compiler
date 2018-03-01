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
            return generateExpressRoutes(config, compilerEngine, express).then(function() {
                express.use('/', primaryExpressRoute);
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
            expressMap = map;
            if (!!config.autoWatch && !watching) {
                watching = true;
                watchFiles(config, function() {
                    console.log('Updating express routes...');
                    lastModified = new Date();
                    generateExpressRoutes(config, compilerEngine, express);
                });
            }
            return res();
        });
    })
}

let expressMap = {};
let lastModified: Date = new Date((new Date()).toUTCString()) //floor the milliseconds
let primaryExpressRoute = function(req, res, next) {
    if (req.method == "GET" && !!expressMap[req.url]) {
        if (!!req.headers['if-modified-since']) {
            if (lastModified <= new Date(req.headers['if-modified-since'])) {
                res.status(304).send('Not Modified');
                return;
            }
        }
        res.header('Last-Modified', lastModified.toUTCString());
        expressMap[req.url](req, res, next);
    } else {
        next();
    }
}

// WATCH FILES
export function watchFiles(config: CompilerConfig, callback: () => void) {
    return new Promise((res, err) => {
        loadFileDataFromGlobs(config).then((globMap: GlobMap) => {
            var globs = getWatchFileList(config.cwd, globMap);
            config.gaze(globs, function(ex, watcher) {
                if (ex) return err(ex); 
                this.on('changed', () => { callback(); });
                return res();
            });
        })
    });
}

export function getWatchFileList(cwd: string, globMap: GlobMap) {
    var globs = globMap['pages'].map((val) => {
        return nodePath.join(cwd, val);
    });
    globs = globs.concat(globMap['partials'].map((val) => {
        return nodePath.join(cwd, val);
    }));
    globs = globs.concat(globMap['scripts'].map((val) => {
        return nodePath.join(cwd, val);
    }));
    globs = globs.concat(globMap['styles'].map((val) => {
        return nodePath.join(cwd, val);
    }));
    return globs;
}