import {Principal} from "@dfinity/principal";
import {SessionFacade} from "./SessionFacade";
import {warn} from "./utils";

export type UsergeekConfig = {
    apiKey: string
}

let config: UsergeekConfig;
let clientPrincipal: Principal

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
            const sessionFacade = new SessionFacade(config.apiKey, clientPrincipal);
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