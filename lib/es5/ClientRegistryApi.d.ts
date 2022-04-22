import { Principal } from '@dfinity/principal';
import { AccessToken, AnalyticsReceiver } from './canisters/clientRegistry.did';
import { UGError, UGResult } from "./utils";
import { ApiParameters } from "./APIService";
export declare type AnalyticsReceiverView = {
    canisterPrincipal: Principal;
    accessToken: AccessToken;
};
export declare type ClientRegistryResponse = UGResult<{
    analyticsStoreNotified: boolean;
    analyticsReceiverView: AnalyticsReceiverView;
}, UGError>;
export interface ClientRegistryParameters extends ApiParameters {
    clientRegistryPrincipal: Principal;
}
export declare class ClientRegistryApi {
    private destroyed;
    callClientRegistryRecursively(parameters: ClientRegistryParameters, retriesLeft: number): Promise<ClientRegistryResponse>;
    destroy: () => void;
    private getResult;
    private getAnalyticsReceiver;
    private registerClient;
    static getAnalyticsReceiverData: (analyticsReceiver: AnalyticsReceiver) => AnalyticsReceiverView;
}
