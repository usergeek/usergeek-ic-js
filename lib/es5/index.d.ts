import { Principal } from "@dfinity/principal";
export declare type UsergeekConfig = {
    apiKey: string;
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
