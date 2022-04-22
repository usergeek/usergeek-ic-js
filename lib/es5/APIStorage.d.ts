import { TopologyId } from "./canisters/coordinator.did";
export declare const APIStorage: {
    coordinator: {
        getTopologyId: () => TopologyId | undefined;
        setTopologyId: (value: TopologyId) => void;
        getCanisterIds: () => Array<string>;
        setCanisterIds: (value: Array<string>) => void;
    };
};
