import * as CleanCss from 'clean-css';
import { EventHandler } from "./event-handler";
import { FileData } from "../models";
import { ChangeExtension } from '../functions/file.functions';

export class CssContentHandler extends EventHandler {

  minify: any;
  public event: string = 'file-contents-added';

  constructor() {
    super();
    this.minify = new CleanCss({});
  }

  processEvent = (file: FileData): Promise<void> => {
    if (file.extension != "css") return Promise.resolve();
    return this.minifyCss(file).then(_ => {
      this.logger.log(`Content has been updated for file '${file.name}'.`);
      return this.alertFileAvailable(file);
    });
  }

  private minifyCss = (file: FileData) => {
    if (!this.config.production) return this.updateFileContents(file, file.text);
    return new Promise((res) => {
      let rslt = this.minify.minify(file.text);
      this.updateFileContents(file, rslt.styles).then(res);
    });
  }

  private updateFileContents = (file: FileData, content: string) => {
    this.context.models.files.update(file.name, file => {
      file.content = content;
      if (this.config.production) file.routePath = ChangeExtension(file.name, 'css', 'min.css');
      return file;
    });
    return this.context.saveChanges();
  }
}