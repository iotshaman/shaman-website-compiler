import * as Promise from 'promise';
import { CompilerConfig } from './compiler.config';
import { CompilerRuntime } from './compiler.runtime';
import { GlobFactory, GlobMap, loadFileNamesFromGlobs } from '../glob-data'; 
import { FileContents, loadFileContents, bundleFileContents} from '../file-contents';
import { FileData, loadFileDataModels, transformFileData } from '../file-model';
import { registerHandlebars, compileTemplates } from '../handlebars';

export class ShamanWebsiteCompiler {

    //METHOD DEPENDENCIES
    glob: (patterns: string[]) => Promise<string[]>;
    fsx: any;
    handlebars: any;
    minify: (contents: any, opts: any) => any;
    minifyCss: (contents: string) => any;
    gaze: (pattern: string | string[], callback: any) => void;
    objectHash: any;
    //INTERNAL DEPENDENCIES
    protected runtime: CompilerRuntime;
    protected isProd: boolean;
    protected outDir: string;
    protected wwwRoot: string;
    protected noHtmlSuffix: boolean;
    protected autoWatch: boolean;
    protected transformModels: (path: string, data: any) => any;

    constructor(config: CompilerConfig) {
        if (!config.cwd) throw new Error('Must provide current working directory (cwd) in config.');
        this.glob = GlobFactory({ cwd: config.cwd });
        this.fsx = require('fs-extra');
        this.handlebars = require('handlebars')
        this.minify = require('uglify-es').minify;
        this.minifyCss = require('clean-css');
        this.gaze = require('gaze');
        var hashFactory = require('node-object-hash');
        this.objectHash = hashFactory({sort:true, coerce:true}).hash;
        this.setDefaults(config);
    }

    protected setDefaults(config: CompilerConfig) {
        this.runtime = new CompilerRuntime(config.isProd);
        this.runtime.cwd = config.cwd;
        this.runtime.globs = {
            pages: !!config.pages ? config.pages : ['**/*.html', '!**/*.partial.html'],
            partials: !!config.partials ? config.partials : ['**/*.partial.html'],
            styles: !!config.styles ? config.styles : ['**/*.css'],
            scripts: !!config.scripts ? config.scripts : ['**/*.js']
        }
        this.isProd = !!config.isProd;
        this.outDir = !!config.outDir ? config.outDir : '';
        this.wwwRoot = !!config.wwwRoot ? config.wwwRoot : '';
        this.noHtmlSuffix = !!config.noHtmlSuffix;
        this.autoWatch = !!config.autoWatch;
        this.transformModels = config.transformModels;
    }

    public compile() {
        return this.loadRuntimeFiles()
            .then(this.loadRuntimeContent)
            .then(this.bundleRuntimeContents)
            .then(this.loadRuntimeModels)
            .then(this.transformRuntimeModels)
            .then(this.loadHandlebarsResources)
            .then(this.compileHandlebarsTemplates)
            .then(this.addAssetRoutes)
            .then(this.loadRouteMap)
            .then(() => {
                return this.runtime;
            })
    }

    public router = (req, res, next) => {
        if (!this.runtime.routes) return next(0);
        if (req.method == "GET" && this.runtime.routeMap[req.url] != null) {
            return next(1);
        } else if (req.method == "GET" && req.url.indexOf('swc.bundle.min.js') > -1) {
            return next(2);
        } else if (req.method == "GET" && req.url.indexOf('swc.bundle.min.css') > -1) {
            return next(3);
        }
        next(4);
    }

    protected loadRuntimeFiles = (): Promise<void> => {
        return loadFileNamesFromGlobs(this.runtime, this.glob)
            .then((files: GlobMap) => {
                this.runtime.files = files;
                return;
            })
    }

    protected loadRuntimeContent = (): Promise<void> => {
        return loadFileContents(this.runtime, this.fsx)
            .then((contents: FileContents[]) => {
                this.runtime.contents = contents;
                return;
            })
    }

    protected bundleRuntimeContents = (): Promise<void> => {
        return new Promise((res) => {
            if (!this.isProd) res();
            let bundles = bundleFileContents(this.runtime, this.objectHash, this.minify, this.minifyCss);
            this.runtime.contents = this.runtime.contents.concat(bundles);
            res();
        });
    }

    protected loadRuntimeModels = (): Promise<void> => {
        return loadFileDataModels(this.runtime, this.fsx)
            .then((models: FileData[]) => {
                this.runtime.models = models;
                return;
            })
    }

    protected transformRuntimeModels = (): Promise<void> => {
        return transformFileData(this.runtime.models, this.transformModels)
            .then((models: FileData[]) => {
                this.runtime.models = models;
                return;
            })
    }

    protected loadHandlebarsResources = (): Promise<void> => {
        return new Promise((res) => {
            registerHandlebars(this.runtime, this.handlebars);
            res();
        });
    }

    protected compileHandlebarsTemplates = (): Promise<void> => {
        return compileTemplates(this.runtime, this.handlebars)
            .then((routes: FileContents[]) => {
                this.runtime.routes = routes;
                return;
            })
    }

    protected addAssetRoutes = () => {
        return new Promise((res) => {
            let assets = this.runtime.contents.filter((file: FileContents) => {
                if (this.isProd) return file.type.indexOf('.bundle.hash') > -1;
                return file.type == 'css' || file.type == 'js'; 
            });
            this.runtime.routes = this.runtime.routes.concat(assets);
            res();
        });
    }

    protected loadRouteMap = () => {
        return new Promise((res) => {
            this.runtime.routeMap = this.runtime.routes.reduce((a: any, b: FileContents, i: number) => {
                a[b.name] = i;
                return a;
            }, {});
            res();
        });
    }

}