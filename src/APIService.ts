import {Principal} from '@dfinity/principal';
import {CoordinatorApi, isAnalyticsReceiver, isClientRegistry} from "./CoordinatorAPI";
import {ClientRegistryApi, ClientRegistryParameters, ClientRegistryResponse} from "./ClientRegistryApi";
import {createErrFatal, createOkResult, delayPromise, isErr, isOk, log, UGError, UGResult, warn} from "./utils";
import {AnalyticsReceiverApiView, AnalyticsStoreApi, AnalyticsStoreGetApiParameters} from "./AnalyticsStoreApi";

export const timeoutBetweenRetriesSec = 2
const GLOBAL_RETRIES: number = 20
export const COORDINATOR_RETRIES: number = 20
export const CLIENT_REGISTRY_RETRIES: number = 20
export const ANALYTICS_STORE_RETRIES: number = 20

export interface ApiParameters {
    sdkVersion: number
    apiKey: string,
    clientPrincipal: Principal
    host?: string
}

export type GetAnalyticsReceiverApiResult = { analyticsStoreNotified: boolean, analyticsReceiverApiView: AnalyticsReceiverApiView }

export class APIService {

    private coordinatorApi: CoordinatorApi
    private clientRegistryApi: ClientRegistryApi
    private analyticsStoreApi: AnalyticsStoreApi
    private destroyed: boolean = false

    public async getAnalyticsReceiverApi(apiParameters: ApiParameters): Promise<UGResult<GetAnalyticsReceiverApiResult, UGError>> {
        try {
            const result = await this.getAnalyticsReceiverApiRecursively(apiParameters, GLOBAL_RETRIES);
            log("APIService.getAnalyticsReceiverApi: getAnalyticsReceiverApiRecursively() result", result);
            return result
        } catch (e) {
            warn("APIService.getAnalyticsReceiverApi getAnalyticsReceiverApiRecursively() error", e);
        }
        return createErrFatal()
    }

    public destroy = () => {
        this.destroyed = true

        this.coordinatorApi?.destroy()
        this.coordinatorApi = undefined

        this.clientRegistryApi?.destroy()
        this.clientRegistryApi = undefined

        this.analyticsStoreApi?.destroy()
        this.analyticsStoreApi = undefined

        warn("APIService: destroyed")
    }

    private async getAnalyticsReceiverApiRecursively(apiParameters: ApiParameters, retriesLeft: number): Promise<UGResult<GetAnalyticsReceiverApiResult, UGError>> {
        if (!this.coordinatorApi) {
            this.coordinatorApi = new CoordinatorApi()
        }
        const coordinatorResponse = await this.coordinatorApi.callCoordinatorRecursively(apiParameters, COORDINATOR_RETRIES);
        log("APIService.getAnalyticsReceiverApiRecursively.CoordinatorApi.callCoordinatorRecursively", coordinatorResponse);
        if (!this.destroyed) {
            if (isOk(coordinatorResponse)) {
                const okResponse = coordinatorResponse.ok;
                if (isClientRegistry(okResponse)) {
                    //proceed to clientRegistry
                    const {canisterPrincipal: clientRegistryPrincipal} = okResponse.clientRegistry;
                    const clientRegistryApiParameters: ClientRegistryParameters = {
                        ...apiParameters,
                        clientRegistryPrincipal: clientRegistryPrincipal
                    };
                    if (!this.clientRegistryApi) {
                        this.clientRegistryApi = new ClientRegistryApi()
                    }
                    const clientRegistryResponse: ClientRegistryResponse = await this.clientRegistryApi.callClientRegistryRecursively(clientRegistryApiParameters, CLIENT_REGISTRY_RETRIES)
                    log("APIService.getAnalyticsReceiverApiRecursively.ClientRegistryApi.callClientRegistryRecursively", clientRegistryResponse);
                    if (!this.destroyed) {
                        if (isOk(clientRegistryResponse)) {
                            const analyticsReceiverView = clientRegistryResponse.ok;
                            const analyticsStoreApiParameters: AnalyticsStoreGetApiParameters = {
                                ...apiParameters,
                                canisterPrincipal: analyticsReceiverView.analyticsReceiverView.canisterPrincipal,
                                accessToken: analyticsReceiverView.analyticsReceiverView.accessToken
                            };
                            if (!this.analyticsStoreApi) {
                                this.analyticsStoreApi = new AnalyticsStoreApi()
                            }
                            const analyticsReceiverApiResult = await this.analyticsStoreApi.getAnalyticsReceiverApiRecursively(analyticsStoreApiParameters, ANALYTICS_STORE_RETRIES);
                            log("APIService.getAnalyticsReceiverApiRecursively.AnalyticsStoreApi.getAnalyticsReceiverApiRecursively", analyticsReceiverApiResult);
                            if (!this.destroyed) {
                                if (isOk(analyticsReceiverApiResult)) {
                                    const analyticsReceiverApiView = analyticsReceiverApiResult.ok;
                                    return createOkResult({
                                        analyticsReceiverApiView: analyticsReceiverApiView,
                                        analyticsStoreNotified: analyticsReceiverView.analyticsStoreNotified
                                    })
                                }
                            } else {
                                warn("APIService: analyticsStoreApi.getAnalyticsReceiverApiRecursively() result skipped - destroyed")
                            }
                        } else if (isErr(clientRegistryResponse)) {
                            switch (clientRegistryResponse.err) {
                                case "restart": {
                                    if (!this.destroyed) {
                                        const timeout = getTimeout(GLOBAL_RETRIES - retriesLeft)
                                        log("sleep for", timeout, "ms");
                                        await delayPromise(timeout)
                                        return await this.getAnalyticsReceiverApiRecursively(apiParameters, retriesLeft - 1)
                                    } else {
                                        warn("APIService: getAnalyticsReceiverApiRecursively skipped - destroyed")
                                    }
                                    break
                                }
                                default: {
                                    return clientRegistryResponse
                                }
                            }
                        }
                    } else {
                        warn("APIService: clientRegistryApi.callClientRegistryRecursively() result skipped - destroyed")
                    }
                } else if (isAnalyticsReceiver(okResponse)) {
                    const {view: analyticsReceiverView} = okResponse.analyticsReceiver
                    const analyticsStoreApiParameters: AnalyticsStoreGetApiParameters = {
                        ...apiParameters,
                        canisterPrincipal: analyticsReceiverView.canisterPrincipal,
                        accessToken: analyticsReceiverView.accessToken
                    };
                    if (!this.analyticsStoreApi) {
                        this.analyticsStoreApi = new AnalyticsStoreApi()
                    }
                    const analyticsReceiverApiResult = await this.analyticsStoreApi.getAnalyticsReceiverApiRecursively(analyticsStoreApiParameters, ANALYTICS_STORE_RETRIES);
                    log("APIService.getAnalyticsReceiverApiRecursively.AnalyticsStoreApi.getAnalyticsReceiverApiRecursively", analyticsReceiverApiResult);
                    if (!this.destroyed) {
                        if (isOk(analyticsReceiverApiResult)) {
                            const analyticsReceiverApiView = analyticsReceiverApiResult.ok;
                            return createOkResult({
                                analyticsReceiverApiView: analyticsReceiverApiView,
                                analyticsStoreNotified: false
                            })
                        }
                    } else {
                        warn("APIService: analyticsStoreApi.getAnalyticsReceiverApiRecursively() result skipped - destroyed")
                    }
                }
            }
        } else {
            warn("APIService: coordinatorApi.callCoordinatorRecursively() result skipped - destroyed")
        }
        return createErrFatal()
    }
}

export const getTimeout = (retryIndex: number): number => {
    return Math.max(timeoutBetweenRetriesSec, Math.pow(timeoutBetweenRetriesSec, retryIndex + 1)) * 1000
}
