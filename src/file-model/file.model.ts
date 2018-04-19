import * as Promise from 'promise';
import { CompilerRuntime } from '../compiler';
import { FileData } from './file.data';
import * as nodePath from 'path';

export function loadFileDataModels(runtime: CompilerRuntime, fsx: any): Promise<FileData[]> {
    let operations: Promise<FileData>[] = runtime.files.pages.map((file: string) => {
        return new Promise((res, err) => {            
            let path = nodePath.join(runtime.cwd, getJsonExtensionFromHtml(file));
            return fsx.readJson(path, (err: any, data: any) => {
                res({
                    template: file,
                    data: err ? {} : data
                });
            });
        })
    });
    return Promise.all(operations);
}

function getJsonExtensionFromHtml(file: string) {
    var index = file.lastIndexOf('.html');
    return `${file.substring(0, index)}.json`;
}