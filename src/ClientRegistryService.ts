import {Principal} from '@dfinity/principal';
import {AnonymousIdentity} from "@dfinity/agent";
import {createCanisterActor} from './canister/clientRegistry/clientRegistry';
import {_SERVICE, AccessToken, AnalyticsReceiver, GetAnalyticsReceiverError, GetAnalyticsReceiverResult, RegisterClientError, RegisterClientResult} from './canister/clientRegistry/clientRegistry.did';
import {ProjectApiKey} from "./canister/coordinator/coordinator.did";
import {createErrFatal, createErrRestart, createErrResult, createErrRetry, createOkResult, createProceedResult, getSharedFunctionDataPrincipal, hasOwnProperty, isErr, isErrTemporarilyUnavailable, isErrWrongTopology, isOk, isProceed, log, UGError, UGResult, UGResultExtended, warn} from "./utils";

type GetAnalyticsReceiverResponse = UGResult<AnalyticsReceiverView, "clientNotRegistered" | UGError>
// type GetAnalyticsReceiverResponse = { "ok": AnalyticsReceiverView } | { "err": "clientNotRegistered" | "retry" | "stop" | "restart" }
type RegisterClientResponse = UGResultExtended<null, UGError, AnalyticsReceiverView>
// type RegisterClientResponse = { "ok": null } | { "proceed": AnalyticsReceiverView } | { "err": "retry" | "stop" | "restart" }
export type AnalyticsReceiverView = {
    "canisterPrincipal": Principal
    "accessToken": AccessToken
}
export type ClientRegistryResponse = UGResultExtended<string, UGError, AnalyticsReceiverView>
// export type ClientRegistryResponse = { "proceed": AnalyticsReceiverView } | { "err": "retry" | "stop" | "restart" } | { "ok": string }

////////////////////////////////////////////////
// Public
////////////////////////////////////////////////

export const getResult = async (sdkVersion: number, apiKey: ProjectApiKey, clientPrincipal: Principal, clientRegistryPrincipal: Principal): Promise<ClientRegistryResponse> => {
    const actor: _SERVICE = createCanisterActor(clientRegistryPrincipal.toText(), new AnonymousIdentity());
    const handleGetAnalyticsReceiverResponse = await handleGetAnalyticsReceiver(actor, clientPrincipal, sdkVersion, apiKey)
    log("handle.getAnalyticsReceiver", handleGetAnalyticsReceiverResponse);
    if (isOk(handleGetAnalyticsReceiverResponse)) {
        const analyticsReceiverView: AnalyticsReceiverView = handleGetAnalyticsReceiverResponse.ok
        if (analyticsReceiverView) {
            return createProceedResult(analyticsReceiverView)
        }
    } else if (isErr(handleGetAnalyticsReceiverResponse)) {
        switch (handleGetAnalyticsReceiverResponse.err) {
            case "clientNotRegistered":
                const handleRegisterClientResult: RegisterClientResponse = await handleRegisterClient(actor, clientPrincipal, sdkVersion, apiKey)
                log("handle.registerClient", handleRegisterClientResult);
                if (isOk(handleRegisterClientResult)) {
                    return createOkResult("registered")
                } else if (isProceed(handleRegisterClientResult)) {
                    return handleRegisterClientResult
                } else if (isErr(handleRegisterClientResult)) {
                    return handleRegisterClientResult
                }
                break;
            case "retry": {
                return createErrRetry()
            }
            case "restart": {
                return createErrRestart()
            }
            default: {
                //all other error should stop
                break
            }
        }
    }
    return createErrFatal()
}

////////////////////////////////////////////////
// Private
////////////////////////////////////////////////

const handleGetAnalyticsReceiver = async (actor: _SERVICE, clientPrincipal: Principal, sdkVersion: number, apiKey: ProjectApiKey): Promise<GetAnalyticsReceiverResponse> => {
    let result: GetAnalyticsReceiverResult;
    try {
        result = await actor.getAnalyticsReceiver([clientPrincipal], sdkVersion, apiKey);
    } catch (e) {
        warn("actor.getAnalyticsReceiver", e);
        return createErrRetry()
    }
    log("actor.getAnalyticsReceiver", result);
    if (isOk<GetAnalyticsReceiverResult>(result)) {
        const analyticsReceiverView: AnalyticsReceiverView = getAnalyticsReceiverData(result.ok)
        if (analyticsReceiverView) {
            return createOkResult(analyticsReceiverView)
        }
    } else if (isErr<GetAnalyticsReceiverResult>(result)) {
        const error: GetAnalyticsReceiverError = result.err
        if (hasOwnProperty(error, "clientNotRegistered")) {
            return createErrResult("clientNotRegistered")
        }
        if (isErrTemporarilyUnavailable(error)) {
            return createErrRetry()
        }
        if (isErrWrongTopology(error)) {
            return createErrRestart()
        }
    }
    return createErrFatal()
}

const handleRegisterClient = async (actor: _SERVICE, clientPrincipal: Principal, sdkVersion: number, apiKey: ProjectApiKey): Promise<RegisterClientResponse> => {
    let result: RegisterClientResult;
    try {
        result = await actor.registerClient([clientPrincipal], sdkVersion, apiKey);
    } catch (e) {
        warn("actor.registerClient", e);
        return createErrRetry()
    }
    log("actor.registerClient", result);
    if (isOk<RegisterClientResult>(result)) {
        const {analyticsReceiver, analyticsStoreNotified} = result.ok;
        if (analyticsStoreNotified) {
            return createOkResult(null)
        }
        const analyticsReceiverView: AnalyticsReceiverView = getAnalyticsReceiverData(analyticsReceiver)
        if (analyticsReceiverView) {
            return createProceedResult(analyticsReceiverView)
        }
    } else if (isErr<RegisterClientResult>(result)) {
        const error: RegisterClientError = result.err
        if (isErrTemporarilyUnavailable(error)) {
            return createErrRetry()
        }
        if (isErrWrongTopology(error)) {
            return createErrRestart()
        }
    }
    return createErrFatal()
}

export const getAnalyticsReceiverData = (analyticsReceiver: AnalyticsReceiver): AnalyticsReceiverView => {
    const getAnalyticsReceiverApiPrincipal: Principal = getSharedFunctionDataPrincipal(analyticsReceiver.getAnalyticsReceiverApi)
    if (getAnalyticsReceiverApiPrincipal) {
        return {
            canisterPrincipal: getAnalyticsReceiverApiPrincipal,
            accessToken: analyticsReceiver.accessToken
        }
    }
    return undefined
}