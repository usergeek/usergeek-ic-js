import {Principal} from "@dfinity/principal";
import {PageVisibilityTracker} from "./pageVisibility/PageVisibilityTracker";
import {ApiParameters, APIService, GetAnalyticsReceiverApiResult} from "./APIService";
import {isOk, warn, log} from "./utils";
import {Tracker} from "./tracker/Tracker";
import {Configuration as EventsTrackerConfiguration} from "./tracker/Configuration";

const sdkVersion: number = 1

/**
 * Usergeek debug configuration
 */
export type DebugConfiguration = {
    loggerLog?: (...args: any[]) => void
    loggerWarn?: (...args: any[]) => void
    loggerError?: (...args: any[]) => void
}

/**
 * Usergeek configuration
 */
export type UsergeekConfig = {
    apiKey: string,
    /**
     * The host to use for the client to make HttpAgent calls to Usergeek backend
     */
    host?: string,
    /**
     * EventTracker initial configuration
     */
    eventTrackerConfiguration?: Partial<EventsTrackerConfiguration>,
    /**
     * Debug callbacks
     */
    debugConfiguration?: DebugConfiguration
}

export class UsergeekClient {

    private config: UsergeekConfig;
    private clientPrincipal: Principal

    private analyticsReceiverApiPromise: Promise<GetAnalyticsReceiverApiResult | undefined>

    private pageVisibilityTracker: PageVisibilityTracker
    private sessionAlreadyTracked: boolean = false

    private tracker: Tracker
    private apiService: APIService

    public init = (config: UsergeekConfig) => {
        this.destroy()
        this.config = config;
        try {
            log(`Usergeek: initialized with config: ${JSON.stringify(config)}`);
        } catch (e) {
        }
    };

    public setPrincipal = (principal: Principal | null | undefined) => {
        try {
            this.validateConfig()
            this.destroy()
            this.clientPrincipal = principal
            this.tryToUploadPendingPackets()
        } catch (e) {
            if (this.config?.debugConfiguration?.loggerError) {
                this.config?.debugConfiguration?.loggerError(`Please pass valid Principal`, {principal})
            }
            warn("UsergeekClient.setPrincipal", e)
        }
    };

    public trackSession = () => {
        (async () => {
            try {
                this.validateAndPrepareEventTracker()
                this.tracker.logSession()
                if (!this.pageVisibilityTracker) {
                    this.pageVisibilityTracker = new PageVisibilityTracker()
                    this.pageVisibilityTracker.start(() => {
                        // noinspection JSIgnoredPromiseFromCall
                        this.trackSession()
                    })
                }
                await this.waitForAnalyticsReceiverApiReadyAndUpload(true, true)
            } catch (e) {
                if (this.config?.debugConfiguration?.loggerError) {
                    this.config?.debugConfiguration?.loggerError("UsergeekClient.trackSession", e)
                }
                warn("UsergeekClient.trackSession", e)
            }
        })()
    }

    public trackEvent = (eventName: string) => {
        (async () => {
            try {
                this.validateAndPrepareEventTracker()
                this.tracker.logEvent(eventName)
                await this.waitForAnalyticsReceiverApiReadyAndUpload(false, false)
            } catch (e) {
                if (this.config?.debugConfiguration?.loggerError) {
                    this.config?.debugConfiguration?.loggerError("UsergeekClient.trackEvent", e)
                }
                warn("UsergeekClient.trackEvent", e)
            }
        })()
    }

    public flush = () => {
        (async () => {
            try {
                this.validateAndPrepareEventTracker()
                await this.waitForAnalyticsReceiverApiReadyAndUpload(true, false)
            } catch (e) {
                warn("UsergeekClient.flush", e)
            }
        })()
    }

    private validateAndPrepareEventTracker = () => {
        validateApiParameters(this.config.apiKey, this.clientPrincipal)

        this.askForAnalyticsReceiverApi()

        if (!this.tracker) {
            this.tracker = new Tracker(this.config.apiKey, this.clientPrincipal, this.config.eventTrackerConfiguration, this.config.debugConfiguration)
        }
    }

    private waitForAnalyticsReceiverApiReadyAndUpload = async (flush: boolean, markSessionAsTracked: boolean) => {
        await this.onAnalyticsReceiverApiReady((analyticsReceiverApiResult) => {
            if (analyticsReceiverApiResult) {
                const apiParameters: ApiParameters = {
                    apiKey: this.config.apiKey,
                    clientPrincipal: this.clientPrincipal,
                    host: this.config.host,
                    sdkVersion: sdkVersion,
                }
                if (this.tracker) {
                    const promise = this.tracker.upload(analyticsReceiverApiResult, this.sessionAlreadyTracked, apiParameters, flush);
                    if (markSessionAsTracked) {
                        this.sessionAlreadyTracked = true
                    }
                    return promise;
                }
            }
        })
    }

    private tryToUploadPendingPackets = () => {
        const apiParametersValid = isApiKeyValid(this.config.apiKey) && isClientPrincipalValid(this.clientPrincipal);
        if (apiParametersValid) {
            // api parameters valid
            // if EventsTracker does not exist OR clientPrincipal changed...
            // ...it is possible to try to upload pending custom events
            if (!this.tracker || !this.tracker.isClientPrincipalEqual(this.clientPrincipal)) {
                this.tracker = new Tracker(this.config.apiKey, this.clientPrincipal, this.config.eventTrackerConfiguration, this.config.debugConfiguration)

                if (this.tracker.hasUnsentPackets()) {
                    // ...try to prefetch AnalyticsReceiverApi in case is it not exist
                    this.askForAnalyticsReceiverApi()

                    // noinspection JSIgnoredPromiseFromCall
                    this.waitForAnalyticsReceiverApiReadyAndUpload(true, false)
                }
            }
        } else {
            if (this.config?.debugConfiguration?.loggerWarn) {
                this.config?.debugConfiguration?.loggerWarn(`Please pass valid apiKey and non anonymous Principal.`)
            }
            warn("UsergeekClient.tryToUploadPendingPackets: Please pass valid apiKey and non anonymous Principal.", {apiKey: this.config?.apiKey, clientPrincipal: this.clientPrincipal})
        }
    }

    private onAnalyticsReceiverApiReady = (promise: (analyticsReceiverApiResult: GetAnalyticsReceiverApiResult | undefined) => Promise<any>) => {
        return this.analyticsReceiverApiPromise.then(promise)
    }

    private askForAnalyticsReceiverApi = () => {
        if (!this.analyticsReceiverApiPromise) {
            this.analyticsReceiverApiPromise = Promise.resolve().then(this.getAnalyticsReceiverApi)
        }
    }

    private getAnalyticsReceiverApi = async (): Promise<GetAnalyticsReceiverApiResult | undefined> => {
        try {
            const apiParameters = {
                apiKey: this.config.apiKey,
                clientPrincipal: this.clientPrincipal,
                host: this.config.host,
                sdkVersion: sdkVersion
            };
            if (!this.apiService) {
                this.apiService = new APIService();
            }
            const getAnalyticsReceiverApiResult = await this.apiService.getAnalyticsReceiverApi(apiParameters)
            if (isOk(getAnalyticsReceiverApiResult)) {
                return getAnalyticsReceiverApiResult.ok;
            }
            return undefined
        } catch (e) {
            warn("UsergeekClient.getAnalyticsReceiverApi", e)
            return undefined
        }
    };

    private validateConfig = () => {
        if (this.config == undefined) {
            throw "UsergeekClient: Please initialize Usergeek first!"
        }
    }

    private destroy = () => {
        if (this.apiService) {
            this.apiService.destroy();
            this.apiService = undefined
        }
        if (this.tracker) {
            //destroy existing tracker if principal cleared
            this.tracker.destroy()
            this.tracker = undefined
            if (this.config?.debugConfiguration?.loggerWarn) {
                this.config?.debugConfiguration?.loggerWarn(`Existing Tracker destroyed`, {clientPrincipal: this.clientPrincipal})
            }
            warn(`UsergeekClient.setPrincipal: existing Tracker destroyed`, {clientPrincipal: this.clientPrincipal})
        }
        this.analyticsReceiverApiPromise = undefined
        this.sessionAlreadyTracked = false
    }
}

const validateApiParameters = (apiKey: string, clientPrincipal: Principal) => {
    if (!isApiKeyValid(apiKey)) {
        throw "Usergeek: ApiKey should be not empty string"
    }
    if (!isClientPrincipalValid(clientPrincipal)) {
        throw "Usergeek: anonymous Principal cannot be tracked"
    }
};

const isApiKeyValid = (apiKey: string): boolean => typeof apiKey == "string" && apiKey.length > 0
const isClientPrincipalValid = (clientPrincipal: Principal): boolean => clientPrincipal && !clientPrincipal.isAnonymous()
