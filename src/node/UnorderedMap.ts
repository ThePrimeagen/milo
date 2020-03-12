import { IUnorderedMap } from '../types';

export default class UnorderedMap implements IUnorderedMap {
    private map: Map<any, any>;
    constructor(map?: Map<any, any>) {
        if (map) {
            this.map = new Map(map);
        } else {
            this.map = new Map;
        }
    }
    clear(): void {
        this.map.clear();
    }
    clone(): IUnorderedMap {
        return new UnorderedMap(this.map);
    }
    delete(key: any): boolean {
        if (this.map.has(key)) {
            this.map.delete(key);
            return true;
        }
        return false;
    }
    entries(): [any, any][] {
        return Array.from(this.map.entries());
    }
    forEach(func: (key: any, value: any, that: IUnorderedMap) => boolean): void {
        for (let [key, value] of this.map) {
            let ret = func(key, value, this as IUnorderedMap);
            if (typeof ret == "boolean" && !ret) {
                break;
            }
        }
    }
    get(key: any): any {
        return this.map.get(key);
    }
    has(key: any): boolean {
        return this.map.has(key);
    }
    keys(): any[] {
        return Array.from(this.map.keys());
    }
    get length() {
        return this.map.size;
    }
    get size() {
        return this.map.size;
    }
    set(key: any, value: any): IUnorderedMap {
        this.map.set(key, value);
        return this;
    }
    take(key: any): any {
        let ret = this.map.get(key);
        this.map.delete(key);
        return ret;
    }
    values(): any[] {
        return Array.from(this.map.values());
    }

}
