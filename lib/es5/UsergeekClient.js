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
exports.UsergeekClient = void 0;
var PageVisibilityTracker_1 = require("./pageVisibility/PageVisibilityTracker");
var APIService_1 = require("./APIService");
var utils_1 = require("./utils");
var Tracker_1 = require("./tracker/Tracker");
var sdkVersion = 1;
var UsergeekClient = /** @class */ (function () {
    function UsergeekClient() {
        var _this = this;
        this.sessionAlreadyTracked = false;
        this.init = function (config) {
            _this.destroy();
            _this.config = config;
            try {
                (0, utils_1.log)("Usergeek: initialized with config: " + JSON.stringify(config));
            }
            catch (e) {
            }
        };
        this.setPrincipal = function (principal) {
            var _a, _b, _c, _d;
            try {
                _this.validateConfig();
                _this.destroy();
                _this.clientPrincipal = principal;
                _this.tryToUploadPendingPackets();
            }
            catch (e) {
                if ((_b = (_a = _this.config) === null || _a === void 0 ? void 0 : _a.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerError) {
                    (_d = (_c = _this.config) === null || _c === void 0 ? void 0 : _c.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerError("Please pass valid Principal", { principal: principal });
                }
                (0, utils_1.warn)("UsergeekClient.setPrincipal", e);
            }
        };
        this.trackSession = function () {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var e_1;
                var _this = this;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 2, , 3]);
                            this.validateAndPrepareEventTracker();
                            this.tracker.logSession();
                            if (!this.pageVisibilityTracker) {
                                this.pageVisibilityTracker = new PageVisibilityTracker_1.PageVisibilityTracker();
                                this.pageVisibilityTracker.start(function () {
                                    // noinspection JSIgnoredPromiseFromCall
                                    _this.trackSession();
                                });
                            }
                            return [4 /*yield*/, this.waitForAnalyticsReceiverApiReadyAndUpload(true, true)];
                        case 1:
                            _e.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_1 = _e.sent();
                            if ((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerError) {
                                (_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerError("UsergeekClient.trackSession", e_1);
                            }
                            (0, utils_1.warn)("UsergeekClient.trackSession", e_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })();
        };
        this.trackEvent = function (eventName) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var e_2;
                var _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 2, , 3]);
                            this.validateAndPrepareEventTracker();
                            this.tracker.logEvent(eventName);
                            return [4 /*yield*/, this.waitForAnalyticsReceiverApiReadyAndUpload(false, false)];
                        case 1:
                            _e.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_2 = _e.sent();
                            if ((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerError) {
                                (_d = (_c = this.config) === null || _c === void 0 ? void 0 : _c.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerError("UsergeekClient.trackEvent", e_2);
                            }
                            (0, utils_1.warn)("UsergeekClient.trackEvent", e_2);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })();
        };
        this.flush = function () {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            this.validateAndPrepareEventTracker();
                            return [4 /*yield*/, this.waitForAnalyticsReceiverApiReadyAndUpload(true, false)];
                        case 1:
                            _a.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            e_3 = _a.sent();
                            (0, utils_1.warn)("UsergeekClient.flush", e_3);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })();
        };
        this.validateAndPrepareEventTracker = function () {
            validateApiParameters(_this.config.apiKey, _this.clientPrincipal);
            _this.askForAnalyticsReceiverApi();
            if (!_this.tracker) {
                _this.tracker = new Tracker_1.Tracker(_this.config.apiKey, _this.clientPrincipal, _this.config.eventTrackerConfiguration, _this.config.debugConfiguration);
            }
        };
        this.waitForAnalyticsReceiverApiReadyAndUpload = function (flush, markSessionAsTracked) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.onAnalyticsReceiverApiReady(function (analyticsReceiverApiResult) {
                            if (analyticsReceiverApiResult) {
                                var apiParameters = {
                                    apiKey: _this.config.apiKey,
                                    clientPrincipal: _this.clientPrincipal,
                                    host: _this.config.host,
                                    sdkVersion: sdkVersion,
                                };
                                if (_this.tracker) {
                                    var promise = _this.tracker.upload(analyticsReceiverApiResult, _this.sessionAlreadyTracked, apiParameters, flush);
                                    if (markSessionAsTracked) {
                                        _this.sessionAlreadyTracked = true;
                                    }
                                    return promise;
                                }
                            }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.tryToUploadPendingPackets = function () {
            var _a, _b, _c, _d, _e;
            var apiParametersValid = isApiKeyValid(_this.config.apiKey) && isClientPrincipalValid(_this.clientPrincipal);
            if (apiParametersValid) {
                // api parameters valid
                // if EventsTracker does not exist OR clientPrincipal changed...
                // ...it is possible to try to upload pending custom events
                if (!_this.tracker || !_this.tracker.isClientPrincipalEqual(_this.clientPrincipal)) {
                    _this.tracker = new Tracker_1.Tracker(_this.config.apiKey, _this.clientPrincipal, _this.config.eventTrackerConfiguration, _this.config.debugConfiguration);
                    if (_this.tracker.hasUnsentPackets()) {
                        // ...try to prefetch AnalyticsReceiverApi in case is it not exist
                        _this.askForAnalyticsReceiverApi();
                        // noinspection JSIgnoredPromiseFromCall
                        _this.waitForAnalyticsReceiverApiReadyAndUpload(true, false);
                    }
                }
            }
            else {
                if ((_b = (_a = _this.config) === null || _a === void 0 ? void 0 : _a.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerWarn) {
                    (_d = (_c = _this.config) === null || _c === void 0 ? void 0 : _c.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerWarn("Please pass valid apiKey and non anonymous Principal.");
                }
                (0, utils_1.warn)("UsergeekClient.tryToUploadPendingPackets: Please pass valid apiKey and non anonymous Principal.", { apiKey: (_e = _this.config) === null || _e === void 0 ? void 0 : _e.apiKey, clientPrincipal: _this.clientPrincipal });
            }
        };
        this.onAnalyticsReceiverApiReady = function (promise) {
            return _this.analyticsReceiverApiPromise.then(promise);
        };
        this.askForAnalyticsReceiverApi = function () {
            if (!_this.analyticsReceiverApiPromise) {
                _this.analyticsReceiverApiPromise = Promise.resolve().then(_this.getAnalyticsReceiverApi);
            }
        };
        this.getAnalyticsReceiverApi = function () { return __awaiter(_this, void 0, void 0, function () {
            var apiParameters, getAnalyticsReceiverApiResult, e_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        apiParameters = {
                            apiKey: this.config.apiKey,
                            clientPrincipal: this.clientPrincipal,
                            host: this.config.host,
                            sdkVersion: sdkVersion
                        };
                        if (!this.apiService) {
                            this.apiService = new APIService_1.APIService();
                        }
                        return [4 /*yield*/, this.apiService.getAnalyticsReceiverApi(apiParameters)];
                    case 1:
                        getAnalyticsReceiverApiResult = _a.sent();
                        if ((0, utils_1.isOk)(getAnalyticsReceiverApiResult)) {
                            return [2 /*return*/, getAnalyticsReceiverApiResult.ok];
                        }
                        return [2 /*return*/, undefined];
                    case 2:
                        e_4 = _a.sent();
                        (0, utils_1.warn)("UsergeekClient.getAnalyticsReceiverApi", e_4);
                        return [2 /*return*/, undefined];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.validateConfig = function () {
            if (_this.config == undefined) {
                throw "UsergeekClient: Please initialize Usergeek first!";
            }
        };
        this.destroy = function () {
            var _a, _b, _c, _d;
            if (_this.apiService) {
                _this.apiService.destroy();
                _this.apiService = undefined;
            }
            if (_this.tracker) {
                //destroy existing tracker if principal cleared
                _this.tracker.destroy();
                _this.tracker = undefined;
                if ((_b = (_a = _this.config) === null || _a === void 0 ? void 0 : _a.debugConfiguration) === null || _b === void 0 ? void 0 : _b.loggerWarn) {
                    (_d = (_c = _this.config) === null || _c === void 0 ? void 0 : _c.debugConfiguration) === null || _d === void 0 ? void 0 : _d.loggerWarn("Existing Tracker destroyed", { clientPrincipal: _this.clientPrincipal });
                }
                (0, utils_1.warn)("UsergeekClient.setPrincipal: existing Tracker destroyed", { clientPrincipal: _this.clientPrincipal });
            }
            _this.analyticsReceiverApiPromise = undefined;
            _this.sessionAlreadyTracked = false;
        };
    }
    return UsergeekClient;
}());
exports.UsergeekClient = UsergeekClient;
var validateApiParameters = function (apiKey, clientPrincipal) {
    if (!isApiKeyValid(apiKey)) {
        throw "Usergeek: ApiKey should be not empty string";
    }
    if (!isClientPrincipalValid(clientPrincipal)) {
        throw "Usergeek: anonymous Principal cannot be tracked";
    }
};
var isApiKeyValid = function (apiKey) { return typeof apiKey == "string" && apiKey.length > 0; };
var isClientPrincipalValid = function (clientPrincipal) { return clientPrincipal && !clientPrincipal.isAnonymous(); };
//# sourceMappingURL=UsergeekClient.js.map