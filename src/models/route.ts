import { RemoveFileExtension } from '../functions/file.functions';
import { FileData } from './file-data';

export class Route {
  
  path: string;
  content: string;
  extension: string;
  mimeType: string;

  constructor(path: string, content: string, extension: string, extensionless: boolean = false) {
    this.path = path;
    this.content = content;
    this.extension = extension;
    this.mimeType = this.getmimeType(extension);
    if (extensionless) this.path = RemoveFileExtension(path, 'html');
  }

  private getmimeType(extension: string): string {
    switch(extension) {
      case "html": return 'text/html';
      case "js": case "min.js": return 'text/javascript';
      case "css": case "min.css": return "text/css";
      case "xml": return "application/xml";
    }
  }

}