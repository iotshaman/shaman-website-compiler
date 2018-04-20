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
            scripts: getScripts(runtime.contents, runtime.isProd),
            styles: getStyles(runtime.contents, runtime.isProd),
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
    let allRoutes: FileContents[][] = dynamicPages.map((page: DynamicPage) => {
        let content = runtime.contents.filter((file: FileContents) => {
            return file.name == page.template;
        });
        return page.routes.map((route: string) => {
            return {
                name: route,
                contents: content[0].contents,
                type: page.template
            }
        });
    });
    let routes = allRoutes.reduce((a: FileContents[], b: FileContents[]) => {
        return a.concat(b);
    }, []);
    return routes.map((file: FileContents) => {
        let models = runtime.models.filter((data: FileData) => {
            return data.template == file.type;
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

function getScripts(scripts: FileContents[], isProd: boolean) {
    let filtered = scripts.filter((file: FileContents) => {
        if (isProd) return file.type == 'js.bundle.hash';
        return file.type == 'js';
    });
    return filtered.map((file: FileContents) => {
        return file.name;
    });
}

function getStyles(styles: FileContents[], isProd: boolean) {
    let filtered = styles.filter((file: FileContents) => {
        if (isProd) return file.type == 'css.bundle.hash';
        return file.type == 'css';
    });
    
    return filtered.map((file: FileContents) => {
        return file.name;
    });
}