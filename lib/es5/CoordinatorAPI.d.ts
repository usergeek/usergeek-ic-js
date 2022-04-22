import { Principal } from '@dfinity/principal';
import { UGError, UGResult } from "./utils";
import { AnalyticsReceiverView } from "./ClientRegistryApi";
import { ApiParameters } from "./APIService";
export declare type CoordinatorResponseClientRegistry = {
    "clientRegistry": {
        "canisterPrincipal": Principal;
    };
};
export declare type CoordinatorResponseAnalyticsReceiver = {
    "analyticsReceiver": {
        "view": AnalyticsReceiverView;
    };
};
export declare const isClientRegistry: <T = CoordinatorResponseClientRegistry | CoordinatorResponseAnalyticsReceiver>(obj: T) => obj is T & Record<"clientRegistry", unknown>;
export declare const isAnalyticsReceiver: <T = CoordinatorResponseClientRegistry | CoordinatorResponseAnalyticsReceiver>(obj: T) => obj is T & Record<"analyticsReceiver", unknown>;
export declare type CoordinatorResponse = UGResult<CoordinatorResponseClientRegistry | CoordinatorResponseAnalyticsReceiver, "changeTopology" | UGError>;
export declare class CoordinatorApi {
    private destroyed;
    callCoordinatorRecursively(apiParameters: ApiParameters, retriesLeft: number): Promise<CoordinatorResponse>;
    destroy: () => void;
    private getResult;
    private getClientRegistryRecursively;
    private hello;
    private static getRandomCanisterId;
    private static getCanisterId;
    private static markCanisterIdAsFailed;
}
