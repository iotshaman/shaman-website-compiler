import * as Promise from 'promise';
import { CompilerRuntime } from '../compiler/compiler.runtime';
import { GlobMap } from './glob.data';

// LOAD FILE FROM GLOB CONFIG
export function loadFileNamesFromGlobs(config: CompilerRuntime, glob: any): Promise<GlobMap> {
    let globOperations: Promise<GlobResult>[] = [
        loadGlobData(glob, 'pages', config.globs.pages),
        loadGlobData(glob, 'partials', config.globs.partials),
        loadGlobData(glob, 'styles', config.globs.styles),
        loadGlobData(glob, 'scripts', config.globs.scripts),
    ]
    return Promise.all(globOperations).then((globs: GlobResult[]) => {
        return mapGlobData(globs);
    });
}

function loadGlobData(glob: any, name: string, pattern: string[]): Promise<GlobResult> {
    return glob(pattern).then((files: string[]) => {
        return { name: name, files: sortFiles(files) }
    });
}

function sortFiles(globs: string[]) {
    return globs.sort((a: string, b: string) => {
        return a.toUpperCase().localeCompare(b.toUpperCase());
    });
}

function mapGlobData(globs: GlobResult[]) {
    let map: GlobMap = {
        pages: [],
        partials: [],
        styles: [],
        scripts: []
    }
    for (var i = 0; i < globs.length; i++) {
        map[globs[i].name] = globs[i].files;
    }
    return map;
}

interface GlobResult {
    name: string;
    files: string[];
}