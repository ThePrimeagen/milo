import getStaticList from './static-header-list';

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
class DynamicTable implements HeaderTable {

    // TODO: I assume that this definitely has a type, just what are they.
    private byName: Map<string, number>;
    private byNameAndValue: Map<string, Map<string, number>>;
    private byIdx: Map<number, Name | NameValue>;

    private initializing: boolean;
    private maxSize: number;

    private insertCount: number;

    constructor(maxSize: number) {
        this.byName = new Map();
        this.byNameAndValue = new Map();
        this.byIdx = new Map();
        this.initializing = true
        this.maxSize = maxSize;
        this.insertCount = 0;

        const staticList = getStaticList();
        for (let i = 1; i < staticList.length; ++i) {
            const items = staticList[i];
            this.insert(items[0], items[1]);
        }

        this.initializing = false;
    }

    setSize(newSize: number):void {
        const oldSize = this.maxSize;
        this.maxSize = newSize;

        if (newSize - oldSize < 0) {
            // Trim the table.
        }
    }

    getNameAndValue(idx: number): NameValue {
        const out = this.byIdx.get(idx);

        if (!out) {
            throw new Error("Decode Error, missing index in dynamic table");
        }

        if (typeof out === 'string') {
            throw new Error("Decode Error, name-value pair expected but name was found.");
        }

        return out;
    }

    getName(idx: number): string {
        const out = this.byIdx.get(idx);

        if (!out) {
            throw new Error("Decode Error, missing index in dynamic table");
        }

        if (typeof out !== 'string') {
            throw new Error("Decode Error, name-value pair when name was requested.");
        }

        return out;
    }

    insert(key: string, value: string | null): number {

        const id = this.insertCount++ + 1;

        // Name only insert
        if (value === null) {
            this.byName.set(key, id);
            return id;
        }

        // TODO: It already exists, should our library ever run into this
        // case?
        let valueMap = this.byNameAndValue.get(key);
        if (!valueMap) {
            valueMap = new Map();
            this.byNameAndValue.set(key, valueMap);
        }

        valueMap.set(value, id);

        return id;
    }
}
