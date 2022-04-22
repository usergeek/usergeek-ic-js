import {AnalyticsReceiverApiView, AnalyticsStoreApi, AnalyticsStoreTrackPacketParameters, AnalyticsStoreTrackPacketResponse} from "../AnalyticsStoreApi";
import {ANALYTICS_STORE_RETRIES, ApiParameters} from "../APIService";
import {createErrResult, isOk, UGResult, warn} from "../utils";
import {Packet} from "../canisters/analyticsStore.did";

export type UploadEventPacketResult = UGResult<null, null>

export interface Uploader {
    uploadEventPacket(packet: Packet): Promise<UploadEventPacketResult>
    destroy(): void
}

export class UploaderImpl implements Uploader {
    private readonly analyticsReceiverApiView: AnalyticsReceiverApiView
    private readonly apiParameters: ApiParameters
    private analyticsStoreApi: AnalyticsStoreApi | undefined

    constructor(analyticsReceiverApiView: AnalyticsReceiverApiView, apiParameters: ApiParameters) {
        this.analyticsReceiverApiView = analyticsReceiverApiView;
        this.apiParameters = apiParameters;
    }

    public uploadEventPacket = async (packet: Packet): Promise<UploadEventPacketResult> => {
        try {
            const parameters: AnalyticsStoreTrackPacketParameters = {
                ...this.apiParameters,
                canisterPrincipal: this.analyticsReceiverApiView.canisterPrincipal,
                accessToken: this.analyticsReceiverApiView.accessToken,
                packet: packet
            };
            if (!this.analyticsStoreApi) {
                this.analyticsStoreApi = new AnalyticsStoreApi()
            }
            const trackEventRecursivelyResult: AnalyticsStoreTrackPacketResponse = await this.analyticsStoreApi.trackPacketRecursively(parameters, ANALYTICS_STORE_RETRIES)
            if (isOk(trackEventRecursivelyResult)) {
                return trackEventRecursivelyResult
            }
        } catch (e: any) {
            warn("Uploader.uploadEventPacket trackPacketRecursively", e)
        }
        return createErrResult(null)
    }

    public destroy = () => {
        this.analyticsStoreApi?.destroy()
        this.analyticsStoreApi = undefined
        warn("Uploader: destroyed")
    }
}