import * as Promise from 'promise';
import { FileData } from './file.data';
import { CompilerRuntime, DynamicPage } from '../compiler';

export function transformFileData(runtime: CompilerRuntime, transform: (path: string, data: any) => any) {
    return new Promise((res) => {
        if (!transform) res(runtime.models);
        let rslt: FileData[] = runtime.models.map((fileData: FileData) => {
            fileData.data = transform(fileData.template, fileData.data);
            return fileData;
        });
        res(rslt);
    });
}

export function transformDynamicFileData(
    runtime: CompilerRuntime, 
    dynamicPages: DynamicPage[],
    transform: (path: string, data: any) => any) {
    //----------------------------------------------
    return new Promise((res) => {
        if (!transform || dynamicPages.length == 0) res(runtime.models);
        let tmp: FileData[][] = dynamicPages.map((page: DynamicPage) => {
            let model = runtime.models.filter((data: FileData) => {
                return data.template == page.template;
            });
            return page.routes.map((path: string) => {
                return {
                    template: path,
                    data: model[0].data
                }
            })
        });
        let rslt: FileData[] = tmp.reduce((a: FileData[], b: FileData[]) => {
            return a.concat(b);
        }, []);
        rslt = rslt.map((fileData: FileData) => {
            fileData.data = transform(fileData.template, fileData.data);
            return fileData;
        });
        res(rslt.concat(runtime.models));
    });
}