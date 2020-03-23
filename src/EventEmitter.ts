import UnorderedMap from "./#{target}/UnorderedMap";
import IUnorderedMap from "./IUnorderedMap";
import { EventListenerCallback } from "./types";

interface EventConnection {
    listener: EventListenerCallback;
    once: true;
};

type EventConnectionType = EventConnection | EventListenerCallback;

export default class EventEmitter {
    constructor() {
        this.listenerMap = new UnorderedMap();
    }

    addListener(event: string, listener: EventListenerCallback): this {
        return this.add(event, listener, false);
    }

    addOnceListener(event: string, listener: EventListenerCallback): this {
        return this.add(event, { listener, once: true }, false);
    }

    on(event: string, listener: EventListenerCallback): this {
        return this.add(event, listener, false);
    }

    once(event: string, listener: EventListenerCallback): this {
        return this.add(event, { listener, once: true }, false);
    }

    removeListener(event: string, listener: EventListenerCallback): this {
        return this.off(event, listener);
    }

    off(event: string, listener: EventListenerCallback): this {
        const connections = this.listenerMap.get(event);
        if (!connections)
            return this;
        if (Array.isArray(connections)) {
            for (let idx = 0; idx < connections.length; ++idx) {
                const val = connections[idx];
                let match;
                if (typeof val === "object") {
                    match = val.listener === listener;
                } else {
                    match = val === listener;
                }
                if (match) {
                    if (connections.length === 1) {
                        this.listenerMap.delete(event);
                    } else {
                        connections.splice(idx, 1);
                    }
                    break;
                }
            }
        } else if (typeof connections === "function") {
            if (connections === listener)
                this.listenerMap.delete(event);
        } else if (connections.listener === listener) {
            this.listenerMap.delete(event);
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

    listeners(event: string): EventListenerCallback[] | undefined {
        const connections = this.listenerMap.get(event);
        if (!connections)
            return undefined;
        if (Array.isArray(connections)) {
            return connections.map(l => {
                if (typeof l === "function")
                    return l;
                return l.listener;
            });
        } else if (typeof connections === "function") {
            return [connections];
        } else {
            return [connections.listener];
        }
    }
    emit(event: string, ...args: any[]): boolean {
        const connections = this.listenerMap.get(event);
        if (!connections) {
            return false;
        }

        if (Array.isArray(connections)) {
            let idx = 0;
            while (idx < connections.length) {
                let conn = connections[idx];
                if (typeof conn === "function") {
                    ++idx;
                } else { // once
                    connections.splice(idx, 1);
                    conn = conn.listener;
                }
                try {
                    conn.apply(this, args);
                } catch (err) {
                    this.unarray(event, connections);
                    throw err;
                }
            }
            this.unarray(event, connections);
        } else if (typeof connections === "function") {
            connections.apply(this, args);
        } else { // once
            this.listenerMap.delete(event);
            connections.listener.apply(this, args);
        }
        return true;
    }

    hasListener(event: string): boolean {
        return this.listenerMap.has(event);
    }

    listenerCount(event: string): number {
        const connections = this.listenerMap.get(event);
        if (!connections) {
            return 0;
        }
        if (Array.isArray(connections)) {
            return connections.length;
        }
        return 1;
    }

    prependListener(event: string, listener: EventListenerCallback): this {
        return this.add(event, listener, true);
    }

    prependOnceListener(event: string, listener: EventListenerCallback): this {
        return this.add(event, { listener, once: true }, true);
    }

    eventNames(): string[] {
        return this.listenerMap.keys();
    }

    private add(event: string, conn: EventConnectionType, prepend: boolean): this {
        const connections = this.listenerMap.get(event);
        if (connections) {
            if (Array.isArray(connections)) {
                if (prepend) {
                    connections.unshift(conn);
                } else {
                    connections.push(conn);
                }
            } else {
                this.listenerMap.set(event, prepend ? [conn, connections] : [connections, conn]);
            }
        } else {
            this.listenerMap.set(event, conn);
        }
        return this;
    }
    private unarray(event: string, conns: EventConnectionType[]): void {
        switch (conns.length) {
        case 0:
            this.listenerMap.delete(event);
            break;
        case 2:
            this.listenerMap.set(event, conns[0]);
            break;
        default:
            break;
        }
    }

    private listenerMap: IUnorderedMap<string, EventConnectionType[] | EventConnectionType>;
}
