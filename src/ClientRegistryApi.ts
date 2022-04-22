import {Principal} from '@dfinity/principal';
import {AnonymousIdentity} from "@dfinity/agent";
import {createCanisterActor} from './canisters/clientRegistry';
import {_SERVICE, AccessToken, AnalyticsReceiver, GetAnalyticsReceiverError, GetAnalyticsReceiverResult, RegisterClientError, RegisterClientResult} from './canisters/clientRegistry.did';
import {createErrFatal, createErrRestart, createErrResult, createErrRetry, createOkResult, delayPromise, getSharedFunctionDataPrincipal, hasOwnProperty, isErr, isErrTemporarilyUnavailable, isErrWrongTopology, isOk, isProceed, log, UGError, UGResult, warn} from "./utils";
import {ApiParameters, CLIENT_REGISTRY_RETRIES, getTimeout} from "./APIService";

type GetAnalyticsReceiverResponse = UGResult<AnalyticsReceiverView, "clientNotRegistered" | UGError>

type RegisterClientResponse = UGResult<{ analyticsStoreNotified: boolean, analyticsReceiverView: AnalyticsReceiverView }, UGError>

export type AnalyticsReceiverView = {
    canisterPrincipal: Principal
    accessToken: AccessToken
}

export type ClientRegistryResponse = UGResult<{ analyticsStoreNotified: boolean, analyticsReceiverView: AnalyticsReceiverView }, UGError>

export interface ClientRegistryParameters extends ApiParameters {
    clientRegistryPrincipal: Principal
}

export class ClientRegistryApi {

    private destroyed: boolean = false

    public async callClientRegistryRecursively(parameters: ClientRegistryParameters, retriesLeft: number): Promise<ClientRegistryResponse> {
        const clientRegistryResponse: ClientRegistryResponse = await this.getResult(parameters)
        log("ClientRegistryApi.callClientRegistryRecursively.clientRegistry", clientRegistryResponse, {retriesLeft});
        if (isProceed(clientRegistryResponse)) {
            return clientRegistryResponse
        } else if (isOk(clientRegistryResponse)) {
            return clientRegistryResponse
        } else if (isErr(clientRegistryResponse)) {
            switch (clientRegistryResponse.err) {
                case "retry": {
                    if (retriesLeft > 0) {
                        if (!this.destroyed) {
                            const timeout = getTimeout(CLIENT_REGISTRY_RETRIES - retriesLeft)
                            log("sleep for", timeout, "ms");
                            await delayPromise(timeout)
                            return this.callClientRegistryRecursively(parameters, retriesLeft - 1)
                        } else {
                            warn("ClientRegistryApi: callClientRegistryRecursively skipped - destroyed")
                        }
                    }
                    break;
                }
                case "restart": {
                    return createErrRestart()
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
        warn("CoordinatorApi: destroyed")
    }

    private getResult = async (parameters: ClientRegistryParameters): Promise<ClientRegistryResponse> => {
        const actor: _SERVICE = createCanisterActor(parameters.clientRegistryPrincipal.toText(), new AnonymousIdentity(), parameters.host);
        const handleGetAnalyticsReceiverResponse = await this.getAnalyticsReceiver(actor, parameters)
        log("ClientRegistryApi.getResult.getAnalyticsReceiver", handleGetAnalyticsReceiverResponse);
        if (!this.destroyed) {
            if (isOk(handleGetAnalyticsReceiverResponse)) {
                const analyticsReceiverView: AnalyticsReceiverView = handleGetAnalyticsReceiverResponse.ok
                if (analyticsReceiverView) {
                    return createOkResult({
                        analyticsStoreNotified: false,
                        analyticsReceiverView: analyticsReceiverView
                    })
                }
            } else if (isErr(handleGetAnalyticsReceiverResponse)) {
                switch (handleGetAnalyticsReceiverResponse.err) {
                    case "clientNotRegistered":
                        const handleRegisterClientResult: RegisterClientResponse = await this.registerClient(actor, parameters)
                        log("handle.registerClient", handleRegisterClientResult);
                        if (!this.destroyed) {
                            if (isOk(handleRegisterClientResult)) {
                                return handleRegisterClientResult
                            } else if (isProceed(handleRegisterClientResult)) {
                                return handleRegisterClientResult
                            } else if (isErr(handleRegisterClientResult)) {
                                return handleRegisterClientResult
                            }
                        } else {
                            warn("ClientRegistryApi: registerClient() result skipped - destroyed")
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
        } else {
            warn("ClientRegistryApi: getAnalyticsReceiver() result skipped - destroyed")
        }
        return createErrFatal()
    }

    private getAnalyticsReceiver = async (actor: _SERVICE, parameters: ClientRegistryParameters): Promise<GetAnalyticsReceiverResponse> => {
        let result: GetAnalyticsReceiverResult;
        try {
            result = await actor.getAnalyticsReceiver([parameters.clientPrincipal], parameters.sdkVersion, parameters.apiKey);
        } catch (e) {
            warn("ClientRegistryApi.getAnalyticsReceiver actor.getAnalyticsReceiver", e);
            return createErrRetry()
        }
        log("ClientRegistryApi.getAnalyticsReceiver actor.getAnalyticsReceiver", result);
        if (isOk<GetAnalyticsReceiverResult>(result)) {
            const analyticsReceiverView: AnalyticsReceiverView = ClientRegistryApi.getAnalyticsReceiverData(result.ok)
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

    private registerClient = async (actor: _SERVICE, parameters: ClientRegistryParameters): Promise<RegisterClientResponse> => {
        let result: RegisterClientResult;
        try {
            result = await actor.registerClient([parameters.clientPrincipal], parameters.sdkVersion, parameters.apiKey);
        } catch (e) {
            warn("ClientRegistryApi.registerClient actor.registerClient", e);
            return createErrRetry()
        }
        log("ClientRegistryApi.registerClient actor.registerClient", result);
        if (isOk<RegisterClientResult>(result)) {
            const {analyticsReceiver, analyticsStoreNotified} = result.ok;
            const analyticsReceiverView: AnalyticsReceiverView = ClientRegistryApi.getAnalyticsReceiverData(analyticsReceiver)
            if (analyticsReceiverView) {
                return createOkResult({
                    analyticsStoreNotified: analyticsStoreNotified,
                    analyticsReceiverView: analyticsReceiverView
                })
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

    public static getAnalyticsReceiverData = (analyticsReceiver: AnalyticsReceiver): AnalyticsReceiverView => {
        const getAnalyticsReceiverPrincipal: Principal = getSharedFunctionDataPrincipal(analyticsReceiver.getAnalyticsReceiverApi)
        if (getAnalyticsReceiverPrincipal) {
            return {
                canisterPrincipal: getAnalyticsReceiverPrincipal,
                accessToken: analyticsReceiver.accessToken
            }
        }
        return undefined
    }
}