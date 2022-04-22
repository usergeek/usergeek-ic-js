"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
var utils_1 = require("../utils");
var Report = /** @class */ (function () {
    function Report(sequence, timeMillis, content) {
        this.sequence = sequence;
        this.timeMillis = timeMillis;
        this.content = content;
    }
    Report.serialize = function (report) {
        return JSON.stringify({
            sequence: report.sequence,
            timeMillis: report.timeMillis,
            content: JSON.stringify(report.content)
        });
    };
    Report.deserialize = function (serializedReport) {
        var reportJSONObject = utils_1.UsergeekUtils.parseJSONSafe(serializedReport);
        if (reportJSONObject) {
            var sequence = reportJSONObject.sequence;
            var timeMillis = reportJSONObject.timeMillis;
            var content = reportJSONObject.content;
            if (utils_1.UsergeekUtils.isNumber(sequence) && utils_1.UsergeekUtils.isNumber(timeMillis) && utils_1.UsergeekUtils.isString(content)) {
                var reportContentJSONObject = utils_1.UsergeekUtils.parseJSONSafe(content);
                if (reportContentJSONObject) {
                    if ((0, utils_1.hasOwnProperty)(reportContentJSONObject, "event")) {
                        return new Report(sequence, timeMillis, reportContentJSONObject);
                    }
                    else if ((0, utils_1.hasOwnProperty)(reportContentJSONObject, "session")) {
                        return new Report(sequence, timeMillis, reportContentJSONObject);
                    }
                }
            }
        }
        return undefined;
    };
    return Report;
}());
exports.Report = Report;
//# sourceMappingURL=Report.js.map