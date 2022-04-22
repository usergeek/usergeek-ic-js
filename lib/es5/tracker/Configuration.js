"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationUtil = void 0;
exports.ConfigurationUtil = {
    makeConfiguration: function (initialConfiguration) {
        return __assign({ uploadReportsCount: 50, uploadReportsPeriod: 5 * 1000, maxReportsCountInStorage: 1000, removeReportsPercentWhenFull: 2, dryRunEnabled: false }, initialConfiguration);
    }
};
//# sourceMappingURL=Configuration.js.map