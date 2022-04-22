"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
var utils_1 = require("../utils");
var ReportsStorage_1 = require("./ReportsStorage");
var KeyValueStoreFacade_1 = require("../store/KeyValueStoreFacade");
var Configuration_1 = require("./Configuration");
var Uploader_1 = require("./Uploader");
var EVENT_NAME_MAX_SIZE = 250;
var Tracker = /** @class */ (function () {
    function Tracker(apiKey, clientPrincipal, initialConfiguration, debugConfiguration) {
        var _this = this;
        var _a, _b;
        this.scheduleUpload = false;
        this.uploading = false;
        this.destroyed = false;
        this.isClientPrincipalEqual = function (principal) {
            var _a;
            return (principal === null || principal === void 0 ? void 0 : principal.toText()) == ((_a = _this.clientPrincipal) === null || _a === void 0 ? void 0 : _a.toText());
        };
        this.logSession = function () {
            try {
                var reportSessionContent = {};
                var report = {
                    session: reportSessionContent
                };
                _this.logReport(utils_1.UsergeekUtils.getCurrentTime(), report);
            }
            catch (e) {
                //nop
            }
        };
        this.logEvent = function (eventName) {
            try {
                var reportEventContent = {
                    name: String(eventName).trim()
                };
                var report = {
                    event: reportEventContent
                };
                _this.logReport(utils_1.UsergeekUtils.getCurrentTime(), report);
            }
            catch (e) {
                //nop
            }
        };
        this.destroy = function () {
            var _a;
            _this.destroyed = true;
            (_a = _this.uploader) === null || _a === void 0 ? void 0 : _a.destroy();
            window.clearTimeout(_this.scheduleUploadTimer);
            _this.scheduleUpload = false;
            (0, utils_1.warn)("Tracker: destroyed");
        };
        this.logReport = function (timeMillis, reportContent) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            _this.validateSequence();
            var reportSequence = ++_this.sequence;
            var validationSuccess = _this.validateReport(reportContent);
            if (!validationSuccess) {
                return;
            }
            if (_this.configuration.dryRunEnabled) {
                if (reportContent && ((_a = _this.debugConfiguration) === null || _a === void 0 ? void 0 : _a.loggerLog)) {
                    (_b = _this.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerLog("Report skipped (dryRun ON)", { reportContent: reportContent });
                }
                return;
            }
            var putSuccess = _this.reportsStorage.putReport(reportSequence, timeMillis, reportContent);
            if (!putSuccess) {
                if ((_c = _this.debugConfiguration) === null || _c === void 0 ? void 0 : _c.loggerError) {
                    (_d = _this.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerError("Unable to store data in localStorage. Seems that there is no space left... Will try to remove " + _this.configuration.removeReportsPercentWhenFull + "% of oldest events");
                }
                var _q = _this.reportsStorage.tryToFreeSpace(reportSequence, _this.configuration.removeReportsPercentWhenFull), tryToFreeSpaceSuccess = _q[0], removeCount = _q[1];
                if (tryToFreeSpaceSuccess) {
                    if ((_e = _this.debugConfiguration) === null || _e === void 0 ? void 0 : _e.loggerWarn) {
                        (_f = _this.debugConfiguration) === null || _f === void 0 ? void 0 : _f.loggerWarn("Number of reports removed: " + removeCount + ". Actual reports: " + _this.reportsStorage.getReportsCount());
                    }
                    _this.reportsStorage.putReport(reportSequence, timeMillis, reportContent);
                }
                else {
                    if ((_g = _this.debugConfiguration) === null || _g === void 0 ? void 0 : _g.loggerError) {
                        (_h = _this.debugConfiguration) === null || _h === void 0 ? void 0 : _h.loggerError("Failed to remove " + removeCount + " reports. Existing reports: " + _this.reportsStorage.getReportsCount());
                    }
                    _this.reportsStorage.clearAll();
                }
            }
            else {
                if (reportContent && ((_j = _this.debugConfiguration) === null || _j === void 0 ? void 0 : _j.loggerLog)) {
                    (_k = _this.debugConfiguration) === null || _k === void 0 ? void 0 : _k.loggerLog("Report stored", { reportSequence: reportSequence, timeMillis: timeMillis, reportContent: reportContent });
                }
            }
            var reportsCount = _this.reportsStorage.getReportsCount();
            if (reportsCount > _this.configuration.maxReportsCountInStorage) {
                var _r = _this.reportsStorage.tryToFreeSpace(reportSequence, _this.configuration.removeReportsPercentWhenFull), tryToFreeSpaceSuccess = _r[0], removeCount = _r[1];
                if (tryToFreeSpaceSuccess) {
                    if ((_l = _this.debugConfiguration) === null || _l === void 0 ? void 0 : _l.loggerWarn) {
                        (_m = _this.debugConfiguration) === null || _m === void 0 ? void 0 : _m.loggerWarn("Number of reports removed: " + removeCount + ". Actual reports: " + _this.reportsStorage.getReportsCount());
                    }
                }
                else {
                    if ((_o = _this.debugConfiguration) === null || _o === void 0 ? void 0 : _o.loggerError) {
                        (_p = _this.debugConfiguration) === null || _p === void 0 ? void 0 : _p.loggerError("Failed to remove " + removeCount + " reports. Existing reports: " + _this.reportsStorage.getReportsCount());
                    }
                }
            }
        };
        this.validateSequence = function () {
            // 9007199254740991 = (Math.pow(2, 53) - 1)
            if (_this.sequence === 9007199254740991 - 1) {
                _this.sequence = 0;
            }
        };
        this.clientPrincipal = clientPrincipal;
        this.configuration = Configuration_1.ConfigurationUtil.makeConfiguration(initialConfiguration);
        this.debugConfiguration = debugConfiguration;
        var storeNamespace = "ug-ic" + apiKey + "." + this.clientPrincipal.toText() + ".reportsStorage";
        this.reportsStorage = new ReportsStorage_1.ReportsStorage(KeyValueStoreFacade_1.KeyValueStoreFacade.createStore(storeNamespace));
        this.sequence = this.reportsStorage.getMaxSequence();
        this.validateSequence();
        if ((_a = this.debugConfiguration) === null || _a === void 0 ? void 0 : _a.loggerLog) {
            (_b = this.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerLog("ReportStorage created", {
                storeNamespace: storeNamespace,
                sequence: this.sequence,
                reportsCount: this.reportsStorage.getReportsCount()
            });
        }
        (0, utils_1.log)("ReportStorage created with namespace \"" + storeNamespace + "\", sequence = " + this.sequence + ", unsent reports in storage = " + this.reportsStorage.getReportsCount());
    }
    Tracker.prototype.hasUnsentPackets = function () {
        return this.reportsStorage.getReportsCount() > 0;
    };
    Tracker.prototype.upload = function (analyticsReceiverApiResult, sessionAlreadyTracked, apiParameters, force) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (analyticsReceiverApiResult) {
                        if (analyticsReceiverApiResult.analyticsStoreNotified && !sessionAlreadyTracked) {
                            //for the first time ever user is registered in clientRegistry - it means that there is one extra session report which must be removed
                            //implement it later...
                        }
                        if (!this.uploader) {
                            this.uploader = new Uploader_1.UploaderImpl(analyticsReceiverApiResult.analyticsReceiverApiView, apiParameters);
                        }
                        this.proceedToUpload(force);
                        return [2 /*return*/, (0, utils_1.createOkResult)("ok")];
                    }
                    (0, utils_1.warn)("Tracker.upload: analyticsReceiverApiResult is undefined. upload skipped");
                    return [2 /*return*/, (0, utils_1.createErrResult)(new Error("AnalyticsStore unavailable."))];
                }
                catch (e) {
                    (0, utils_1.warn)("Tracker.upload", e);
                    return [2 /*return*/, (0, utils_1.createErrResult)(e)];
                }
                return [2 /*return*/];
            });
        });
    };
    Tracker.prototype.proceedToUpload = function (force) {
        var reportsCount = this.reportsStorage.getReportsCount();
        if (reportsCount > 0) {
            if (force) {
                window.clearTimeout(this.scheduleUploadTimer);
                this.scheduleUpload = false;
            }
            if (force || reportsCount >= this.configuration.uploadReportsCount) {
                // noinspection JSIgnoredPromiseFromCall
                this.uploadReports();
            }
            else {
                this.scheduleUploadReports();
            }
        }
    };
    Tracker.prototype.uploadReports = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var limit, reports, uploadReportsData, uploadEventPacketResult, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.destroyed) {
                            (0, utils_1.warn)("Tracker: uploadReports skipped - destroyed");
                            return [2 /*return*/];
                        }
                        if (this.uploading) {
                            return [2 /*return*/];
                        }
                        this.uploading = true;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        limit = this.configuration.uploadReportsCount;
                        reports = this.reportsStorage.getReports(limit);
                        uploadReportsData = this.buildUploadEventPacket(reports);
                        if (!uploadReportsData) return [3 /*break*/, 3];
                        if ((_a = this.debugConfiguration) === null || _a === void 0 ? void 0 : _a.loggerLog) {
                            (_b = this.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerLog("Will send packet", utils_1.UsergeekUtils.jsonStringifyWithBigInt({ packet: uploadReportsData }));
                        }
                        return [4 /*yield*/, this.uploader.uploadEventPacket(uploadReportsData.packet)];
                    case 2:
                        uploadEventPacketResult = _c.sent();
                        this.handleUploadReportsResult(uploadEventPacketResult, uploadReportsData.maxSequence);
                        return [3 /*break*/, 4];
                    case 3:
                        this.uploading = false;
                        _c.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_1 = _c.sent();
                        this.uploading = false;
                        this.scheduleUploadReports();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Tracker.prototype.handleUploadReportsResult = function (uploadEventPacketResult, maxSequence) {
        var _a, _b, _c, _d;
        this.uploading = false;
        if ((0, utils_1.isOk)(uploadEventPacketResult)) {
            this.reportsStorage.removeEarlyReports(maxSequence);
            if ((_a = this.debugConfiguration) === null || _a === void 0 ? void 0 : _a.loggerLog) {
                (_b = this.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerLog("Packet sent");
            }
            // noinspection JSIgnoredPromiseFromCall
            this.uploadReports();
        }
        else {
            if ((_c = this.debugConfiguration) === null || _c === void 0 ? void 0 : _c.loggerWarn) {
                (_d = this.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerWarn("Packet send failed", utils_1.UsergeekUtils.jsonStringifyWithBigInt({ result: uploadEventPacketResult }));
            }
            this.scheduleUploadReports();
        }
    };
    Tracker.prototype.scheduleUploadReports = function () {
        if (this.destroyed) {
            (0, utils_1.warn)("Tracker: scheduleUploadReports skipped - destroyed");
            return;
        }
        if (this.scheduleUpload) {
            return;
        }
        else {
            this.scheduleUpload = true;
        }
        window.clearTimeout(this.scheduleUploadTimer);
        var delay = this.configuration.uploadReportsPeriod;
        this.scheduleUploadTimer = window.setTimeout(this.uploadReportsDelayed.bind(this), delay);
    };
    Tracker.prototype.uploadReportsDelayed = function () {
        this.scheduleUpload = false;
        // noinspection JSIgnoredPromiseFromCall
        this.uploadReports();
    };
    Tracker.prototype.buildUploadEventPacket = function (reports) {
        if (reports.length > 0) {
            var maxSequence_1 = 0;
            var items = reports.map(function (report) {
                maxSequence_1 = Math.max(report.sequence, maxSequence_1);
                if ((0, utils_1.hasOwnProperty)(report.content, "event")) {
                    var event_1 = {
                        name: report.content.event.name,
                        sequence: BigInt(report.sequence),
                        timeMillis: BigInt(report.timeMillis)
                    };
                    var packetItem = {
                        event: event_1
                    };
                    return packetItem;
                }
                else if ((0, utils_1.hasOwnProperty)(report.content, "session")) {
                    var session = {
                        sequence: BigInt(report.sequence),
                        timeMillis: BigInt(report.timeMillis)
                    };
                    var packetItem = {
                        session: session
                    };
                    return packetItem;
                }
            });
            var packet = {
                items: items
            };
            return {
                packet: packet,
                maxSequence: maxSequence_1
            };
        }
        return undefined;
    };
    Tracker.prototype.validateReport = function (report) {
        var _a, _b;
        if ((0, utils_1.hasOwnProperty)(report, "event")) {
            var error = null;
            var eventName = report.event.name;
            if (utils_1.UsergeekUtils.isStringEmpty(eventName)) {
                error = "empty";
            }
            else if (utils_1.UsergeekUtils.getSize(eventName) > EVENT_NAME_MAX_SIZE) {
                error = "tooLong";
            }
            if (error) {
                if ((_a = this.debugConfiguration) === null || _a === void 0 ? void 0 : _a.loggerError) {
                    (_b = this.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerError("Failed to send event!", { event: report.event, error: error });
                }
                return false;
            }
        }
        return true;
    };
    return Tracker;
}());
exports.Tracker = Tracker;
//# sourceMappingURL=Tracker.js.map