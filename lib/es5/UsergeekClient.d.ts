import { Principal } from "@dfinity/principal";
import { Configuration as EventsTrackerConfiguration } from "./tracker/Configuration";
/**
 * Usergeek debug configuration
 */
export declare type DebugConfiguration = {
    loggerLog?: (...args: any[]) => void;
    loggerWarn?: (...args: any[]) => void;
    loggerError?: (...args: any[]) => void;
};
/**
 * Usergeek configuration
 */
export declare type UsergeekConfig = {
    apiKey: string;
    /**
     * The host to use for the client to make HttpAgent calls to Usergeek backend
     */
    host?: string;
    /**
     * EventTracker initial configuration
     */
    eventTrackerConfiguration?: Partial<EventsTrackerConfiguration>;
    /**
     * Debug callbacks
     */
    debugConfiguration?: DebugConfiguration;
};
export declare class UsergeekClient {
    private config;
    private clientPrincipal;
    private analyticsReceiverApiPromise;
    private pageVisibilityTracker;
    private sessionAlreadyTracked;
    private tracker;
    private apiService;
    init: (config: UsergeekConfig) => void;
    setPrincipal: (principal: Principal | null | undefined) => void;
    trackSession: () => void;
    trackEvent: (eventName: string) => void;
    flush: () => void;
    private validateAndPrepareEventTracker;
    private waitForAnalyticsReceiverApiReadyAndUpload;
    private tryToUploadPendingPackets;
    private onAnalyticsReceiverApiReady;
    private askForAnalyticsReceiverApi;
    private getAnalyticsReceiverApi;
    private validateConfig;
    private destroy;
}
