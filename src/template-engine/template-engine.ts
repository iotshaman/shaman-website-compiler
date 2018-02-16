import { HtmlTemplateEngine } from './template-engine.html';
import { TemplateEngineConfig } from './template-engine.config';
import * as nodePath from 'path';
import * as Promise from 'promise';

export function TemplateEngine(config: TemplateEngineConfig): () => any {
    return () => {
        return HtmlTemplateEngine(config);
    }
}