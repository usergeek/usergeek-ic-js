import {KeyValueStore, parseValue, stringifyValue} from "./KeyValueStore";
import {grabLocalStorage} from "./KeyValueStoreFacade";

const each = function (store: Storage, namespace: string, callback: (key: string) => void) {
    for (let i = 0; i < store.length; i++) {
        const key = store.key(i)
        const prefix = namespace;
        if (key && key.indexOf(prefix) === 0) {
            const rawKey = key.substring(prefix.length)
            callback(rawKey)
        }
    }
}

const allKeys = function (store: Storage, namespace: string): string[] {
    const result: string[] = []
    each(store, namespace, key => result.push(key))
    return result
}

export class LocalStorageKeyValueStore implements KeyValueStore {
    namespace: string
    store: Storage

    constructor(namespace: string = "") {
        this.namespace = namespace;
        this.store = grabLocalStorage();
    }

    isFake(): boolean {
        return false
    }

    set(key: string, data: any): void {
        const k = this.namespace + key;
        const d = stringifyValue(data)
        this.store.setItem(k, d)
    }

    get(key: string): any | undefined {
        const k = this.namespace + key;
        const storageValue = this.store.getItem(k);
        if (storageValue) {
            return parseValue(storageValue)
        }
        return undefined
    }

    remove(key: string): void {
        const k = this.namespace + key;
        this.store.removeItem(k)
    }

    clearAll(): void {
        const keys = allKeys(this.store, this.namespace)
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.remove(key)
        }
    }

    isEmpty(): boolean {
        for (let i = 0; i < this.store.length; i++) {
            const key = this.store.key(i)
            if (key && key.indexOf(this.namespace) === 0) {
                return false
            }
        }
        return true
    }
}
