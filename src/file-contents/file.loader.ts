import * as Promise from 'promise';
import { CompilerRuntime } from '../compiler';
import { FileContents } from './file.contents';
import * as nodePath from 'path';

export function loadFileContents(config: CompilerRuntime, fsx: any) {
    let fileLoaderOperations: Promise<FileContents[]>[] = [
        fileLoaderFactory(config.cwd, config.files.pages, 'html', fsx),
        fileLoaderFactory(config.cwd, config.files.partials, 'partial', fsx),
        fileLoaderFactory(config.cwd, config.files.styles, 'css', fsx),
        fileLoaderFactory(config.cwd, config.files.scripts, 'js', fsx),
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