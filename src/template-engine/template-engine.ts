import { CompilerEngineApi } from '../compiler/compiler.engine';
import { FileContents } from '../config/website.config';
import { TemplateEngineConfig } from './template-engine.config'
import { HtmlTemplateEngine } from './template-engine.html';
import * as nodePath from 'path';
import * as Promise from 'promise';

export function TemplateEngine(config: TemplateEngineConfig): CompilerEngineApi {
    return {
        generateFileOutput: () => { return HtmlTemplateEngine(config); },
        generateExpressRoutes: (express) => { return generateExpressRoutes(config, express); }
    }
}

function generateExpressRoutes(config: TemplateEngineConfig, express: any) {
    return HtmlTemplateEngine(config).then((templates: FileContents[]) => {
        return mapExpressRoutes(templates, config.wwwRoot, config.noHtmlSuffix);
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

function mapExpressRoutes(templates: FileContents[], wwwRoot?: string, noHtmlSuffix?: boolean) {
    var map = {};
    for (let i = 0; i < templates.length; i++) {
        let name = wwwRoot ? templates[i].name.replace(wwwRoot, '') : templates[i].name;
        if (!!noHtmlSuffix) { name = name.replace('.html', ''); }
        map[`/${name}`] = (req, res, next) => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(templates[i].contents);
            return res.end();
        }
        if (name.toLocaleLowerCase() == 'index.html' || (!!noHtmlSuffix && name.toLowerCase() == 'index')) {
            map['/'] = map[`/${name}`];
        }
    }
    return map;
}