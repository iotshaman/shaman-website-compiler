import { injectable } from "inversify";
import { IEventService } from "../services/event.service";
import { IoC, TYPES } from "../composition/app.composition";
import { WebsiteConfig, FileData } from "../models";
import { CompilerDataContext } from '../data/compiler.context';
import { ILogger, LogLevels } from "../logger";

export interface IEventHandler {
  event: string;
  listen: () => void;
  processEvent: (data?: any) => Promise<void>;
}

@injectable()
export abstract class EventHandler implements IEventHandler {
  
  public abstract event: string;
  public abstract processEvent(data: any): Promise<void>;
  protected eventService: IEventService;
  protected config: WebsiteConfig;
  protected logger: ILogger;
  protected context: CompilerDataContext;

  constructor() {
    this.eventService = IoC.get<IEventService>(TYPES.CompilerEvents);
    this.config = IoC.get<WebsiteConfig>(TYPES.WebsiteConfig);
    this.logger = IoC.get<ILogger>(TYPES.Logger);
    this.context = IoC.get<CompilerDataContext>(TYPES.CompilerDataContext);
  }

  listen = () => {
    this.eventService.subscribe(this.event, (data) => {
      this.processEvent(data).catch((ex: Error) => {
        this.logger.log(ex.message, LogLevels.error);
        process.exit(1);
      });
    });
  }

  protected alertFileAvailable = (file: FileData): Promise<void> => {
    this.context.models.files.update(file.name, (file => {
      file.available = true;
      return file;
    }));
    return this.context.saveChanges().then(_ => {
      this.logger.log(`File '${file.name}' is now available.`);
      this.eventService.publish('file-available');
    });
  }
} 