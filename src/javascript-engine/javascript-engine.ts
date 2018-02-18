import { JavascriptEngine } from './template-engine.javascript';
import { JavascriptEngineConfig } from './javascript-engine.config';
import * as nodePath from 'path';
import * as Promise from 'promise';

export interface JavascriptEngineApi {
    generateFileOutput: () => Promise<any>;
}

export function TemplateEngine(config: JavascriptEngineConfig): JavascriptEngineApi {
    return {
        generateFileOutput: () => { return new Promise(() => {}); },
    }
}