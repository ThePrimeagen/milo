import { IUnorderedMap } from "../types";

export default class UnorderedMap<Key, Value> implements IUnorderedMap<Key, Value> {
    private map: Map<Key, Value>;
    constructor(map?: Map<Key, Value>) {
        if (map) {
            this.map = new Map(map);
        } else {
            this.map = new Map;
        }
    }
    clear(): void {
        this.map.clear();
    }
    clone(): IUnorderedMap<Key, Value> {
        return new UnorderedMap<Key, Value>(this.map);
    }
    delete(key: Key): boolean {
        if (this.map.has(key)) {
            this.map.delete(key);
            return true;
        }
        return false;
    }
    entries(): [Key, Value][] {
        return Array.from(this.map.entries());
    }
    forEach(func: (key: Key, value: Value, that: UnorderedMap<Key, Value>) => boolean): void {
        for (let [key, value] of this.map) {
            let ret = func(key, value, this);
            if (typeof ret == "boolean" && !ret) {
                break;
            }
        }
    }
    get(key: Key): Value | undefined {
        return this.map.get(key);
    }
    has(key: Key): boolean {
        return this.map.has(key);
    }
    keys(): Key[] {
        return Array.from(this.map.keys());
    }
    get length() {
        return this.map.size;
    }
    get size() {
        return this.map.size;
    }
    set(key: Key, value: Value): UnorderedMap<Key, Value> {
        this.map.set(key, value);
        return this;
    }
    take(key: Key): Value | undefined {
        let ret = this.map.get(key);
        this.map.delete(key);
        return ret;
    }
    values(): Value[] {
        return Array.from(this.map.values());
    }
}
