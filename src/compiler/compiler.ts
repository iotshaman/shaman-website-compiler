import * as Promise from 'promise';
import { CompilerConfig } from './compiler.config';
import { CompilerRuntime } from './compiler.runtime';
import { GlobFactory, GlobMap, loadFileNamesFromGlobs } from '../glob-data'; 
import { FileContents, loadFileContents, bundleFileContents } from '../file-contents';

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
        this.runtime = new CompilerRuntime();
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
    }

    compile() {
        return this.loadRuntimeFiles()
            .then(this.loadRuntimeContent)
            .then(this.bundleRuntimeContents)
            .then(() => {
                return this.runtime;
            })
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

}