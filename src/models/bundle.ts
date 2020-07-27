export class Bundle {
  name: string;
  type: string;
  files: string[];
  extension?: string;
  content?: string;

  constructor(obj?: Bundle) {
    if (!obj) return;
    this.name = obj.name;
    this.type = obj.type;
    this.files = obj.files;
    this.extension = obj.extension;
    this.content = obj.content;
  }

  get path(): string {
    if (this.extension) return `${this.name}.${this.extension}`;
    return `${this.name}.${this.type}`;
  }
}