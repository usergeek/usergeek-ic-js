import { ProjectApiKey } from "./canister/coordinator/coordinator.did";
import { Principal } from "@dfinity/principal";
import { AccessToken } from "./canister/clientRegistry/clientRegistry.did";
import { UGError, UGResult } from "./utils";
export declare type AnalyticsStoreResponse = UGResult<string, UGError>;
export declare const getResult: (sdkVersion: number, apiKey: ProjectApiKey, clientPrincipal: Principal, canisterPrincipal: Principal, accessToken: AccessToken) => Promise<AnalyticsStoreResponse>;
