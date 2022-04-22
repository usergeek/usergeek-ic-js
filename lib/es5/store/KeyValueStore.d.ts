export interface KeyValueStore {
    isFake(): boolean;
    set(key: string, data: any): void;
    get(key: string): any | undefined;
    remove(key: string): void;
    clearAll(): void;
    isEmpty(): boolean;
}
export declare const stringifyValue: (obj?: any) => string;
export declare const parseValue: (str?: any) => any;
