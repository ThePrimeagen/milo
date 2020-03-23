import { EventListenerCallback } from "./types";

export default interface IEventEmitter {
    addListener(event: string, listener: EventListenerCallback): this;
    on(event: string, listener: EventListenerCallback): this;
    once(event: string, listener: EventListenerCallback): this;
    removeListener(event: string, listener: EventListenerCallback): this;
    off(event: string, listener: EventListenerCallback): this;
    removeAllListeners(event?: string): this;
    listeners(event: string): EventListenerCallback[] | undefined;
    emit(event: string, ...args: any[]): boolean;
    listenerCount(event: string): number;
    prependListener(event: string, listener: EventListenerCallback): this;
    prependOnceListener(event: string, listener: EventListenerCallback): this;
    eventNames(): string[];
}
