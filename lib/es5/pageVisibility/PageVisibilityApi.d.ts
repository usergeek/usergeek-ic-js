declare type PageVisibilityApi = {
    isSupported: () => boolean;
    state: () => VisibilityState;
    addListener: (listener: EventListener) => void;
    removeListener: (listener: EventListener) => void;
};
export declare const PageVisibilityApi: PageVisibilityApi;
export {};
