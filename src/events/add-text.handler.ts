import { EventHandler } from "./event-handler";
import { FileData } from "../models";
import { IFileImportService } from "../services/file-import.service";
import { IoC, TYPES } from "../composition/app.composition";

export class AddTextHandler extends EventHandler {

  public event: string = 'file-added';
  private fileImportService: IFileImportService;

  constructor() {
    super();
    this.fileImportService = IoC.get<IFileImportService>(TYPES.FileImportService);
  }

  processEvent = (file: FileData): Promise<void> => {
    return this.updateFileText(file).then(_ => {
      this.logger.log(`Text has been updated for file '${file.name}'.`);
      this.eventService.publish('file-contents-added', file);
    });
  }

  private updateFileText = (file: FileData): Promise<void> => {
    return this.fileImportService.importFileText(file).then(rslt => {
      this.context.models.files.update(file.name, (file => {
        file.text = rslt.text;
        return file;
      }));
      return this.context.saveChanges();
    });
  }
}