import { Principal } from "@dfinity/principal";
export declare type UsergeekConfig = {
    apiKey: string;
    /**
     * The host to use for the client to make HttpAgent calls to Usergeek backend
     */
    host?: string;
};
export declare type SessionContext = {
    apiKey: string;
    clientPrincipal: Principal;
    host?: string;
};
declare const Usergeek: {
    init: (_config: UsergeekConfig) => void;
    setPrincipal: (principal: Principal) => void;
    trackSession: () => void;
};
export { Usergeek };
