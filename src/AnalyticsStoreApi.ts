import {Principal} from "@dfinity/principal";
import {createCanisterActor} from "./canisters/analyticsStore";
import {_SERVICE, AnalyticsReceiverApi, AnalyticsReceiverApiError, CollectPacketResult, CollectPacketResultError, GetAnalyticsReceiverApiResult, Packet, PacketRejectedItem, ValidatePacketResult} from "./canisters/analyticsStore.did";
import {AccessToken} from "./canisters/clientRegistry.did";
import {createErrFatal, createErrRetry, createOkResult, delayPromise, getSharedFunctionData, hasOwnProperty, isErr, isErrApi, isErrTemporarilyUnavailable, isOk, log, UGError, UGResult, warn} from "./utils";
import {AnonymousIdentity} from "@dfinity/agent";
import {ANALYTICS_STORE_RETRIES, ApiParameters, getTimeout} from "./APIService";

export type AnalyticsReceiverApiView = {
    canisterPrincipal: Principal
    accessToken: AccessToken
}
type GetAnalyticsReceiverApiResponse = UGResult<AnalyticsReceiverApiView, UGError>

type ValidatePacketResponse = UGResult<Array<PacketRejectedItem>, UGError>
type CollectPacketResponse = UGResult<null, UGError>

export type AnalyticsStoreTrackPacketResponse = UGResult<null, UGError>

export interface AnalyticsStoreGetApiParameters extends ApiParameters {
    canisterPrincipal: Principal
    accessToken: AccessToken
}

export interface AnalyticsStoreTrackPacketParameters extends ApiParameters {
    canisterPrincipal: Principal
    accessToken: AccessToken
    packet: Packet
}

export class AnalyticsStoreApi {

    private destroyed: boolean = false

    public async getAnalyticsReceiverApiRecursively(parameters: AnalyticsStoreGetApiParameters, retriesLeft: number): Promise<GetAnalyticsReceiverApiResponse> {
        const getAnalyticsReceiverApiResult = await this.getAnalyticsReceiverApi(parameters);
        log("AnalyticsStoreApi.getAnalyticsReceiverApiRecursively.getAnalyticsReceiverApi", getAnalyticsReceiverApiResult, {retriesLeft});
        if (isOk(getAnalyticsReceiverApiResult)) {
            return getAnalyticsReceiverApiResult
        } else if (isErr(getAnalyticsReceiverApiResult)) {
            switch (getAnalyticsReceiverApiResult.err) {
                case "retry": {
                    if (retriesLeft > 0) {
                        if (!this.destroyed) {
                            const timeout = getTimeout(ANALYTICS_STORE_RETRIES - retriesLeft)
                            log("sleep for", timeout, "ms");
                            await delayPromise(timeout)
                            return this.getAnalyticsReceiverApiRecursively(parameters, retriesLeft - 1)
                        } else {
                            warn("AnalyticsStoreApi: getAnalyticsReceiverApiRecursively skipped - destroyed")
                        }
                    }
                    break;
                }
                default: {
                    break
                }
            }
        }
        return createErrFatal()
    }

    public async trackPacketRecursively(parameters: AnalyticsStoreTrackPacketParameters, retriesLeft: number): Promise<AnalyticsStoreTrackPacketResponse> {
        const sendPacketResponse: AnalyticsStoreTrackPacketResponse = await this.sendPacket(parameters)
        if (isOk(sendPacketResponse)) {
            return sendPacketResponse
        } else if (isErr(sendPacketResponse)) {
            switch (sendPacketResponse.err) {
                case "retry": {
                    if (retriesLeft > 0) {
                        if (!this.destroyed) {
                            const timeout = getTimeout(ANALYTICS_STORE_RETRIES - retriesLeft)
                            log("sleep for", timeout, "ms");
                            await delayPromise(timeout)
                            return this.trackPacketRecursively(parameters, retriesLeft - 1)
                        } else {
                            warn("AnalyticsStoreApi: trackPacketRecursively skipped - destroyed")
                        }
                    }
                    break;
                }
                default: {
                    break
                }
            }
        }
        return createErrFatal()
    }

    public destroy = () => {
        this.destroyed = true
        warn("AnalyticsStoreApi: destroyed")
    }

    private async getAnalyticsReceiverApi(parameters: AnalyticsStoreGetApiParameters): Promise<GetAnalyticsReceiverApiResponse> {
        const getApiActor: _SERVICE = createCanisterActor(parameters.canisterPrincipal.toText(), new AnonymousIdentity(), parameters.host);
        const handleGetAnalyticsReceiverApiResponse: GetAnalyticsReceiverApiResponse = await this.actor_getAnalyticsReceiverApi(getApiActor, parameters)
        log("AnalyticsStoreApi.getAnalyticsReceiverApi", handleGetAnalyticsReceiverApiResponse);
        if (isOk(handleGetAnalyticsReceiverApiResponse)) {
            return createOkResult(handleGetAnalyticsReceiverApiResponse.ok)
        } else if (isErr(handleGetAnalyticsReceiverApiResponse)) {
            return handleGetAnalyticsReceiverApiResponse
        }
        return createErrFatal()
    }

    private sendPacket = async (parameters: AnalyticsStoreTrackPacketParameters): Promise<AnalyticsStoreTrackPacketResponse> => {
        const actor: _SERVICE = createCanisterActor(parameters.canisterPrincipal.toText(), new AnonymousIdentity(), parameters.host);
        const validatePacketResponse: ValidatePacketResponse = await this.validatePacket(actor, parameters)
        log("AnalyticsStoreApi.sendPacket validatePacket", validatePacketResponse);
        if (isOk(validatePacketResponse)) {
            //check for errors
            const validate_rejectedItems = validatePacketResponse.ok;
            if (validate_rejectedItems.length > 0) {
                //remove bad items from packet based on validation result
                parameters.packet.items = parameters.packet.items.filter((item) => {
                    const isBadItem = validate_rejectedItems.some((rejectedItem) => {
                        if (hasOwnProperty(item, "event")) {
                            return rejectedItem.sequence == item.event.sequence
                        } else if (hasOwnProperty(item, "session")) {
                            return rejectedItem.sequence == item.session.sequence
                        }
                        //by default
                        return false
                    })
                    return !isBadItem
                })
            }
            if (parameters.packet.items.length > 0) {
                const collectPacketResponse: CollectPacketResponse = await this.collectPacket(actor, parameters)
                log("AnalyticsStoreApi.sendPacket collectPacket", collectPacketResponse);
                if (isOk(collectPacketResponse)) {
                    return createOkResult(null)
                } else if (isErr(collectPacketResponse)) {
                    return collectPacketResponse
                }
            } else {
                //all event are bad
                return createOkResult(null)
            }
        } else if (isErr(validatePacketResponse)) {
            return validatePacketResponse
        }
        return createErrFatal()
    }

    private actor_getAnalyticsReceiverApi = async (actor: _SERVICE, parameters: AnalyticsStoreGetApiParameters): Promise<GetAnalyticsReceiverApiResponse> => {
        let result: GetAnalyticsReceiverApiResult;
        try {
            result = await actor.getAnalyticsReceiverApi([parameters.clientPrincipal], parameters.sdkVersion, parameters.accessToken);
        } catch (e) {
            warn("AnalyticsStoreApi.getAnalyticsReceiverApi actor.getAnalyticsReceiverApi", e);
            return createErrRetry()
        }
        log("AnalyticsStoreApi.getAnalyticsReceiverApi actor.getAnalyticsReceiverApi", result);
        if (isOk<GetAnalyticsReceiverApiResult>(result)) {
            const apiPrincipal = AnalyticsStoreApi.getAnalyticsReceiverApiPrincipal(result.ok);
            return createOkResult({
                canisterPrincipal: apiPrincipal,
                accessToken: parameters.accessToken
            })
        } else if (isErr<GetAnalyticsReceiverApiResult>(result)) {
            const error: AnalyticsReceiverApiError = result.err;
            if (isErrTemporarilyUnavailable(error)) {
                return createErrRetry()
            }
        }
        return createErrFatal()
    }

    private validatePacket = async (actor: _SERVICE, parameters: AnalyticsStoreTrackPacketParameters): Promise<ValidatePacketResponse> => {
        let result: ValidatePacketResult;
        try {
            result = await actor.validatePacket([parameters.clientPrincipal], parameters.sdkVersion, parameters.accessToken, parameters.packet);
        } catch (e) {
            warn("AnalyticsStoreApi.validatePacket actor.validatePacket", e);
            return createErrRetry()
        }
        log("AnalyticsStoreApi.validatePacket actor.validatePacket", result);
        if (isOk(result)) {
            let rejectedItems: Array<PacketRejectedItem> = []
            if (result.ok.rejectedItems.length == 1) {
                rejectedItems = result.ok.rejectedItems[0]
            }
            return createOkResult(rejectedItems)
        } else if (isErr(result)) {
            const error = result.err;
            if (isErrApi(error)) {
                const apiError = error.api;
                if (isErrTemporarilyUnavailable(apiError)) {
                    return createErrRetry()
                }
            }
        }
        return createErrFatal()
    }

    private collectPacket = async (actor: _SERVICE, parameters: AnalyticsStoreTrackPacketParameters): Promise<CollectPacketResponse> => {
        let result: CollectPacketResult;
        try {
            result = await actor.collectPacket([parameters.clientPrincipal], parameters.sdkVersion, parameters.accessToken, parameters.packet);
        } catch (e) {
            warn("AnalyticsStoreApi.collectPacket actor.collectPacket", e);
            return createErrRetry()
        }
        log("AnalyticsStoreApi.collectPacket actor.collectPacket", result);
        if (isOk(result)) {
            return createOkResult(null)
        } else if (isErr(result)) {
            const error: CollectPacketResultError = result.err;
            if (isErrApi(error)) {
                const apiError = error.api;
                if (isErrTemporarilyUnavailable(apiError)) {
                    return createErrRetry()
                }
            }
        }
        return createErrFatal()
    }

    private static getAnalyticsReceiverApiPrincipal = (analyticsReceiverApi: AnalyticsReceiverApi): Principal => {
        const getAnalyticsReceiverApiData = getSharedFunctionData(analyticsReceiverApi.isCollectRequired)
        if (getAnalyticsReceiverApiData) {
            const [principal] = getAnalyticsReceiverApiData
            return principal
        }
        return undefined
    }
}

