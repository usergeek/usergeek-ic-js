type VendorEvent = {
    hidden: string,
    event: string,
    state: string,
}

type PageVisibilityApi = {
    isSupported: () => boolean
    state: () => VisibilityState
    addListener: (listener: EventListener) => void
    removeListener: (listener: EventListener) => void
}

export const PageVisibilityApi: PageVisibilityApi = ((doc): PageVisibilityApi => {

    const hasDocument = typeof document !== 'undefined';

    const isSupported = hasDocument && Boolean(document.addEventListener);

    if (isSupported) {
        const vendorEvents: Array<VendorEvent> = [{
            hidden: 'hidden',
            event: 'visibilitychange',
            state: 'visibilityState',
        }, {
            hidden: 'webkitHidden',
            event: 'webkitvisibilitychange',
            state: 'webkitVisibilityState',
        }]

        const getCurrentVendorEvent = (): VendorEvent | undefined => {
            if (!isSupported) {
                return undefined;
            }
            for (const event of vendorEvents) {
                if (event.hidden in document) {
                    return event;
                }
            }
            return undefined;
        }

        const currentVendorEvent = getCurrentVendorEvent();
        if (currentVendorEvent) {
            return {
                isSupported: () => isSupported,
                state: () => doc[currentVendorEvent.state],
                addListener: function (listener: EventListener) {
                    doc.addEventListener(currentVendorEvent.event, listener);
                },
                removeListener: function (listener: EventListener) {
                    doc.removeEventListener(currentVendorEvent.event, listener);
                },
            }
        }
    }
    return {
        isSupported: () => isSupported,
        state: () => "visible",
        addListener: () => undefined,
        removeListener: () => undefined,
    }
})(document)