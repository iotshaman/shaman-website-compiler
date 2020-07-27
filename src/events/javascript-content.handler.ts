import { minify as _minify } from 'uglify-es';
import { EventHandler } from "./event-handler";
import { FileData } from "../models";
import { ChangeExtension } from '../functions/file.functions';

export class JavascriptContentHandler extends EventHandler {

  minify = _minify;
  public event: string = 'file-contents-added';

  processEvent = (file: FileData): Promise<void> => {
    if (file.extension != "js") return Promise.resolve();
    return this.minfiyJavascript(file).then(_ => {
      this.logger.log(`Content has been updated for file '${file.name}'.`);
      return this.alertFileAvailable(file);
    })
  }

  private minfiyJavascript = (file: FileData) => {    
    if (!this.config.production) return this.updateFileContents(file, file.text);
    return new Promise((res, err) => {
      let map = {}; 
      map[file.name] = file.text;
      var rslt = this.minify(map, this.getMinifyOptions(file.name));
      if (rslt.error) { return err(new Error(rslt.error.message)); }
      return this.updateFileContents(file, rslt.code).then(res);
    });
  }

  private getMinifyOptions = (name: string) => {
    return {
      compress: { passes: 2 },
      nameCache: {},
      output: {
        beautify: false
      }
    }
  }

  private updateFileContents = (file: FileData, content: string) => {
    this.context.models.files.update(file.name, file => {
      file.content = content;
      if (this.config.production) file.routePath = ChangeExtension(file.name, 'js', 'min.js');
      return file;
    });
    return this.context.saveChanges();
  }
}