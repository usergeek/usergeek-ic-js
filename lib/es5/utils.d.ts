import { Principal } from "@dfinity/principal";
declare const okResultKey = "ok";
declare const errResultKey = "err";
declare const proceedResultKey = "proceed";
export declare type RequireField<T, K extends keyof T> = T & Required<Pick<T, K>>;
export declare type OkResult<T> = {
    [okResultKey]: T;
};
export declare type ErrResult<T> = {
    [errResultKey]: T;
};
export declare type ProceedResult<T> = {
    [proceedResultKey]: T;
};
export declare type UGResult<S, F> = OkResult<S> | ErrResult<F>;
export declare type UGResultExtended<S, F, P> = OkResult<S> | ErrResult<F> | ProceedResult<P>;
export declare type UGError = "retry" | "restart" | "fatal";
/**
 * We want to check if prop is a property key of obj
 * @param obj - object
 * @param prop - property
 */
export declare function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown>;
export declare const isOk: <T>(obj: T) => obj is T & OkResult<unknown>;
export declare const isErr: <T>(obj: T) => obj is T & ErrResult<unknown>;
export declare const isProceed: <T>(obj: T) => obj is T & ProceedResult<unknown>;
export declare const createOkResult: <T>(value: T) => OkResult<T>;
export declare const createErrResult: <T>(value: T) => ErrResult<T>;
export declare const createProceedResult: <T>(value: T) => ProceedResult<T>;
export declare const createErrFatal: () => ErrResult<UGError>;
export declare const createErrRetry: () => ErrResult<UGError>;
export declare const createErrRestart: () => ErrResult<UGError>;
export declare const isErrTemporarilyUnavailable: <T>(obj: T) => obj is T & Record<"temporarilyUnavailable", unknown>;
export declare const isErrWrongTopology: <T>(obj: T) => obj is T & Record<"wrongTopology", unknown>;
export declare const getSharedFunctionData: (value: any) => [Principal, string] | undefined;
export declare const getSharedFunctionDataPrincipal: (value: any) => Principal;
export declare const delayPromise: (duration: any) => Promise<unknown>;
export declare function log(...args: any[]): void;
export declare const warn: (...args: any[]) => void;
export {};
