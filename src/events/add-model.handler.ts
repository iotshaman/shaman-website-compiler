import * as _fsx from 'fs-extra';
import { EventHandler } from "./event-handler";
import { FileData } from "../models";
import { GetJsonExtensionFromHtml } from '../functions/file.functions';
import { LogLevels } from '../logger';

export class AddModelHandler extends EventHandler {

  public event: string = 'file-contents-added';

  processEvent = (file: FileData): Promise<void> => {
    if (file.extension != "html") return Promise.resolve();
    return this.updateFileModel(file).then(_ => {
      this.logger.log(`Model has been updated for file '${file.name}'.`);
      this.eventService.publish('file-model-added', file);
    });
  }

  private updateFileModel = (file: FileData): Promise<void> => {
    return this.getJsonData(file).then(rslt => {
      file.model = rslt;
      if (!file.model.shaman) file.model.shaman = {};
      if (!file.model.shaman.bundles) file.model.shaman.bundles = [];
      if (!file.model.shaman.query) file.model.shaman.query = [];
      this.context.models.files.update(file.name, (file => {
        file.model = rslt;
        return file;
      }));
      return this.context.saveChanges();
    })
  }

  private getJsonData = (file: FileData): Promise<any> => {
    return new Promise((res) => {
      let path = GetJsonExtensionFromHtml(file.path)
      return _fsx.readJSON(path)
        .then(res)
        .catch(_ => {
          this.logger.log(`WARNING: file '${file.name}' does not have a model.`, LogLevels.warn);
          res({})
        })
    })
  }
}