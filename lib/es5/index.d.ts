import { Principal } from "@dfinity/principal";
export declare type UsergeekConfig = {
    apiKey: string;
};
declare const Usergeek: {
    init: (_config: UsergeekConfig) => void;
    setPrincipal: (principal: Principal) => void;
    trackSession: () => void;
};
export { Usergeek };
