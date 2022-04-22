"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVisibilityTracker = void 0;
var PageVisibilityApi_1 = require("./PageVisibilityApi");
var utils_1 = require("./../utils");
var ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
var LOG_KEY = "pageVisibility";
var PageVisibilityTracker = /** @class */ (function () {
    function PageVisibilityTracker() {
    }
    PageVisibilityTracker.prototype.start = function (dayChangedCallback) {
        var _this = this;
        if (!this.started) {
            this.started = true;
            if (PageVisibilityApi_1.PageVisibilityApi.isSupported()) {
                this.lastTrackedSessionDayIndex = getCurrentDayIndex();
                PageVisibilityApi_1.PageVisibilityApi.addListener(function () {
                    if (PageVisibilityApi_1.PageVisibilityApi.state() == "visible") {
                        var currentDayIndex = getCurrentDayIndex();
                        var diff = currentDayIndex - _this.lastTrackedSessionDayIndex;
                        if (diff > 0) {
                            _this.lastTrackedSessionDayIndex = currentDayIndex;
                            (0, utils_1.log)(LOG_KEY, {
                                action: "trackSession",
                                currentDayIndex: _this.lastTrackedSessionDayIndex
                            });
                            dayChangedCallback();
                        }
                    }
                });
            }
            else {
                (0, utils_1.warn)(LOG_KEY, "notSupported");
            }
        }
    };
    return PageVisibilityTracker;
}());
exports.PageVisibilityTracker = PageVisibilityTracker;
var getCurrentDayIndex = function () { return Math.floor(new Date().getTime() / ONE_DAY_MILLIS); };
//# sourceMappingURL=PageVisibilityTracker.js.map