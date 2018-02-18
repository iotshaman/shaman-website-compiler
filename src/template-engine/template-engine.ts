import { HtmlTemplateEngine, TemplateData } from './template-engine.html';
import { TemplateEngineConfig } from './template-engine.config';
import * as nodePath from 'path';
import * as Promise from 'promise';

export interface TemplateEngineApi {
    generateHtmlOutput: () => Promise<TemplateData[]>;
    generateExpressRoutes: (express: any) => any;
}

export function TemplateEngine(config: TemplateEngineConfig): TemplateEngineApi {
    return {
        generateHtmlOutput: () => { return HtmlTemplateEngine(config); },
        generateExpressRoutes: (express) => { return generateExpressRoutes(config, express); }
    }
}

function generateHtmlOutput(config: TemplateEngineConfig) {
    return HtmlTemplateEngine(config);
}

function generateExpressRoutes(config: TemplateEngineConfig, express: any) {
    return HtmlTemplateEngine(config).then((templates: TemplateData[]) => {
        return mapExpressRoutes(templates);
    }).then((map: any) => {
        express.all('*', function(req, res, next) {
            if (req.method == "GET" && !!map[req.url]) {
                map[req.url](req, res, next);
            } else {
                next();
            }
        });
    });
}

function mapExpressRoutes(templates: TemplateData[]) {
    var map = {};
    for (let i = 0; i < templates.length; i++) {
        map[`/${templates[i].name}`] = (req, res, next) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(templates[i].data);
            return res.end();
        }
    }
    return map;
}