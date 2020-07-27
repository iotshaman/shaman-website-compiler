import { FileData } from "../models";

export function ReduceFileData(files: FileData[][]): FileData[] {
  return files.reduce((a: FileData[], b: FileData[]) => {
    return a.concat(b);
  }, []);
}

export function GetFileExtension(file: string): string {
  let index = file.lastIndexOf('.');
  if (index < 0) return '';
  return file.substring(index + 1);
}

export function GetJsonExtensionFromHtml(file: string): string {
  var index = file.lastIndexOf('.html');
  return `${file.substring(0, index)}.json`;
}

export function ChangeExtension(file: string, pre: string, post: string)  {
  var index = file.lastIndexOf(`.${pre}`);
  return `${file.substring(0, index)}.${post}`;
}

export function GetFileMimeType(extension: string): string {
  switch (extension) {
    case "png": return "image/png";
    case "jpg": case "jpeg": return "image/jpeg";
    case "svg": return "image/svg+xml";
    case "json": return "application/json";
    case "xml": return "application/xml";
    case "ico": return "image/ico";
    default: return "text/plain";
  }
}