"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsStorage = void 0;
var Report_1 = require("./Report");
var KEY_REPORTS = "reports";
var ReportsStorage = /** @class */ (function () {
    function ReportsStorage(api) {
        this.api = api;
    }
    ReportsStorage.prototype.getMaxSequence = function () {
        var maxSequence = 0;
        this.getReports().forEach(function (report) {
            maxSequence = Math.max(report.sequence, maxSequence);
        });
        return maxSequence;
    };
    ReportsStorage.prototype.getReportsCount = function () {
        return this._storage_getReportsSafe().length;
    };
    ReportsStorage.prototype.putReport = function (sequence, timeMillis, reportContent) {
        var reports = this._storage_getReportsSafe();
        var report = new Report_1.Report(sequence, timeMillis, reportContent);
        var reportSerialized = Report_1.Report.serialize(report);
        reports.push(reportSerialized);
        return this._storage_setReports(reports);
    };
    ReportsStorage.prototype.tryToFreeSpace = function (reportSequence, removeReportsPercentWhenFull) {
        var reportsCount = this.getReportsCount();
        var removeCount = Math.ceil((reportsCount * removeReportsPercentWhenFull) / 100);
        var sequenceForRemove = reportSequence - Math.max(1, reportsCount - removeCount);
        var removeSuccess = this.removeEarlyReports(sequenceForRemove);
        return [removeSuccess, removeCount];
    };
    ReportsStorage.prototype.removeEarlyReports = function (reportSequence) {
        var indexToDeleteTo = -1;
        this.getReports().forEach(function (report, idx) {
            if (report.sequence <= reportSequence) {
                indexToDeleteTo = idx;
            }
        });
        if (indexToDeleteTo > -1) {
            var reports = this._storage_getReportsSafe();
            reports.splice(0, indexToDeleteTo + 1);
            return this._storage_setReports(reports);
        }
        return true;
    };
    ReportsStorage.prototype.getReports = function (limit) {
        var targetSize = limit !== undefined ? limit : -1;
        var result = [];
        var fetchAll = targetSize < 0;
        this._storage_getReportsSafe().some(function (reportJSONString, idx) {
            var someResult = fetchAll ? false : idx >= targetSize;
            if (!someResult) {
                var report = Report_1.Report.deserialize(reportJSONString);
                if (report) {
                    result.push(report);
                }
            }
            return someResult;
        });
        return result;
    };
    ReportsStorage.prototype.clearAll = function () {
        this._storage_clearReports();
    };
    ReportsStorage.prototype._storage_getReportsSafe = function () {
        return this.api.get(KEY_REPORTS) || Array();
    };
    ReportsStorage.prototype._storage_setReports = function (reports) {
        try {
            this.api.set(KEY_REPORTS, reports);
            return true;
        }
        catch (e) {
            // maybe QuotaExceededError here
            return false;
        }
    };
    ReportsStorage.prototype._storage_clearReports = function () {
        this.api.remove(KEY_REPORTS);
    };
    return ReportsStorage;
}());
exports.ReportsStorage = ReportsStorage;
//# sourceMappingURL=ReportsStorage.js.map