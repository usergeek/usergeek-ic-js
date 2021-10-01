import {Principal} from '@dfinity/principal';
import {CoordinatorResponse, getResult as getCoordinatorResult, isProceedToAnalyticsReceiver, isProceedToClientRegistry} from "./CoordinatorService";
import {ClientRegistryResponse, getResult as getClientRegistryResult} from "./ClientRegistryService";
import {ProjectApiKey} from "./canister/coordinator/coordinator.did";
import {createErrFatal, createErrRestart, delayPromise, hasOwnProperty, isErr, isOk, isProceed, log, warn} from "./utils";
import {AnalyticsStoreResponse, getResult as getAnalyticsStoreResult} from "./AnalyticsStoreService";
import {AccessToken} from "./canister/clientRegistry/clientRegistry.did";

export const timeoutBetweenRetriesSec = 2
const sdkVersion: number = 1
const GLOBAL_RETRIES: number = 20
const COORDINATOR_RETRIES: number = 20
const CLIENT_REGISTRY_RETRIES: number = 20
const ANALYTICS_STORE_RETRIES: number = 20

export class SessionFacade {
    private readonly apiKey: ProjectApiKey;
    private readonly clientPrincipal: Principal;

    constructor(apiKey: ProjectApiKey, principal: Principal) {
        this.apiKey = apiKey
        this.clientPrincipal = principal
    }

    public async trackSession() {
        try {
            const result = await this.recursiveCall(sdkVersion, GLOBAL_RETRIES);
            log("trackSession():", result);
        } catch (e) {
            warn("sessionFacade.trackSession", e);
        }
    }

    private async recursiveCall(sdkVersion: number, retriesLeft: number): Promise<any> {
        const coordinatorResponse = await this.recursiveCallCoordinator(sdkVersion, COORDINATOR_RETRIES);
        log("recursive.callCoordinator", coordinatorResponse);
        if (isOk(coordinatorResponse)) {
            //registered in coordinator
            return coordinatorResponse.ok
        } else if (isProceed(coordinatorResponse)) {
            const proceedResponse = coordinatorResponse.proceed;
            if (isProceedToClientRegistry(proceedResponse)) {
                //proceed to clientRegistry
                const {canisterPrincipal: clientRegistryPrincipal} = proceedResponse.clientRegistry;
                const clientRegistryResponse: ClientRegistryResponse = await this.recursiveCallClientRegistry(sdkVersion, clientRegistryPrincipal, CLIENT_REGISTRY_RETRIES)
                log("recursive.callClientRegistry", clientRegistryResponse);
                if (isProceed(clientRegistryResponse)) {
                    const analyticsReceiverView = clientRegistryResponse.proceed;
                    if (analyticsReceiverView) {
                        //proceed to analyticsReceiver
                        const {canisterPrincipal, accessToken} = analyticsReceiverView;
                        const analyticsStoreResponse = await this.recursiveCallAnalyticsStore(sdkVersion, canisterPrincipal, accessToken, ANALYTICS_STORE_RETRIES);
                        log("recursive.callAnalyticsStore", analyticsStoreResponse);
                        return analyticsStoreResponse
                    }
                    return clientRegistryResponse
                } else if (isOk(clientRegistryResponse)) {
                    return clientRegistryResponse
                } else if (isErr(clientRegistryResponse)) {
                    switch (clientRegistryResponse.err) {
                        case "restart": {
                            const timeout = getTimeout(GLOBAL_RETRIES - retriesLeft)
                            log("sleep for", timeout, "ms");
                            await delayPromise(timeout)
                            return await this.recursiveCall(sdkVersion, retriesLeft - 1)
                        }
                        default: {
                            return clientRegistryResponse
                        }
                    }
                }
            } else if (isProceedToAnalyticsReceiver(proceedResponse)) {
                const {view: analyticsReceiverView} = proceedResponse.analyticsReceiver
                if (analyticsReceiverView) {
                    const {canisterPrincipal, accessToken} = analyticsReceiverView;
                    const analyticsStoreResponse = await this.recursiveCallAnalyticsStore(sdkVersion, canisterPrincipal, accessToken, ANALYTICS_STORE_RETRIES);
                    log("recursive.callAnalyticsStore", analyticsStoreResponse);
                    return analyticsStoreResponse
                }
            }
        }
        return createErrFatal()
    }

    private async recursiveCallCoordinator(sdkVersion: number, retriesLeft: number): Promise<CoordinatorResponse> {
        const coordinatorResponse: CoordinatorResponse = await getCoordinatorResult(sdkVersion, this.apiKey, this.clientPrincipal);
        log("getResult.coordinator", coordinatorResponse, {retriesLeft});
        if (isOk<CoordinatorResponse>(coordinatorResponse)) {
            return coordinatorResponse
        } else if (isProceed<CoordinatorResponse>(coordinatorResponse)) {
            return coordinatorResponse
        } else if (isErr<CoordinatorResponse>(coordinatorResponse)) {
            switch (coordinatorResponse.err) {
                case "changeTopology": {
                    const timeout = getTimeout(COORDINATOR_RETRIES - retriesLeft)
                    log("sleep for", timeout, "ms");
                    await delayPromise(timeout)
                    return this.recursiveCallCoordinator(sdkVersion, retriesLeft - 1)
                }
                case "retry": {
                    if (retriesLeft > 0) {
                        const timeout = getTimeout(COORDINATOR_RETRIES - retriesLeft)
                        log("sleep for", timeout, "ms");
                        await delayPromise(timeout)
                        return this.recursiveCallCoordinator(sdkVersion, retriesLeft - 1)
                    }
                    break
                }
                default: {
                }
            }
        }
        return createErrFatal()
    }

    private async recursiveCallClientRegistry(sdkVersion: number, clientRegistryPrincipal: Principal, retriesLeft: number): Promise<ClientRegistryResponse> {
        const clientRegistryResponse: ClientRegistryResponse = await getClientRegistryResult(sdkVersion, this.apiKey, this.clientPrincipal, clientRegistryPrincipal)
        log("getResult.clientRegistry", clientRegistryResponse, {retriesLeft});
        if (isProceed(clientRegistryResponse)) {
            return clientRegistryResponse
        } else if (isOk(clientRegistryResponse)) {
            return clientRegistryResponse
        } else if (isErr(clientRegistryResponse)) {
            switch (clientRegistryResponse.err) {
                case "retry": {
                    if (retriesLeft > 0) {
                        const timeout = getTimeout(CLIENT_REGISTRY_RETRIES - retriesLeft)
                        log("sleep for", timeout, "ms");
                        await delayPromise(timeout)
                        return this.recursiveCallClientRegistry(sdkVersion, clientRegistryPrincipal, retriesLeft - 1)
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

    private async recursiveCallAnalyticsStore(sdkVersion: number, canisterPrincipal: Principal, accessToken: AccessToken, retriesLeft: number): Promise<AnalyticsStoreResponse> {
        const analyticsStoreResponse: AnalyticsStoreResponse = await getAnalyticsStoreResult(sdkVersion, this.apiKey, this.clientPrincipal, canisterPrincipal, accessToken)
        log("getResult.analyticsStore", analyticsStoreResponse, {retriesLeft});
        if (isOk(analyticsStoreResponse)) {
            return analyticsStoreResponse
        } else if (isErr(analyticsStoreResponse)) {
            switch (analyticsStoreResponse.err) {
                case "retry": {
                    if (retriesLeft > 0) {
                        const timeout = getTimeout(ANALYTICS_STORE_RETRIES - retriesLeft)
                        log("sleep for", timeout, "ms");
                        await delayPromise(timeout)
                        return this.recursiveCallAnalyticsStore(sdkVersion, canisterPrincipal, accessToken, retriesLeft - 1)
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
}

export const getTimeout = (retryIndex: number): number => {
    return Math.max(timeoutBetweenRetriesSec, Math.pow(timeoutBetweenRetriesSec, retryIndex + 1)) * 1000
}
