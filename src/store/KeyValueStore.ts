export interface KeyValueStore {
    isFake(): boolean

    set(key: string, data: any): void

    get(key: string): any | undefined

    remove(key: string): void

    clearAll(): void

    isEmpty(): boolean
}

export const stringifyValue = function (obj?: any) {
    return JSON.stringify(obj)
}

export const parseValue = function (str?: any) {
    try {
        if (str) {
            return JSON.parse(str)
        }
    } catch (e) {
        // nop
    }
    return str
}