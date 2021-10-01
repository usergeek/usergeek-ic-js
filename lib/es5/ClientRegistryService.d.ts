import { Principal } from '@dfinity/principal';
import { AccessToken, AnalyticsReceiver } from './canister/clientRegistry/clientRegistry.did';
import { ProjectApiKey } from "./canister/coordinator/coordinator.did";
import { UGError, UGResultExtended } from "./utils";
export declare type AnalyticsReceiverView = {
    "canisterPrincipal": Principal;
    "accessToken": AccessToken;
};
export declare type ClientRegistryResponse = UGResultExtended<string, UGError, AnalyticsReceiverView>;
export declare const getResult: (sdkVersion: number, apiKey: ProjectApiKey, clientPrincipal: Principal, clientRegistryPrincipal: Principal) => Promise<ClientRegistryResponse>;
export declare const getAnalyticsReceiverData: (analyticsReceiver: AnalyticsReceiver) => AnalyticsReceiverView;
