import { Principal } from '@dfinity/principal';
import { AccessToken, AnalyticsReceiver } from './canisters/clientRegistry.did';
import { UGError, UGResultExtended } from "./utils";
import { SessionContext } from "./index";
export declare type AnalyticsReceiverView = {
    "canisterPrincipal": Principal;
    "accessToken": AccessToken;
};
export declare type ClientRegistryResponse = UGResultExtended<string, UGError, AnalyticsReceiverView>;
export declare const getResult: (sdkVersion: number, sessionContext: SessionContext, clientRegistryPrincipal: Principal) => Promise<ClientRegistryResponse>;
export declare const getAnalyticsReceiverData: (analyticsReceiver: AnalyticsReceiver) => AnalyticsReceiverView;
