import { Principal } from '@dfinity/principal';
import { ProjectApiKey } from "./canister/coordinator/coordinator.did";
export declare const timeoutBetweenRetriesSec = 2;
export declare class SessionFacade {
    private readonly apiKey;
    private readonly clientPrincipal;
    constructor(apiKey: ProjectApiKey, principal: Principal);
    trackSession(): Promise<void>;
    private recursiveCall;
    private recursiveCallCoordinator;
    private recursiveCallClientRegistry;
    private recursiveCallAnalyticsStore;
}
export declare const getTimeout: (retryIndex: number) => number;
