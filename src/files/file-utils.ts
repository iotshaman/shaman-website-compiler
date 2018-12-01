import { FileData } from "./file-data.model";

export module FileUtils {

  export function ReduceFileData(files: FileData[][]): FileData[] {
    return files.reduce((a: FileData[], b: FileData[]) => {
      return a.concat(b);
    }, []);
  }  

  export function GetJsonExtensionFromHtml(file: string): string {
    var index = file.lastIndexOf('.html');
    return `${file.substring(0, index)}.json`;
  }

  export function ChangeFileType(file: string, oldExtension: string, newExtention: string): string {
    var index = file.lastIndexOf(`.${oldExtension}`);
    return `${file.substring(0, index)}.${newExtention}`;
  }

  export function RemoveExtension(file: string, extension: string): string {
    var index = file.lastIndexOf(`.${extension}`);
    return file.substring(0, index);
  }
  
}