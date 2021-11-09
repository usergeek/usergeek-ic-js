import { TopologyId } from "./canisters/coordinator.did";
export declare const UGStorage: {
    coordinator: {
        getTopologyId: () => Promise<TopologyId | undefined>;
        setTopologyId: (value: TopologyId) => void;
        getCanisterIds: () => Promise<Array<string>>;
        setCanisterIds: (value: Array<string>) => void;
    };
};
