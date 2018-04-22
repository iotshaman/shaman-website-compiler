import * as Promise from 'promise';
import { CompilerConfig, CacheIntervals } from './compiler.config';
import { CompilerRuntime } from './compiler.runtime';
import { GlobFactory, GlobMap, loadFileNamesFromGlobs } from '../glob-data'; 
import { FileContents, loadFileContents, bundleFileContents} from '../file-contents';
import { FileData, loadFileDataModels, transformFileData } from '../file-model';
import { registerHandlebars, compileTemplates } from '../handlebars';
import { DynamicPage } from './index';
import * as nodePath from 'path';

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
    protected dynamicPages: DynamicPage[];
    protected isProd: boolean;
    protected outDir: string;
    protected wwwRoot: string;
    protected noHtmlSuffix: boolean;
    protected autoWatch: boolean;
    protected transformModels: (path: string, data: any) => any;
    protected cacheIntervals: CacheIntervals;
    private compiled: boolean = false;
    private lastModified: Date;

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
            pages: !!config.pages ? config.pages : ['**/*.html', '!**/*.partial.html', '!**/*.dynamic.html'],
            partials: !!config.partials ? config.partials : ['**/*.partial.html'],
            styles: !!config.styles ? config.styles : ['**/*.css'],
            scripts: !!config.scripts ? config.scripts : ['**/*.js']
        }
        this.runtime.wwwRoot = config.wwwRoot;
        this.dynamicPages = !!config.dynamicPages ? config.dynamicPages : [];
        this.isProd = !!config.isProd;
        this.outDir = !!config.outDir ? config.outDir : '';
        this.wwwRoot = !!config.wwwRoot ? config.wwwRoot : '';
        this.noHtmlSuffix = !!config.noHtmlSuffix;
        this.autoWatch = !!config.autoWatch;
        this.transformModels = config.transformModels;
        this.cacheIntervals = !!config.cacheIntervals ? config.cacheIntervals : {};
    }

    public compile = () => {
        this.lastModified = new Date((new Date()).toUTCString());
        return Promise.resolve()
            .then(this.loadRuntimeFiles)
            .then(this.loadRuntimeContent)
            .then(this.bundleRuntimeContent)
            .then(this.loadRuntimeModels)
            .then(this.transformRuntimeModels)
            .then(this.loadHandlebarsResources)
            .then(this.compileHandlebarsTemplates)
            .then(this.addAssetRoutes)
            .then(this.transformRouteNames)
            .then(this.loadRouteMap)
            .then(() => {
                this.finishCompilation();
                return this.runtime;
            })
    }

    public router = (req, res, next) => {
        if (!this.runtime.routes) { 
            next(); return; 
        } else if (req.method == "GET" && req.url == '/') {
            this.loadExpressRoute(req, res, next, 'index', null); return;
        } else if (req.method == "GET" && this.runtime.routeMap[req.url] != null) {
            this.loadExpressRoute(req, res, next, req.url, null); return;
        } else if (this.isProd && req.method == "GET" && req.url.indexOf('swc.bundle.min.js') > -1) {
            this.loadExpressRoute(req, res, next, req.url, 'js'); return;
        } else if (this.isProd && req.method == "GET" && req.url.indexOf('swc.bundle.min.css') > -1) {
            this.loadExpressRoute(req, res, next, req.url, 'css'); return;
        }
        next(); return;
    }

    protected loadRuntimeFiles = (): Promise<void> => {
        return loadFileNamesFromGlobs(this.runtime, this.glob)
            .then((files: GlobMap) => {
                this.runtime.files = files;
                return;
            })
    }

    protected loadRuntimeContent = (): Promise<void> => {
        return loadFileContents(this.runtime, this.dynamicPages, this.fsx)
            .then((contents: FileContents[]) => {
                this.runtime.contents = contents;
                return;
            })
    }

    protected bundleRuntimeContent = (): Promise<void> => {
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
        return compileTemplates(this.runtime, this.handlebars, this.dynamicPages)
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

    protected transformRouteNames = () => {
        return new Promise((res) => {
            if (!this.wwwRoot) { res(); return; }
            this.runtime.routes = this.runtime.routes.map((route: FileContents) => {
                route.name = route.name.replace(this.wwwRoot, '');
                return route;
            });
            res(); return;
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

    protected finishCompilation = () => {
        let cleanup: Promise<void>[] = [];
        if (!this.compiled && this.autoWatch) {
            let watchFiles: string[] = this.getWatchFileList();
            cleanup.push(this.beginWatchFiles(watchFiles, this.compile))
        }
        if (this.outDir != '') {
            this.outputFilesToDirectory();
        }
        Promise.all(cleanup);
        this.compiled = true;
    }

    protected beginWatchFiles = (fileList: string[], callback): Promise<void> => {
        return new Promise((res, err) => {
            this.gaze(fileList, function (ex, watcher) {
                if (ex) return err(ex); 
                this.on('changed', () => { 
                    callback(); 
                });
                return res();
            });
        });
    }

    protected outputFilesToDirectory = () => {
        let operations: Promise<void>[] = this.runtime.routes.map((file: FileContents) => {
            let path = nodePath.join(this.outDir, file.name);
            if (file.type == 'router.html') { path = `${path}.html`; }
            return this.fsx.outputFile(path, file.contents);
        });
        return Promise.all(operations).then(() => { 
            return; 
        });
    }

    private loadExpressRoute = (req, res, next, path, bundleType) => {
        if (!!req.headers && !!req.headers['if-modified-since']) {
            if (this.lastModified <= new Date(req.headers['if-modified-since'])) {
                res.status(304).send('Not Modified'); return;
            }
        }
        let route: FileContents[] = [];
        if (!bundleType) {
            route = this.runtime.routes.filter((file: FileContents) => {
                return file.name == path;
            });
        } else {
            route = this.runtime.routes.filter((file: FileContents) => {
                return file.type == `${bundleType}.bundle.hash`
            });
        }
        if (!route || route.length == 0) { next(); return; }
        return this.sendResponse(route[0].contents, route[0].type, res);
    }

    private sendResponse = (content: string, contentType: string, res) => {
        let mimeType = this.getMimeType(contentType);
        let cacheInterval = this.cacheIntervals[mimeType];
        this.applyHttpHeaders(mimeType, cacheInterval, res);
        res.write(content);
        res.end(); return;
    }

    private applyHttpHeaders = (mimeType: string, cacheInterval: number, res) => {
        if (!!cacheInterval && cacheInterval != -1) {
            this.applyCacheHeaders(cacheInterval, res);
        } else if (!cacheInterval && !!this.cacheIntervals['*']) {
            if (this.cacheIntervals['*'] != -1) {
                this.applyCacheHeaders(this.cacheIntervals['*'], res);
            }
        } 
        res.writeHead(200, {'Content-Type': mimeType});
    }

    private getMimeType = (contentType: string) => {
        if (contentType.indexOf('css') > -1) return 'text/css'; 
        if (contentType.indexOf('js') > -1) return 'text/javascript'; 
        if (contentType.indexOf('html') > -1) return 'text/html'; 
        return 'text/plain';
    }

    private applyCacheHeaders(milliseconds: number, res) {
        res.header('Last-Modified', this.lastModified.toUTCString());
        res.header(`Cache-Control", "public, max-age=${milliseconds}`);
        res.header("Expires", new Date(Date.now() + milliseconds).toUTCString());
    }

    private getWatchFileList = (): string[] => {
        if (!this.runtime) return [];
        let rslt = this.runtime.files.pages.concat(this.runtime.files.scripts);
        rslt = rslt.concat(this.runtime.files.styles);
        rslt = rslt.concat(this.runtime.files.partials);
        rslt = rslt.concat(this.dynamicPages.map((page: DynamicPage) => {
            return page.template;
        }));
        return rslt.map((path: string) => {
            return nodePath.join(this.runtime.cwd, path);
        });
    }

}