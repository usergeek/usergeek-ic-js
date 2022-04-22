import { Principal } from "@dfinity/principal";
import { Packet } from "./canisters/analyticsStore.did";
import { AccessToken } from "./canisters/clientRegistry.did";
import { UGError, UGResult } from "./utils";
import { ApiParameters } from "./APIService";
export declare type AnalyticsReceiverApiView = {
    canisterPrincipal: Principal;
    accessToken: AccessToken;
};
declare type GetAnalyticsReceiverApiResponse = UGResult<AnalyticsReceiverApiView, UGError>;
export declare type AnalyticsStoreTrackPacketResponse = UGResult<null, UGError>;
export interface AnalyticsStoreGetApiParameters extends ApiParameters {
    canisterPrincipal: Principal;
    accessToken: AccessToken;
}
export interface AnalyticsStoreTrackPacketParameters extends ApiParameters {
    canisterPrincipal: Principal;
    accessToken: AccessToken;
    packet: Packet;
}
export declare class AnalyticsStoreApi {
    private destroyed;
    getAnalyticsReceiverApiRecursively(parameters: AnalyticsStoreGetApiParameters, retriesLeft: number): Promise<GetAnalyticsReceiverApiResponse>;
    trackPacketRecursively(parameters: AnalyticsStoreTrackPacketParameters, retriesLeft: number): Promise<AnalyticsStoreTrackPacketResponse>;
    destroy: () => void;
    private getAnalyticsReceiverApi;
    private sendPacket;
    private actor_getAnalyticsReceiverApi;
    private validatePacket;
    private collectPacket;
    private static getAnalyticsReceiverApiPrincipal;
}
export {};
