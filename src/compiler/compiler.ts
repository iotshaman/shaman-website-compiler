import { CompilerConfig } from './compiler.config';
import { FileContents } from '../config/website.config';
import { CompilerEngineApi, CompilerEngine } from './compiler.engine';
import { TemplateEngine } from '../template-engine/template-engine';
import { JavascriptEngine } from '../javascript-engine/javascript-engine';
import { CssEngine } from '../css-engine/css-engine';
import * as Promise from 'promise';

export function ShamanWebsiteCompiler(config: CompilerConfig) {
    return {
        compile: (express?: any) => { return compileWebsite(config, express); }
    }
}

export function compileWebsite(config: CompilerConfig, express?: any) {
    return loadFileDataFromGlobs(config).then((globMap: GlobMap) => {
        return loadCompilerEngines(config, globMap);  
    }).then((engines: CompilerEngineList) => {
        return CompilerEngine(engines);
    }).then((compilerEngine: CompilerEngineApi): Promise<void | FileContents[]> => {
        if (!express) {
            return compilerEngine.generateFileOutput();
        }
        return compilerEngine.generateExpressRoutes(express);
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
        return { name: name, files: files }
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
            isProd: config.isProd
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