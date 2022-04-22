import { KeyValueStore } from "./KeyValueStore";
export declare class InMemoryKeyValueStore implements KeyValueStore {
    items: any;
    constructor();
    isFake(): boolean;
    set(key: string, data: any): void;
    get(key: string): any;
    remove(key: string): void;
    clearAll(): void;
    isEmpty(): boolean;
}
