"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVisibilityApi = void 0;
exports.PageVisibilityApi = (function (doc) {
    var hasDocument = typeof document !== 'undefined';
    var isSupported = hasDocument && Boolean(document.addEventListener);
    if (isSupported) {
        var vendorEvents_1 = [{
                hidden: 'hidden',
                event: 'visibilitychange',
                state: 'visibilityState',
            }, {
                hidden: 'webkitHidden',
                event: 'webkitvisibilitychange',
                state: 'webkitVisibilityState',
            }];
        var getCurrentVendorEvent = function () {
            if (!isSupported) {
                return undefined;
            }
            for (var _i = 0, vendorEvents_2 = vendorEvents_1; _i < vendorEvents_2.length; _i++) {
                var event_1 = vendorEvents_2[_i];
                if (event_1.hidden in document) {
                    return event_1;
                }
            }
            return undefined;
        };
        var currentVendorEvent_1 = getCurrentVendorEvent();
        if (currentVendorEvent_1) {
            return {
                isSupported: function () { return isSupported; },
                state: function () { return doc[currentVendorEvent_1.state]; },
                addListener: function (listener) {
                    doc.addEventListener(currentVendorEvent_1.event, listener);
                },
                removeListener: function (listener) {
                    doc.removeEventListener(currentVendorEvent_1.event, listener);
                },
            };
        }
    }
    return {
        isSupported: function () { return isSupported; },
        state: function () { return "visible"; },
        addListener: function () { return undefined; },
        removeListener: function () { return undefined; },
    };
})(document);
//# sourceMappingURL=PageVisibilityApi.js.map