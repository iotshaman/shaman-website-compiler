import { TemplateEngineConfig } from './template-engine.config';
import { GetMetaTagsTemplate } from './defaults/meta-tags';
import { GetStylesTemplate } from './defaults/styles';
import { GetScriptsTemplate } from './defaults/scripts';
import * as nodePath from 'path';
import * as Promise from 'promise';

export function HtmlTemplateEngine(config: TemplateEngineConfig): Promise<any> {
    return generatePartials(config)
        .then(() => { 
            return generateTemplatesFromFiles(config); 
        })
        .then((templates: TemplateObject[]) => { 
            return generateHtmlOutput(config, templates); 
        });
}

// GENERATE PARTIAL FILES
export function generatePartials(config: TemplateEngineConfig) {
    return generatePartialsFromFiles(config).then(() => {
        config.handlebars.registerPartial('$.tags',GetMetaTagsTemplate());
        config.handlebars.registerPartial('$.styles', GetStylesTemplate());
        config.handlebars.registerPartial('$.scripts', GetScriptsTemplate());
    });
}

export function generatePartialsFromFiles(config: TemplateEngineConfig) {
    var operations = createReadOperations(config);
    return insertHandlebarsPartials(operations);
}

export function createReadOperations(config: TemplateEngineConfig) {
    let rslt: Promise<void>[] = config.partials.map((file: string) => {
        return new Promise((res, err) => {            
            let path = nodePath.join(config.cwd, file);
            return config.fsx.readFile(path,  "utf8", (err: any, contents: string) => {
                config.handlebars.registerPartial(file, contents);
                res();
            });
        })
    });
    return rslt;
}

export function insertHandlebarsPartials(operations: Promise<void>[]) {
    return Promise.all(operations).then(() => { return; });
}

// GENERATE TEMPALTE OBJECT
export function generateTemplatesFromFiles(config: TemplateEngineConfig) {
    return getTemplateData(config).then((data) => {
        return createTemplateObject(config, data);
    });
}

export function getTemplateData(config: TemplateEngineConfig) {
    var operations = config.pages.map((file: string) => {
        return new Promise((res, err) => {            
            let path = nodePath.join(config.cwd, file);
            return config.fsx.readFile(path,  "utf8", (err: any, contents: string) => {
                res({
                    file: file,
                    contents: contents
                });
            });
        })
    });
    return Promise.all(operations);
}

export function createTemplateObject(config: TemplateEngineConfig, data: any[]): TemplateObject[] {
    let rslt: TemplateObject[] = [];
    for (var i = 0; i < data.length; i++) {
        rslt.push({
            name: data[i].file,
            compile: config.handlebars.compile(data[i].contents)
        });
    }
    return rslt;
}

export interface TemplateObject {
    name: string;
    compile: (data: any, options?: any) => string;
}

// GENERATE HTML OUTPUT
export function generateHtmlOutput(config: TemplateEngineConfig, templates: TemplateObject[]) {
    return getDataFromJsonFiles(config).then((templateData: TemplateData[]) => {
        return compileTemplates(config, templates, templateData)
    });
}

export function getDataFromJsonFiles(config: TemplateEngineConfig) {
    let operations: Promise<TemplateData>[] = config.pages.map((file: string) => {
        return new Promise((res, err) => {            
            let path = nodePath.join(config.cwd, getJsonExtensionFromHtml(file));
            return config.fsx.readJson(path, (err: any, data: any) => {
                res({
                    name: file,
                    data: data
                });
            });
        })
    });
    return Promise.all(operations);
}

export function compileTemplates(config: TemplateEngineConfig, templates: TemplateObject[], data: TemplateData[]) {
    var dataMap = {};
    for (var i = 0; i < data.length; i++) {
        dataMap[data[i].name] = data[i].data;
        dataMap[data[i].name]["$"] = { 
            scripts: config.scripts,
            stypes: config.styles,
            defaults: config.defaults 
        };
    }
    let rslt: TemplateData[] = templates.map((template: TemplateObject) => {
        return {
            name: template.name,
            data: template.compile(dataMap[template.name])
        }
    });
    return rslt;
}

export function getJsonExtensionFromHtml(file: string) {
    var index = file.lastIndexOf('.html');
    return `${file.substring(0, index)}.json`;
}

export interface TemplateData {
    name: string;
    data: any;
}