import { Principal } from '@dfinity/principal';
import { UGError, UGResult } from "./utils";
import { AnalyticsReceiverApiView } from "./AnalyticsStoreApi";
export declare const timeoutBetweenRetriesSec = 2;
export declare const COORDINATOR_RETRIES: number;
export declare const CLIENT_REGISTRY_RETRIES: number;
export declare const ANALYTICS_STORE_RETRIES: number;
export interface ApiParameters {
    sdkVersion: number;
    apiKey: string;
    clientPrincipal: Principal;
    host?: string;
}
export declare type GetAnalyticsReceiverApiResult = {
    analyticsStoreNotified: boolean;
    analyticsReceiverApiView: AnalyticsReceiverApiView;
};
export declare class APIService {
    private coordinatorApi;
    private clientRegistryApi;
    private analyticsStoreApi;
    private destroyed;
    getAnalyticsReceiverApi(apiParameters: ApiParameters): Promise<UGResult<GetAnalyticsReceiverApiResult, UGError>>;
    destroy: () => void;
    private getAnalyticsReceiverApiRecursively;
}
export declare const getTimeout: (retryIndex: number) => number;
