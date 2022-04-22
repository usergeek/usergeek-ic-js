import { KeyValueStore } from "./KeyValueStore";
export declare class LocalStorageKeyValueStore implements KeyValueStore {
    namespace: string;
    store: Storage;
    constructor(namespace?: string);
    isFake(): boolean;
    set(key: string, data: any): void;
    get(key: string): any | undefined;
    remove(key: string): void;
    clearAll(): void;
    isEmpty(): boolean;
}
