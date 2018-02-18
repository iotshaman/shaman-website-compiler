import { CompilerConfig } from './compiler.config';
import { TemplateEngine } from '../template-engine/template-engine';
import * as Promise from 'promise';

export function ShamanWebsiteCompiler(config: CompilerConfig) {
    return {
        compile: () => { return compileWebsite(config); }
    }
}

export function compileWebsite(config: CompilerConfig) {
    return loadFileDataFromGlobs(config).then((globMap: GlobMap) => {
        return loadCompilerEngines(config, globMap);  
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
    var engines = {
        templateEngine: TemplateEngine({
            fsx: config.fsx,
            handlebars: config.handlebars,
            cwd: config.cwd,
            defaults: config.defaults,
            pages: !globMap['pages'] ? [] : globMap['pages'],
            partials: !globMap['partials'] ? [] : globMap['partials'],
            styles: !globMap['styles'] ? [] : globMap['styles'],
            scripts: !globMap['scripts'] ? [] : globMap['scripts']
        })
    }
    return engines.templateEngine.generateFileOutput().then((data) => {
        return data;
    })
}