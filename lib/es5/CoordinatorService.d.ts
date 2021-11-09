import { Principal } from '@dfinity/principal';
import { UGError, UGResultExtended } from "./utils";
import { AnalyticsReceiverView } from "./ClientRegistryService";
import { SessionContext } from "./index";
export declare type CoordinatorResponseProceedClientRegistry = {
    "clientRegistry": {
        "canisterPrincipal": Principal;
    };
};
export declare type CoordinatorResponseProceedAnalyticsReceiver = {
    "analyticsReceiver": {
        "view": AnalyticsReceiverView;
    };
};
export declare const isProceedToClientRegistry: <T = CoordinatorResponseProceedClientRegistry | CoordinatorResponseProceedAnalyticsReceiver>(obj: T) => obj is T & Record<"clientRegistry", unknown>;
export declare const isProceedToAnalyticsReceiver: <T = CoordinatorResponseProceedClientRegistry | CoordinatorResponseProceedAnalyticsReceiver>(obj: T) => obj is T & Record<"analyticsReceiver", unknown>;
export declare type CoordinatorResponse = UGResultExtended<string, "changeTopology" | UGError, CoordinatorResponseProceedClientRegistry | CoordinatorResponseProceedAnalyticsReceiver>;
export declare const getResult: (sdkVersion: number, sessionContext: SessionContext) => Promise<CoordinatorResponse>;
export declare const getRandomCanisterId: (array: Array<string>) => string;
export declare const getCanisterId: (inProgressCanisterIds: Array<string>) => string | undefined;
export declare const markCanisterIdAsFailed: (failedCanisterId: string, inProgressCanisterIds: Array<string>) => Array<string>;
