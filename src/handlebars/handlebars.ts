import * as Promise from 'promise';
import { FileContents } from '../file-contents';
import { CompilerRuntime, DynamicPage } from '../compiler';
import { FileData } from '../file-model';
import { registerHandlebarsPartials } from './handlebars.partials';
import { registerHandlebarsHelpers } from './handlebars.helpers';

export function registerHandlebars(runtime: CompilerRuntime, handlebars: any) {
    registerHandlebarsPartials(runtime, handlebars);
    registerHandlebarsHelpers(handlebars);
}

export function compileTemplates(runtime: CompilerRuntime, handlebars: any, dynamicPages: DynamicPage[])
: Promise<FileContents[]> {
    return new Promise((res) => {
        let defaultOptions = {
            scripts: getScripts(runtime.contents, runtime.isProd, runtime.wwwRoot),
            styles: getStyles(runtime.contents, runtime.isProd, runtime.wwwRoot),
            defaults: {}
        }
        let preCompile = getPreCompileData(runtime, defaultOptions);
        let dynamicPreCompile = getPreCompileDynamicRoutes(runtime, defaultOptions, dynamicPages);
        preCompile = preCompile.concat(dynamicPreCompile);
        res(preCompile.map((data: any) => {
            let compile = handlebars.compile(data.view);
            let name = data.name.indexOf('html') > -1 ? data.name.slice(0, -5) : data.name;
            let route: FileContents = {
                name: name,
                contents: compile(data.model),
                type: 'router.html'
            }
            return route;
        }));
    })
}

function getPreCompileData(runtime: CompilerRuntime, defaultOptions: any) {
    let pages = runtime.contents.filter((file: FileContents) => {
        return file.type == 'html';
    });
    return pages.map((file: FileContents) => {
        let models = runtime.models.filter((data: FileData) => {
            return data.template == file.name;
        });
        let obj = {
            model: models.length > 0 ? models[0].data : {},
            view: file.contents,
            name: file.name
        }
        obj.model["$"] = defaultOptions;
        return obj;
    });
}

function getPreCompileDynamicRoutes(runtime: CompilerRuntime, defaultOptions: any, dynamicPages: DynamicPage[]) {
    let pageGrid: FileContents[][] = dynamicPages.map((page: DynamicPage) => {
        let contents = runtime.contents.filter((file: FileContents) => {
            return file.type == 'dynamic' && file.name == page.template;
        });
        return page.routes.map((route: string) => {
            return {
                name: route,
                contents: contents.length > 0 ? contents[0].contents : '',
                type: 'tmp'
            }
        });
    });
    let pages = pageGrid.reduce((a: FileContents[], b: FileContents[]) => {
        return a.concat(b);
    }, []);
    return pages.map((file: FileContents) => {
        let models = runtime.models.filter((data: FileData) => {
            return data.template == file.name;
        });
        let obj = {
            model: models.length > 0 ? models[0].data : {},
            view: file.contents,
            name: file.name
        }
        obj.model["$"] = defaultOptions;
        return obj;
    });
}

function getScripts(scripts: FileContents[], isProd: boolean, wwwRoot: string) {
    let filtered = scripts.filter((file: FileContents) => {
        if (isProd) return file.type == 'js.bundle.hash';
        return file.type == 'js';
    });
    return filtered.map((file: FileContents) => {
        if (!wwwRoot) return file.name;
        return file.name.replace(wwwRoot, '');
    });
}

function getStyles(styles: FileContents[], isProd: boolean, wwwRoot: string) {
    let filtered = styles.filter((file: FileContents) => {
        if (isProd) return file.type == 'css.bundle.hash';
        return file.type == 'css';
    });    
    return filtered.map((file: FileContents) => {
        if (!wwwRoot) return file.name;
        return file.name.replace(wwwRoot, '');
    });
}