import { GlobMap, GlobPatterns } from '../glob-data';
import { FileContents } from '../file-contents';
import { FileData } from '../file-model';

export class CompilerRuntime {

    isProd: boolean;
    cwd: string;
    globs: GlobPatterns;
    files: GlobMap;
    contents: FileContents[];
    models: FileData[];
    routes: FileContents[];
    routeMap: any;
    wwwRoot: string;

    constructor(isProd?: boolean) {
        this.isProd = !!isProd;
    }
}