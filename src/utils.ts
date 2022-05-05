import {Principal} from "@dfinity/principal";

const okResultKey = "ok"
const errResultKey = "err"
const proceedResultKey = "proceed"

export type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OkResult<T> = { [okResultKey]: T }
export type ErrResult<T> = { [errResultKey]: T }
export type ProceedResult<T> = { [proceedResultKey]: T }
export type UGResult<S, F> = OkResult<S> | ErrResult<F>
export type UGResultExtended<S, F, P> = OkResult<S> | ErrResult<F> | ProceedResult<P>

export type UGError = "retry" | "restart" | "fatal"

/**
 * We want to check if prop is a property key of obj
 * @param obj - object
 * @param prop - property
 */
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
    return obj && obj.hasOwnProperty(prop)
}

export const isOk = <T>(obj: T): obj is T & OkResult<unknown> => {
    return hasOwnProperty(obj, okResultKey)
}

export const isErr = <T>(obj: T): obj is T & ErrResult<unknown> => {
    return hasOwnProperty(obj, errResultKey)
}

export const isProceed = <T>(obj: T): obj is T & ProceedResult<unknown> => {
    return hasOwnProperty(obj, proceedResultKey)
}

export const createOkResult = <T>(value: T): OkResult<T> => {
    return {[okResultKey]: value}
}

export const createErrResult = <T>(value: T): ErrResult<T> => {
    return {[errResultKey]: value}
}

export const createProceedResult = <T>(value: T): ProceedResult<T> => {
    return {[proceedResultKey]: value}
}

export const createErrFatal = (): ErrResult<UGError> => {
    return createErrResult("fatal")
}

export const createErrRetry = (): ErrResult<UGError> => {
    return createErrResult("retry")
}

export const createErrRestart = (): ErrResult<UGError> => {
    return createErrResult("restart")
}

export const isErrTemporarilyUnavailable = <T>(obj: T): obj is T & Record<"temporarilyUnavailable", unknown> => {
    return hasOwnProperty(obj, "temporarilyUnavailable")
}

export const isErrApi = <T>(obj: T): obj is T & Record<"api", unknown> => {
    return hasOwnProperty(obj, "api")
}

export const isErrWrongTopology = <T>(obj: T): obj is T & Record<"wrongTopology", unknown> => {
    return hasOwnProperty(obj, "wrongTopology")
}

export const getSharedFunctionData = (value: any): [Principal, string] | undefined => {
    try {
        if (Array.isArray(value)) {
            const newCoordinator = value as Array<any>
            if (newCoordinator.length === 2) {
                const principal: Principal = newCoordinator[0]
                if (typeof principal["toText"] != "function") {
                    warn("util.getSharedFunctionData: bad principal object", principal);
                }
                const methodName: string = newCoordinator[1]
                return [principal, methodName]
            }
        }
    } catch (e) {
        warn("util.getSharedFunctionData", e);
    }
    return undefined
}

export const getSharedFunctionDataPrincipal = (value: any): Principal => {
    try {
        if (Array.isArray(value)) {
            const newCoordinator = value as Array<any>
            if (newCoordinator.length === 2) {
                const principal: Principal = newCoordinator[0]
                if (typeof principal["toText"] != "function") {
                    warn("util.getSharedFunctionDataPrincipal: bad principal object", principal);
                }
                return principal
            }
        }
    } catch (e) {
        warn("util.getSharedFunctionDataPrincipal", e);
    }
    return undefined
}

export const delayPromise = (duration) => {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export function log(...args) {
    dumpToWindow("log", args)
    // if (process.env.NODE_ENV === "development") {
    //     console.log.apply(null, ["DEV LOG", ...args])
    // }
}

export const warn = (...args) => {
    dumpToWindow("warn", args)
    // if (process.env.NODE_ENV === "development") {
    //     console.warn.apply(null, ["DEV WARN", ...args])
    // }
}

const usergeekLogName = "UsergeekLog";

let debugSequenceId: number = 0

function dumpToWindow(ctx: "log" | "warn", value) {
    window[usergeekLogName] = window[usergeekLogName] || {}
    window[usergeekLogName][ctx] = window[usergeekLogName][ctx] || []
    window[usergeekLogName][ctx].push([debugSequenceId++, new Date().getTime(), ...value])
    if (window[usergeekLogName][ctx].length >= 1000) {
        window[usergeekLogName][ctx].splice(0, 100)
    }
}

export class UsergeekUtils {

    static getCurrentTime(): number {
        return new Date().getTime()
    }

    static isString(value?: any): boolean {
        return typeof value === "string" || value instanceof String
    }

    static isStringEmpty(value?: any): boolean {
        if (!UsergeekUtils.isString(value)) {
            return true
        }
        const stringValue = value as string
        return stringValue.length === 0
    }

    static isNil(value?: any): boolean {
        return value == null
    }

    static isNumber(value?: any): boolean {
        return typeof value === 'number' ||
            (UsergeekUtils.isObjectLike(value) && UsergeekUtils.getTag(value) === '[object Number]')
    }

    static isMap(value?: any): boolean {
        return value instanceof Map
    }

    static isArray(value?: any): boolean {
        return value instanceof Array || Array.isArray(value)
    }

    static isObjectLike(value?: any): boolean {
        return typeof value === 'object' && value !== null
    }

    static getTag(value?: any): string {
        if (value == null) {
            return value === undefined ? '[object Undefined]' : '[object Null]'
        }
        return toString.call(value)
    }

    static parseJSONSafe(value?: string): any {
        try {
            return JSON.parse(value)
        } catch (e) {
        }
        return undefined
    }

    static getSize(value?: any): number {
        if (UsergeekUtils.isNil(value)) {
            return 0
        }
        if (UsergeekUtils.isMap(value)) {
            return value.size
        }
        if (UsergeekUtils.isObjectLike(value)) {
            return Object.keys(value).length
        }
        if (UsergeekUtils.isArray(value) || UsergeekUtils.isString(value)) {
            return value.length
        }
        return 0
    }

    static jsonStringifyWithBigInt(value: any) {
        return JSON.stringify(value, (key, value) =>
            typeof value === "bigint" ? value.toString() + "n" : value
        )
    }

    static jsonParseWithBigInt(value: string) {
        return JSON.parse(value, (key, value) => {
            if (typeof value === "string" && /^\d+n$/.test(value)) {
                return BigInt(value.substr(0, value.length - 1));
            }
            return value;
        })
    }
}
