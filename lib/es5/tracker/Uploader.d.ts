import { AnalyticsReceiverApiView } from "../AnalyticsStoreApi";
import { ApiParameters } from "../APIService";
import { UGResult } from "../utils";
import { Packet } from "../canisters/analyticsStore.did";
export declare type UploadEventPacketResult = UGResult<null, null>;
export interface Uploader {
    uploadEventPacket(packet: Packet): Promise<UploadEventPacketResult>;
    destroy(): void;
}
export declare class UploaderImpl implements Uploader {
    private readonly analyticsReceiverApiView;
    private readonly apiParameters;
    private analyticsStoreApi;
    constructor(analyticsReceiverApiView: AnalyticsReceiverApiView, apiParameters: ApiParameters);
    uploadEventPacket: (packet: Packet) => Promise<UploadEventPacketResult>;
    destroy: () => void;
}
