import {LocalStorage} from "@dfinity/auth-client";
import {TopologyId} from "./canister/coordinator/coordinator.did";
import {warn} from "./utils";

const store = new LocalStorage("ug-ic");

const Key_TopologyId = "coordinator__topologyId"
const Key_CanisterIds = "coordinator__canisterIds"

export const UGStorage = {
    coordinator: {
        getTopologyId: async (): Promise<TopologyId | undefined> => {
            const value = await store.get(Key_TopologyId);
            if (value) {
                return Number(value)
            }
            return undefined
        },
        setTopologyId: (value: TopologyId) => {
            store.set(Key_TopologyId, JSON.stringify(value))
        },
        getCanisterIds: async (): Promise<Array<string>> => {
            try {
                const value = JSON.parse(await store.get(Key_CanisterIds));
                if (value && Array.isArray(value)) {
                    return value
                }
            } catch (e) {
                warn("storage.getCanisterIds", e);
            }
            return []
        },
        setCanisterIds: (value: Array<string>) => {
            store.set(Key_CanisterIds, JSON.stringify(value))
        },

    }
}