import { FileContents } from '../config/website.config';
import { CompilerEngineList } from './compiler';
import * as Promise from 'promise';

export interface CompilerEngineApi {
    generateFileOutput: () => Promise<FileContents[]>;
    generateExpressRoutes: (express: any) => Promise<void>;
}

export function CompilerEngine(engines: CompilerEngineList): CompilerEngineApi {
    return {
        generateFileOutput: () => { return generateAllFiles(engines); },
        generateExpressRoutes: (express) => { return generateAllExpressRoutes(engines, express); }
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

export function generateAllExpressRoutes(engines: CompilerEngineList, express: any) {
    return Promise.all([
        engines.templateEngine.generateExpressRoutes(express),
        engines.javascriptEngine.generateExpressRoutes(express),
        engines.cssEngine.generateExpressRoutes(express)
    ]).then(() => { return; });
}