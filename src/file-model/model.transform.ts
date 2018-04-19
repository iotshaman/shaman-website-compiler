import * as Promise from 'promise';
import { FileData } from './file.data';

export function transformFileData(fileDataList: FileData[], transform: (path: string, data: any) => any) {
    return new Promise((res) => {
        if (!transform) res(fileDataList);
        res(fileDataList.map((fileData: FileData) => {
            fileData.data = transform(fileData.template, fileData.data);
            return fileData;
        }));
    });
}