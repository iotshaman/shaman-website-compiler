import * as Promise from 'promise';
import { CompilerRuntime, DynamicPage } from '../compiler';
import { FileData } from './file.data';
import { FileContents } from '../file-contents';
import * as nodePath from 'path';

export function loadFileDataModels(runtime: CompilerRuntime, fsx: any): Promise<FileData[]> {
    let fileList = getJsonFileList(runtime);
    let operations: Promise<FileData>[] = fileList.map((file: string) => {
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

function getJsonFileList(runtime: CompilerRuntime) {
    let dynamicPages = runtime.contents.filter((file: FileContents) => {
        return file.type == 'dynamic';
    });
    return runtime.files.partials.concat(dynamicPages.map((file: FileContents) => {
        return file.name;
    }));
}

function getJsonExtensionFromHtml(file: string) {
    var index = file.lastIndexOf('.html');
    return `${file.substring(0, index)}.json`;
}