import { FileContents } from '../config/website.config';
import { CompilerEngineList } from './compiler';
import * as Promise from 'promise';

export interface CompilerEngineApi {
    generateFileOutput: () => Promise<FileContents[]>;
    generateExpressRoutes: () => Promise<any>;
}

export function CompilerEngine(engines: CompilerEngineList): CompilerEngineApi {
    return {
        generateFileOutput: () => { return generateAllFiles(engines); },
        generateExpressRoutes: () => { return generateAllExpressRoutes(engines); }
    }
}

export function generateAllFiles(engines: CompilerEngineList) {
    return Promise.all([
        engines.templateEngine.generateFileOutput(),
        engines.javascriptEngine.generateFileOutput(),
        engines.cssEngine.generateFileOutput()
    ]).then((contents: FileContents[][]) => {
        return contents.reduce((a, b) => { return a.concat(b); });
    });
}

export function generateAllExpressRoutes(engines: CompilerEngineList) {
    return Promise.all([
        engines.templateEngine.generateExpressRoutes(),
        engines.javascriptEngine.generateExpressRoutes(),
        engines.cssEngine.generateExpressRoutes()
    ]).then((maps: any[]) => { 
        return maps.reduce(function(a, b) {
            let keys = Object.keys(b);
            for (var i = 0; i < keys.length; i++) {
                a[keys[i]] = b[keys[i]];
            }
            return a;
        }, {});
    });
}