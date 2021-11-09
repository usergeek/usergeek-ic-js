import { SessionContext } from "./index";
export declare const timeoutBetweenRetriesSec = 2;
export declare class SessionFacade {
    private readonly sessionContext;
    constructor(sessionContext: SessionContext);
    trackSession(): Promise<void>;
    private recursiveCall;
    private recursiveCallCoordinator;
    private recursiveCallClientRegistry;
    private recursiveCallAnalyticsStore;
}
export declare const getTimeout: (retryIndex: number) => number;
