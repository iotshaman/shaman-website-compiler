import { GetFileExtension } from "../functions/file.functions";
import { FileModel } from "./file-model";

export class FileData {

  name: string;
  path: string;
  routePath: string;
  text: string;
  content: string;
  extension: string;
  model: FileModel;
  query: any;
  available: boolean;

  constructor(name: string, path: string) {
    this.name = name;
    this.routePath = name;
    this.path = path;
    this.text = '';
    this.content = '';
    this.extension = GetFileExtension(path);
    this.model = {};
    this.query = {};
    this.available = false;
  }

  get route(): boolean {
    if (!this.available) return false;
    if (this.extension == "partial.html") return false;
    if (this.model && this.model.shaman && this.model.shaman.dynamic) return false;
    return true;
  }

}