import {AnonymousIdentity} from "@dfinity/agent";
import {Principal} from '@dfinity/principal';
import {HelloResult, ProjectApiKey, Topology, TopologyId} from "./canister/coordinator/coordinator.did";
import {createCanisterActor} from "./canister/coordinator/coordinator";
import {UGStorage} from "./Storage";
import {createErrFatal, createErrResult, createErrRetry, createOkResult, createProceedResult, delayPromise, getSharedFunctionData, getSharedFunctionDataPrincipal, hasOwnProperty, log, UGError, UGResultExtended, warn} from "./utils";
import {AnalyticsReceiverView, getAnalyticsReceiverData} from "./ClientRegistryService";
import {timeoutBetweenRetriesSec} from "./SessionFacade";

const coordinator_canister_ids = process.env["COORDINATOR_CANISTER_IDS"] || ["r5m4o-xaaaa-aaaah-qbpfq-cai", "3vhcz-7yaaa-aaaah-qbr2q-cai"]

export type CoordinatorResponseProceedClientRegistry = { "clientRegistry": { "canisterPrincipal": Principal } }
export type CoordinatorResponseProceedAnalyticsReceiver = { "analyticsReceiver": { "view": AnalyticsReceiverView } }
export const isProceedToClientRegistry = <T = CoordinatorResponseProceedClientRegistry | CoordinatorResponseProceedAnalyticsReceiver>(obj: T): obj is T & Record<"clientRegistry", unknown> => {
    return hasOwnProperty(obj, "clientRegistry")
}
export const isProceedToAnalyticsReceiver = <T = CoordinatorResponseProceedClientRegistry | CoordinatorResponseProceedAnalyticsReceiver>(obj: T): obj is T & Record<"analyticsReceiver", unknown> => {
    return hasOwnProperty(obj, "analyticsReceiver")
}

export type CoordinatorResponse = UGResultExtended<string, "changeTopology" | UGError, CoordinatorResponseProceedClientRegistry | CoordinatorResponseProceedAnalyticsReceiver>

let currentSessionTopologyId

////////////////////////////////////////////////
// Public
////////////////////////////////////////////////

export const getResult = async (sdkVersion: number, apiKey: ProjectApiKey, clientPrincipal: Principal): Promise<CoordinatorResponse> => {
    currentSessionTopologyId = await UGStorage.coordinator.getTopologyId()
    let canisterIds = await UGStorage.coordinator.getCanisterIds();
    if (canisterIds.length === 0) {
        canisterIds = Array.from(coordinator_canister_ids)
    }
    if (canisterIds.length === 0) {
        warn("no canisters");
        return createErrFatal()
    }
    return await getClientRegistry(sdkVersion, apiKey, clientPrincipal, canisterIds)
}

////////////////////////////////////////////////
// Private
////////////////////////////////////////////////

const hello = async (sdkVersion: number, apiKey: ProjectApiKey, clientPrincipal: Principal, canisterId: string): Promise<HelloResult> => {
    const actor = createCanisterActor(canisterId, new AnonymousIdentity());
    const topologyId = currentSessionTopologyId
    return await actor.hello([clientPrincipal], sdkVersion, topologyId ? [topologyId] : [], apiKey);
}


const getClientRegistry = async (sdkVersion: number, apiKey: ProjectApiKey, clientPrincipal: Principal, inProgressCanisterIds: Array<string>): Promise<CoordinatorResponse> => {
    const canisterId: string = getCanisterId(inProgressCanisterIds);
    log("using:", {inProgressCanisterIds, currentSessionTopologyId, canisterId});
    if (canisterId) {
        let result: HelloResult;
        try {
            result = await hello(sdkVersion, apiKey, clientPrincipal, canisterId);
        } catch (e) {
            warn("actor.hello", e);
            return createErrRetry()
        }
        log("actor.hello", result);
        if (hasOwnProperty(result, "clientRegistry")) {
            const clientRegistry = result.clientRegistry;
            const clientRegistryPrincipal: Principal = getSharedFunctionDataPrincipal(clientRegistry.getAnalyticsReceiver)
            if (clientRegistryPrincipal) {
                return createProceedResult({clientRegistry: {canisterPrincipal: clientRegistryPrincipal}})
            }
        } else if (hasOwnProperty(result, "analyticsReceiver")) {
            const analyticsReceiver = result.analyticsReceiver;
            const analyticsReceiverView: AnalyticsReceiverView = getAnalyticsReceiverData(analyticsReceiver)
            if (analyticsReceiverView) {
                return createProceedResult({analyticsReceiver: {view: analyticsReceiverView}})
            }
        } else if (hasOwnProperty(result, "collectSuccess")) {
            return createOkResult("collectSuccess")
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
                UGStorage.coordinator.setCanisterIds(newCanisterIds)
                UGStorage.coordinator.setTopologyId(newTopologyId)
            }
            return createErrResult("changeTopology")
        } else if (hasOwnProperty(result, "invalidClient")) {
            return createErrFatal()
        }
        //"temporaryUnavailable" case
        const timeout = timeoutBetweenRetriesSec * 1000
        log("sleep for", timeout, "ms");
        await delayPromise(timeout)
        const updatedInProgressCanisters = markCanisterIdAsFailed(canisterId, inProgressCanisterIds);
        return getClientRegistry(sdkVersion, apiKey, clientPrincipal, updatedInProgressCanisters)
    }
    return createErrRetry()
}

export const getRandomCanisterId = (array: Array<string>): string => {
    const index = Math.floor(Math.random() * array.length);
    return array[index]
}

export const getCanisterId = (inProgressCanisterIds: Array<string>): string | undefined => {
    if (inProgressCanisterIds.length == 0) {
        return undefined
    }
    return getRandomCanisterId(inProgressCanisterIds)
}

export const markCanisterIdAsFailed = (failedCanisterId: string, inProgressCanisterIds: Array<string>): Array<string> => {
    return inProgressCanisterIds.filter(value => value !== failedCanisterId)
}