import getStaticList from './static-header-list';
import Platform from "../../../#{target}/Platform";

export type Name = string;
export type NameValue = { name: string, value: string };

export type HeaderField = {
    name: string,
    value: string | null,

    // TODO: Read section 8
};

export interface HeaderTable {
    setSize(sizeInBytes: number): void;
    insert(key: string, value: string | null): void;

    // TODO: seems like a possible decode error
    getName(idx: number): string;
    getNameAndValue(idx: number): NameValue;
}

const STATIC_TABLE_SIZE = 62;
export default class DynamicTable implements HeaderTable {

    // TODO: I assume that this definitely has a type, just what are they.
    private byName: Map<string, number>;
    private byNameAndValue: Map<string, Map<string, number>>;
    private byIdx: Map<number, Name | NameValue>;

    private initializing: boolean;
    private maxSize: number;
    private currentSize: number;

    private insertCount: number;

    constructor(maxSize: number) {
        this.byName = new Map();
        this.byNameAndValue = new Map();
        this.byIdx = new Map();
        this.initializing = true
        this.maxSize = maxSize;
        this.insertCount = 0;
        this.currentSize = 0;

        const staticList = getStaticList();
        for (let i = 0; i < staticList.length; ++i) {
            const items = staticList[i];
            this.insert(items[0], items[1]);
        }

        this.initializing = false;
    }

    setSize(newSize: number): void {
        this.maxSize = newSize;
        this.resize(0);
    }

    getNameAndValue(idx: number): NameValue {
        const out = this.byIdx.get(idx);

        if (!out) {
            throw new Error(`Decode Error, missing index in dynamic table: idx ${idx}`);
        }

        if (typeof out === 'string') {
            throw new Error(`Decode Error, name when name-value pair was requested: ${idx}.`);
        }

        return out;
    }

    getName(idx: number): string {
        const out = this.byIdx.get(idx);

        if (!out) {
            throw new Error(`Decode Error, missing index in dynamic table: idx ${idx}`);
        }

        if (typeof out !== 'string') {
            throw new Error(`Decode Error, name-value pair when name was requested: ${idx}.`);
        }

        return out;
    }

    insert(key: string, value: string | null): number {

        const id = this.insertCount++ + 1;

        // Adjust the table size
        const size = Platform.stringLength(key, 'utf8') +
            (value && Platform.stringLength(value, 'utf8') || 0);
        this.resize(size);

        // no insert is made.
        // todo: should we log this?
        if (this.maxSize < size) {
            return -1;
        }

        // Name only insert
        if (value === null) {
            this.byName.set(key, id);
            this.byIdx.set(id, key);
        }
        else {

            // TODO: It already exists, should our library ever run into this
            // case?
            let valueMap = this.byNameAndValue.get(key);
            if (!valueMap) {
                valueMap = new Map();
                this.byNameAndValue.set(key, valueMap);
            }

            valueMap.set(value, id);
            this.byIdx.set(id, {name: key, value});
        }

        if (!this.initializing) {
            this.currentSize += size;
        }

        return id;
    }

    private resize(sizeAdded: number) {
        throw new Error("This needs to be implemented right meow");

        // this sucks, can we do better?
        const keys = new Array(this.byIdx.keys()).reverse();
        const max = keys.length - 1;

        for (let i = max; i >= 0 && this.currentSize > this.maxSize; ++i) {
        }
    }
}
