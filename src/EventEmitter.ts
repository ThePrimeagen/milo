import UnorderedMap from "./#{target}/UnorderedMap";
import IUnorderedMap from "./IUnorderedMap";
import IEventEmitter from "./IEventEmitter";
import { EventListenerCallback } from "./types";

interface EventConnection {
    listener: EventListenerCallback;
    once: boolean;
};

export default class EventEmitter implements IEventEmitter {
    constructor() {
        this.listenerMap = new UnorderedMap();
    }

    addListener(event: string, listener: EventListenerCallback): this {
        return this.on(event, listener);
    }

    on(event: string, listener: EventListenerCallback): this {
        this.eventArray(event).push({ listener, once: false });
        return this;
    }

    once(event: string, listener: EventListenerCallback): this {
        this.eventArray(event).push({ listener, once: true });
        return this;
    }

    removeListener(event: string, listener: EventListenerCallback): this {
        return this.off(event, listener);
    }

    off(event: string, listener: EventListenerCallback): this {
        const connections = this.listenerMap.get(event);
        if (connections) {
            for (let idx = 0; idx < connections.length; ++idx) {
                if (connections[idx].listener === listener) {
                    if (connections.length === 1) {
                        this.listenerMap.delete(event);
                    } else {
                        connections.splice(idx, 1);
                    }
                    break;
                }
            }
        }
        return this;
    }

    removeAllListeners(event?: string): this {
        if (event) {
            this.listenerMap.delete(event);
        } else {
            this.listenerMap.clear();
        }
        return this;
    }

    listeners(event: string): EventListenerCallback[] {
        const connections = this.listenerMap.get(event);
        if (connections) {
            return connections.map(l => l.listener);
        }
        return [];
    }
    emit(event: string, ...args: any[]): boolean {
        const connections = this.listenerMap.get(event);
        if (!connections) {
            return false;
        }

        let idx = 0;
        while (idx < connections.length) {
            const conn = connections[idx];
            if (conn.once) {
                if (connections.length === 1) {
                    this.listenerMap.delete(event);
                    ++idx; // to make it break out of the loop
                } else {
                    connections.splice(idx, 1);
                }
            } else {
                ++idx;
            }
            conn.listener.apply(this, args);
        }
        return true;
    }

    hasListener(event: string): boolean {
        return this.listenerMap.get(event) !== undefined;
    }

    listenerCount(event: string): number {
        const connections = this.listenerMap.get(event);
        if (!connections) {
            return 0;
        }
        return connections.length;
    }

    prependListener(event: string, listener: EventListenerCallback): this {
        this.eventArray(event).unshift({ listener, once: false });
        return this;
    }

    prependOnceListener(event: string, listener: EventListenerCallback): this {
        this.eventArray(event).unshift({ listener, once: true });
        return this;
    }

    eventNames(): string[] {
        return this.listenerMap.keys();
    }

    private eventArray(event: string) {
        let connections = this.listenerMap.get(event);
        if (!connections) {
            connections = [];
            this.listenerMap.set(event, connections);
        }

        return connections;
    }
    private listenerMap: IUnorderedMap<string, EventConnection[]>;
}
