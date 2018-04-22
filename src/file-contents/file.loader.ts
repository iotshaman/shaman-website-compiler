import * as Promise from 'promise';
import { CompilerRuntime, DynamicPage } from '../compiler';
import { FileContents } from './file.contents';
import * as nodePath from 'path';

export function loadFileContents(runtime: CompilerRuntime, dynamicPages: DynamicPage[], fsx: any) {
    let dynamicTemplates = dynamicPages.map((page: DynamicPage) => {
        return page.template;
    });
    let fileLoaderOperations: Promise<FileContents[]>[] = [
        fileLoaderFactory(runtime.cwd, runtime.files.pages, 'html', fsx),
        fileLoaderFactory(runtime.cwd, runtime.files.styles, 'css', fsx),
        fileLoaderFactory(runtime.cwd, runtime.files.scripts, 'js', fsx),
        fileLoaderFactory(runtime.cwd, runtime.files.partials, 'partial', fsx),
        fileLoaderFactory(runtime.cwd, dynamicTemplates, 'dynamic', fsx)
    ]
    return Promise.all(fileLoaderOperations).then((contents: FileContents[][]) => {
        return contents.reduce((a: FileContents[], b: FileContents[]) => {
            return a.concat(b);
        }, []);
    })
}

function fileLoaderFactory(root: string, obj: any[], type: string, fsx: any) {
    let operations: Promise<FileContents>[] = obj.map((file: string) => {
        return new Promise((res, err) => {            
            let path = nodePath.join(root, file);
            return fsx.readFile(path,  "utf8", (err: any, contents: string) => {
                res({
                    name: file,
                    contents: contents,
                    type: type
                });
            });
        })
    });
    return Promise.all(operations);
}