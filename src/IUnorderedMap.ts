export default interface IUnorderedMap<Key, Value> {
    clear(): void;
    clone(): IUnorderedMap<Key, Value>;
    delete(key: Key): boolean;
    entries(): [Key, Value][];
    forEach(func: (key: Key, value: Value, that: IUnorderedMap<Key, Value>) => boolean | void): void;
    get(key: Key): Value | undefined;
    has(key: Key): boolean;
    keys(): Key[];
    readonly length: number;
    readonly size: number;
    set(key: Key, value: Value): IUnorderedMap<Key, Value>;
    take(key: Key): Value | undefined;
    values(): Value[];
}
