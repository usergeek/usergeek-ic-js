import {KeyValueStore, parseValue, stringifyValue} from "./KeyValueStore";

export class InMemoryKeyValueStore implements KeyValueStore {
    items: any

    constructor() {
        this.items = {}
    }

    isFake(): boolean {
        return true
    }

    set(key: string, data: any) {
        this.items[key] = stringifyValue(data)
    }

    get(key: string) {
        const storageValue = this.items[key];
        if (storageValue) {
            return parseValue(storageValue)
        }
        return undefined
    }

    remove(key: string) {
        delete this.items[key]
    }

    clearAll() {
        this.items = {}
    }

    isEmpty(): boolean {
        for (const key in this.items) {
            if (this.items.hasOwnProperty(key)) {
                return false
            }
        }
        return true
    }
}
