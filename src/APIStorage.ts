import {TopologyId} from "./canisters/coordinator.did";
import {warn} from "./utils";
import {KeyValueStoreFacade} from "./store/KeyValueStoreFacade";

const store = KeyValueStoreFacade.createStore("ug-ic")

const Key_TopologyId = "coordinator__topologyId"
const Key_CanisterIds = "coordinator__canisterIds"

export const APIStorage = {
    coordinator: {
        getTopologyId: (): TopologyId | undefined => {
            const value = store.get(Key_TopologyId);
            if (value) {
                return Number(value)
            }
            return undefined
        },
        setTopologyId: (value: TopologyId) => {
            store.set(Key_TopologyId, JSON.stringify(value))
        },
        getCanisterIds: (): Array<string> => {
            try {
                const valueFromStorage = store.get(Key_CanisterIds);
                if (valueFromStorage && Array.isArray(valueFromStorage)) {
                    return valueFromStorage
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