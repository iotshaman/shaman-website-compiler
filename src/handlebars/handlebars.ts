import * as Promise from 'promise';
import { FileContents } from '../file-contents';
import { CompilerRuntime } from '../compiler';
import { FileData } from '../file-model';
import { registerHandlebarsPartials } from './handlebars.partials';
import { registerHandlebarsHelpers } from './handlebars.helpers';

export function registerHandlebars(runtime: CompilerRuntime, handlebars: any) {
    registerHandlebarsPartials(runtime, handlebars);
    registerHandlebarsHelpers(handlebars);
}

export function compileTemplates(runtime: CompilerRuntime, handlebars: any): Promise<FileContents[]> {
    return new Promise((res) => {
        let defaultOptions = {
            scripts: getScripts(runtime.contents, runtime.isProd),
            styles: getStyles(runtime.contents, runtime.isProd),
            defaults: {}
        }
        let pages = runtime.contents.filter((file: FileContents) => {
            return file.type == 'html';
        });
        let preCompile = pages.map((file: FileContents) => {
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
        res(preCompile.map((data: any) => {
            let compile = handlebars.compile(data.view);
            let route: FileContents = {
                name: data.name.slice(0, -5),
                contents: compile(data.model),
                type: 'router.html'
            }
            return route;
        }));
    })
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