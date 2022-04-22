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

export const isErrWrongTopology = <T>(obj: T): obj is T & Record<"wrongTopology", unknown> => {
    return hasOwnProperty(obj, "wrongTopology")
}

export const getSharedFunctionData = (value: any): [Principal, string] | undefined => {
    try {
        if (Array.isArray(value)) {
            const newCoordinator = value as Array<any>
            if (newCoordinator.length === 2) {
                const principal: Principal = newCoordinator[0]//Principal.from(newCoordinator[0])
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
                const principal: Principal = newCoordinator[0]//Principal.from(newCoordinator[0])
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
}

export const warn = (...args) => {
    dumpToWindow("warn", args)
}

const usergeekLogName = "UsergeekLog";

function dumpToWindow(ctx: "log" | "warn", value) {
    window[usergeekLogName] = window[usergeekLogName] || {}
    window[usergeekLogName][ctx] = window[usergeekLogName][ctx] || []
    window[usergeekLogName][ctx].push(value)
}