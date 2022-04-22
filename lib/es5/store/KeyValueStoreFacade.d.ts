import { KeyValueStore } from "./KeyValueStore";
export declare const grabLocalStorage: () => Storage | undefined;
export declare const KeyValueStoreFacade: {
    createStore: (namespace?: string) => KeyValueStore;
};
