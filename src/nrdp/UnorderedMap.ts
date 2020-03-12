import { IUnorderedMap } from "../types";

type UnorderedMapConstructor = {
    new <K, V>(): IUnorderedMap<K, V>;
}

declare const UnorderedMap: UnorderedMapConstructor;
export default UnorderedMap;
