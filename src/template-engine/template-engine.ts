import { TemplateEngineConfig } from './template-engine.config'
import { HtmlTemplateEngine, TemplateData } from './template-engine.html';
import * as nodePath from 'path';
import * as Promise from 'promise';

export interface TemplateEngineApi {
    generateFileOutput: () => Promise<TemplateData[]>;
    generateExpressRoutes: (express: any) => any;
}

export function TemplateEngine(config: TemplateEngineConfig): TemplateEngineApi {
    return {
        generateFileOutput: () => { return HtmlTemplateEngine(config); },
        generateExpressRoutes: (express) => { return generateExpressRoutes(config, express); }
    }
}

function generateExpressRoutes(config: TemplateEngineConfig, express: any) {
    return HtmlTemplateEngine(config).then((templates: TemplateData[]) => {
        return mapExpressRoutes(templates, 'text/html');
    }).then((map: any) => {
        express.all('*', function(req, res, next) {
            if (req.method == "GET" && !!map[req.url]) {
                map[req.url](req, res, next);
            } else {
                next();
            }
        });
        return;
    });
}

function mapExpressRoutes(templates: TemplateData[], mimeType: string) {
    var map = {};
    for (let i = 0; i < templates.length; i++) {
        map[`/${templates[i].name}`] = (req, res, next) => {
            res.writeHead(200, {'Content-Type': mimeType});
            res.write(templates[i].data);
            return res.end();
        }
    }
    return map;
}