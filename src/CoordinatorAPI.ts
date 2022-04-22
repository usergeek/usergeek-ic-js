import {AnonymousIdentity} from "@dfinity/agent";
import {Principal} from '@dfinity/principal';
import {HelloResult, Topology, TopologyId} from "./canisters/coordinator.did";
import {createCanisterActor} from "./canisters/coordinator";
import {APIStorage} from "./APIStorage";
import {createErrFatal, createErrResult, createErrRetry, createOkResult, delayPromise, getSharedFunctionData, getSharedFunctionDataPrincipal, hasOwnProperty, isErr, isOk, isProceed, log, UGError, UGResult, warn} from "./utils";
import {AnalyticsReceiverView, ClientRegistryApi} from "./ClientRegistryApi";
import {ApiParameters, COORDINATOR_RETRIES, getTimeout, timeoutBetweenRetriesSec} from "./APIService";
import {coordinator_canister_ids} from "./canisters/constants";

export type CoordinatorResponseClientRegistry = { "clientRegistry": { "canisterPrincipal": Principal } }
export type CoordinatorResponseAnalyticsReceiver = { "analyticsReceiver": { "view": AnalyticsReceiverView } }
export const isClientRegistry = <T = CoordinatorResponseClientRegistry | CoordinatorResponseAnalyticsReceiver>(obj: T): obj is T & Record<"clientRegistry", unknown> => {
    return hasOwnProperty(obj, "clientRegistry")
}
export const isAnalyticsReceiver = <T = CoordinatorResponseClientRegistry | CoordinatorResponseAnalyticsReceiver>(obj: T): obj is T & Record<"analyticsReceiver", unknown> => {
    return hasOwnProperty(obj, "analyticsReceiver")
}

export type CoordinatorResponse = UGResult<CoordinatorResponseClientRegistry | CoordinatorResponseAnalyticsReceiver, "changeTopology" | UGError>

let currentSessionTopologyId

export class CoordinatorApi {

    private destroyed: boolean = false

    public async callCoordinatorRecursively(apiParameters: ApiParameters, retriesLeft: number): Promise<CoordinatorResponse> {
        const coordinatorResponse: CoordinatorResponse = await this.getResult(apiParameters);
        log("CoordinatorApi.callCoordinatorRecursively.coordinator", coordinatorResponse, {retriesLeft});
        if (isOk<CoordinatorResponse>(coordinatorResponse)) {
            return coordinatorResponse
        } else if (isProceed<CoordinatorResponse>(coordinatorResponse)) {
            return coordinatorResponse
        } else if (isErr<CoordinatorResponse>(coordinatorResponse)) {
            switch (coordinatorResponse.err) {
                case "changeTopology": {
                    if (!this.destroyed) {
                        const timeout = getTimeout(COORDINATOR_RETRIES - retriesLeft)
                        log("sleep for", timeout, "ms");
                        await delayPromise(timeout)
                        return this.callCoordinatorRecursively(apiParameters, retriesLeft - 1)
                    } else {
                        warn("CoordinatorApi: changeTopology: callCoordinatorRecursively skipped - destroyed")
                    }
                    break
                }
                case "retry": {
                    if (retriesLeft > 0) {
                        if (!this.destroyed) {
                            const timeout = getTimeout(COORDINATOR_RETRIES - retriesLeft)
                            log("sleep for", timeout, "ms");
                            await delayPromise(timeout)
                            return this.callCoordinatorRecursively(apiParameters, retriesLeft - 1)
                        } else {
                            warn("CoordinatorApi: retry: callCoordinatorRecursively skipped - destroyed")
                        }
                    }
                    break
                }
                default: {
                }
            }
        }
        return createErrFatal()
    }

    public destroy = () => {
        this.destroyed = true
        warn("CoordinatorApi: destroyed")
    }

    private getResult = async (apiParameters: ApiParameters): Promise<CoordinatorResponse> => {
        currentSessionTopologyId = APIStorage.coordinator.getTopologyId()
        let canisterIds = APIStorage.coordinator.getCanisterIds();
        if (canisterIds.length === 0) {
            canisterIds = Array.from(coordinator_canister_ids)
        }
        if (canisterIds.length === 0) {
            warn("no canisters");
            return createErrFatal()
        }
        return this.getClientRegistryRecursively(apiParameters, canisterIds)
    };

    private getClientRegistryRecursively = async (apiParameters: ApiParameters, inProgressCanisterIds: Array<string>): Promise<CoordinatorResponse> => {
        const canisterId: string = CoordinatorApi.getCanisterId(inProgressCanisterIds);
        log("CoordinatorApi.getClientRegistryRecursively using", {inProgressCanisterIds, currentSessionTopologyId, canisterId});
        if (canisterId) {
            let result: HelloResult;
            try {
                result = await this.hello(apiParameters, canisterId);
            } catch (e) {
                warn("CoordinatorApi.getClientRegistryRecursively actor.hello", e);
                return createErrRetry()
            }
            log("CoordinatorApi.getClientRegistryRecursively actor.hello", result);
            if (hasOwnProperty(result, "clientRegistry")) {
                const clientRegistry = result.clientRegistry;
                const clientRegistryPrincipal: Principal = getSharedFunctionDataPrincipal(clientRegistry.getAnalyticsReceiver)
                if (clientRegistryPrincipal) {
                    return createOkResult({clientRegistry: {canisterPrincipal: clientRegistryPrincipal}})
                }
            } else if (hasOwnProperty(result, "analyticsReceiver")) {
                const analyticsReceiver = result.analyticsReceiver;
                const analyticsReceiverView: AnalyticsReceiverView = ClientRegistryApi.getAnalyticsReceiverData(analyticsReceiver)
                if (analyticsReceiverView) {
                    return createOkResult({analyticsReceiver: {view: analyticsReceiverView}})
                }
            } else if (hasOwnProperty(result, "changeTopology")) {
                const changeTopology: Topology = result.changeTopology;
                const newTopologyId: TopologyId = changeTopology.topologyId;
                const newCoordinators = changeTopology.coordinators;
                const newCanisterIds: Array<string> = []
                for (let i = 0; i < newCoordinators.length; i++) {
                    const newCoordinatorData = getSharedFunctionData(newCoordinators[i]);
                    if (newCoordinatorData) {
                        const [coordinatorPrincipal, coordinatorMethodName] = newCoordinatorData
                        if (coordinatorMethodName == "hello") {
                            newCanisterIds.push(coordinatorPrincipal.toText())
                        }
                    }
                }
                if (newCanisterIds.length > 0) {
                    currentSessionTopologyId = newTopologyId
                    APIStorage.coordinator.setCanisterIds(newCanisterIds)
                    APIStorage.coordinator.setTopologyId(newTopologyId)
                }
                return createErrResult("changeTopology")
            } else if (hasOwnProperty(result, "invalidClient")) {
                return createErrFatal()
            }
            //"temporaryUnavailable" case
            if (!this.destroyed) {
                const timeout = timeoutBetweenRetriesSec * 1000
                log("sleep for", timeout, "ms");
                await delayPromise(timeout)
                const updatedInProgressCanisters = CoordinatorApi.markCanisterIdAsFailed(canisterId, inProgressCanisterIds);
                return this.getClientRegistryRecursively(apiParameters, updatedInProgressCanisters)
            } else {
                warn("CoordinatorApi: temporaryUnavailable: getClientRegistryRecursively skipped - destroyed")
            }
        }
        return createErrRetry()
    };

    private hello = async (apiParameters: ApiParameters, canisterId: string): Promise<HelloResult> => {
        const actor = createCanisterActor(canisterId, new AnonymousIdentity(), apiParameters.host);
        const topologyId = currentSessionTopologyId
        return await actor.hello([apiParameters.clientPrincipal], apiParameters.sdkVersion, topologyId ? [topologyId] : [], apiParameters.apiKey);
    };

    private static getRandomCanisterId = (array: Array<string>): string => {
        const index = Math.floor(Math.random() * array.length);
        return array[index]
    };

    private static getCanisterId = (inProgressCanisterIds: Array<string>): string | undefined => {
        if (inProgressCanisterIds.length == 0) {
            return undefined
        }
        return CoordinatorApi.getRandomCanisterId(inProgressCanisterIds)
    };

    private static markCanisterIdAsFailed(failedCanisterId: string, inProgressCanisterIds: Array<string>): Array<string> {
        return inProgressCanisterIds.filter(value => value !== failedCanisterId)
    }
}