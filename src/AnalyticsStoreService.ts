import {Principal} from "@dfinity/principal";
import {createCanisterActor} from "./canisters/analyticsStore";
import {_SERVICE, AnalyticsReceiverApi, AnalyticsReceiverApiError, CollectResult, GetAnalyticsReceiverApiResult, IsCollectRequiredResult} from "./canisters/analyticsStore.did";
import {AccessToken} from "./canisters/clientRegistry.did";
import {createErrFatal, createErrRetry, createOkResult, getSharedFunctionData, isErr, isErrTemporarilyUnavailable, isOk, log, UGError, UGResult, warn} from "./utils";
import {AnonymousIdentity} from "@dfinity/agent";
import {SessionContext} from "./index";

type GetAnalyticsReceiverApiResponse = UGResult<Principal, UGError>
type IsCollectRequiredResponse = UGResult<{ isCollectRequired: boolean }, UGError>
type CollectResponse = UGResult<null, UGError>

export type AnalyticsStoreResponse = UGResult<string, UGError>

////////////////////////////////////////////////
// Public
////////////////////////////////////////////////

export const getResult = async (sdkVersion: number, sessionContext: SessionContext, canisterPrincipal: Principal, accessToken: AccessToken): Promise<AnalyticsStoreResponse> => {
    const getApiActor: _SERVICE = createCanisterActor(canisterPrincipal.toText(), new AnonymousIdentity(), sessionContext.host);
    const handleGetAnalyticsReceiverApiResponse: GetAnalyticsReceiverApiResponse = await handleGetAnalyticsReceiverApi(getApiActor, sessionContext.clientPrincipal, sdkVersion, accessToken)
    if (isOk(handleGetAnalyticsReceiverApiResponse)) {
        const apiPrincipal: Principal = handleGetAnalyticsReceiverApiResponse.ok;
        const actor: _SERVICE = createCanisterActor(apiPrincipal.toText(), new AnonymousIdentity(), sessionContext.host);
        const handleIsCollectRequiredResponse: IsCollectRequiredResponse = await isCollectRequired(actor, sessionContext.clientPrincipal, sdkVersion, accessToken)
        if (isOk(handleIsCollectRequiredResponse)) {
            if (handleIsCollectRequiredResponse.ok.isCollectRequired) {
                const handleCollectResponse: CollectResponse = await handleCollect(actor, sessionContext.clientPrincipal, sdkVersion, accessToken)
                if (isOk(handleCollectResponse)) {
                    return createOkResult("collected")
                } else if (isErr(handleCollectResponse)) {
                    return handleCollectResponse
                }
            } else {
                return createOkResult("alreadyCollected")
            }
        } else if (isErr(handleIsCollectRequiredResponse)) {
            return handleIsCollectRequiredResponse
        }
    } else if (isErr(handleGetAnalyticsReceiverApiResponse)) {
        return handleGetAnalyticsReceiverApiResponse
    }
    return createErrFatal()
}

////////////////////////////////////////////////
// Private
////////////////////////////////////////////////

const handleGetAnalyticsReceiverApi = async (actor: _SERVICE, clientPrincipal: Principal, sdkVersion: number, accessToken: AccessToken): Promise<GetAnalyticsReceiverApiResponse> => {
    let result: GetAnalyticsReceiverApiResult;
    try {
        result = await actor.getAnalyticsReceiverApi([clientPrincipal], sdkVersion, accessToken);
    } catch (e) {
        warn("actor.getAnalyticsReceiverApi", e);
        return createErrRetry()
    }
    log("actor.getAnalyticsReceiverApi", result);
    if (isOk<GetAnalyticsReceiverApiResult>(result)) {
        const apiPrincipal = getAnalyticsReceiverApiPrincipal(result.ok);
        return createOkResult(apiPrincipal)
    } else if (isErr<GetAnalyticsReceiverApiResult>(result)) {
        const error: AnalyticsReceiverApiError = result.err;
        if (isErrTemporarilyUnavailable(error)) {
            return createErrRetry()
        }
    }
    return createErrFatal()
}

const isCollectRequired = async (actor: _SERVICE, clientPrincipal: Principal, sdkVersion: number, accessToken: AccessToken): Promise<IsCollectRequiredResponse> => {
    let result: IsCollectRequiredResult;
    try {
        result = await actor.isCollectRequired([clientPrincipal], sdkVersion, accessToken);
    } catch (e) {
        warn("actor.isCollectRequired", e);
        return createErrRetry()
    }
    log("actor.isCollectRequired", result);
    if (isOk<IsCollectRequiredResult>(result)) {
        return createOkResult({isCollectRequired: result.ok})
    } else if (isErr<IsCollectRequiredResult>(result)) {
        const error: AnalyticsReceiverApiError = result.err;
        if (isErrTemporarilyUnavailable(error)) {
            return createErrRetry()
        }
    }
    return createErrFatal()
}

const handleCollect = async (actor: _SERVICE, clientPrincipal: Principal, sdkVersion: number, accessToken: AccessToken): Promise<CollectResponse> => {
    let result: CollectResult;
    try {
        result = await actor.collect([clientPrincipal], sdkVersion, accessToken);
    } catch (e) {
        warn("actor.collect", e);
        return createErrRetry()
    }
    log("actor.collect", result);
    if (isOk(result)) {
        return createOkResult(null)
    } else if (isErr(result)) {
        const error: AnalyticsReceiverApiError = result.err;
        if (isErrTemporarilyUnavailable(error)) {
            return createErrRetry()
        }
    }
    return createErrFatal()
}

const getAnalyticsReceiverApiPrincipal = (analyticsReceiverApi: AnalyticsReceiverApi): Principal => {
    const getAnalyticsReceiverApiData = getSharedFunctionData(analyticsReceiverApi.isCollectRequired)
    if (getAnalyticsReceiverApiData) {
        const [principal] = getAnalyticsReceiverApiData
        return principal
    }
    return undefined
}