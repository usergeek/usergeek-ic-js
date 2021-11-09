import { Principal } from "@dfinity/principal";
import { AccessToken } from "./canisters/clientRegistry.did";
import { UGError, UGResult } from "./utils";
import { SessionContext } from "./index";
export declare type AnalyticsStoreResponse = UGResult<string, UGError>;
export declare const getResult: (sdkVersion: number, sessionContext: SessionContext, canisterPrincipal: Principal, accessToken: AccessToken) => Promise<AnalyticsStoreResponse>;
