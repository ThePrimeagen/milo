import { IDataBuffer } from './types';
import DataBuffer from './DataBuffer';

export type PoolItem<T> = { free: () => void, item: T };
export type PoolFreeFunction<T> = (item: PoolItem<T>) => void;
export type PoolFactory<T> = (freeFn: PoolFreeFunction<T>) => PoolItem<T>;

export class Pool<T> {
    private factory: PoolFactory<T>;
    private pool: PoolItem<T>[];
    private boundFree: PoolFreeFunction<T>;

    constructor(factory: PoolFactory<T>) {
        this.factory = factory;
        this.pool = [];
        this.boundFree = this.free.bind(this);
    }

    get(): PoolItem<T> {
        if (this.pool.length === 0) {
            this.pool.push(this.factory(this.boundFree));
        }

        return this.pool.pop() as PoolItem<T>;
    }

    private free(item: PoolItem<T>) {
        this.pool.push(item);
    }
};

export function createDataBufferPool(size: number) {
    function factory(freeFn: PoolFreeFunction<IDataBuffer>): PoolItem<IDataBuffer> {
        const buf = new DataBuffer(size);
        const poolItem = {
            item: buf,
            free: () => {
                freeFn(poolItem);
            }
        };

        return poolItem;
    }
    return new Pool<IDataBuffer>(factory);
}
