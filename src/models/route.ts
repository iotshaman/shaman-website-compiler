import { FileData } from './file-data';

export class Route {
  
  path: string;
  content: string;
  extension: string;
  mimeType: string;

  constructor(path: string, content: string, extension: string) {
    this.path = path;
    this.content = content;
    this.extension = extension;
    this.mimeType = this.getmimeType(extension)
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