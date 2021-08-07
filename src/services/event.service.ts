import { EventEmitter } from "events";
import { injectable } from "inversify";

export interface IEventService {
  subscribe<T>(event: string, callback: (data: T) => void): void;
  publish<T>(event: string, data?: T): void;
  removeAllListeners: (event: string) => void;
}

@injectable()
export class EventService implements IEventService {

  private eventEmmitter: EventEmitter;

  constructor() {
    this.eventEmmitter = new EventEmitter();
  }

  subscribe = <T>(event: string, callback: (data: T) => void) => {
    this.eventEmmitter.on(event, callback);
  }

  publish = <T>(event: string, data?: T): void => {
    this.eventEmmitter.emit(event, data || {});
  }

  removeAllListeners = (event: string): void => {
    this.eventEmmitter.removeAllListeners(event);
  }

}