import {Principal} from "@dfinity/principal";
import {SessionFacade} from "./SessionFacade";
import {warn} from "./utils";

export type UsergeekConfig = {
    apiKey: string,
    /**
     * The host to use for the client to make HttpAgent calls to Usergeek backend
     */
    host?: string
}

let config: UsergeekConfig;
let clientPrincipal: Principal

export type SessionContext = {
    apiKey: string,
    clientPrincipal: Principal
    host?: string
}

const init = (_config: UsergeekConfig) => {
    config = _config;
}

const setPrincipal = (principal: Principal) => {
    clientPrincipal = principal
}

let promiseInProgress: Promise<any>

const trackSession = () => {
    try {
        if (!clientPrincipal || clientPrincipal.isAnonymous()) {
            return
        }
        const run = async () => {
            const context: SessionContext = {
                apiKey: config.apiKey,
                clientPrincipal: clientPrincipal,
                host: config.host
            }
            const sessionFacade = new SessionFacade(context);
            await sessionFacade.trackSession()
        }

        if (!promiseInProgress) {
            promiseInProgress = Promise.resolve().then(run)
        } else {
            promiseInProgress = promiseInProgress.then(run)
        }
    } catch (e) {
        warn("register", e)
    }
}

const Usergeek = {
    init,
    setPrincipal,
    trackSession
}

export {Usergeek}