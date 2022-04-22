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
exports.AnalyticsStoreApi = void 0;
var analyticsStore_1 = require("./canisters/analyticsStore");
var utils_1 = require("./utils");
var agent_1 = require("@dfinity/agent");
var APIService_1 = require("./APIService");
var AnalyticsStoreApi = /** @class */ (function () {
    function AnalyticsStoreApi() {
        var _this = this;
        this.destroyed = false;
        this.destroy = function () {
            _this.destroyed = true;
            (0, utils_1.warn)("AnalyticsStoreApi: destroyed");
        };
        this.sendPacket = function (parameters) { return __awaiter(_this, void 0, void 0, function () {
            var actor, validatePacketResponse, validate_rejectedItems_1, collectPacketResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actor = (0, analyticsStore_1.createCanisterActor)(parameters.canisterPrincipal.toText(), new agent_1.AnonymousIdentity(), parameters.host);
                        return [4 /*yield*/, this.validatePacket(actor, parameters)];
                    case 1:
                        validatePacketResponse = _a.sent();
                        (0, utils_1.log)("AnalyticsStoreApi.sendPacket validatePacket", validatePacketResponse);
                        if (!(0, utils_1.isOk)(validatePacketResponse)) return [3 /*break*/, 5];
                        validate_rejectedItems_1 = validatePacketResponse.ok;
                        if (validate_rejectedItems_1.length > 0) {
                            //remove bad items from packet based on validation result
                            parameters.packet.items = parameters.packet.items.filter(function (item) {
                                var isBadItem = validate_rejectedItems_1.some(function (rejectedItem) {
                                    if ((0, utils_1.hasOwnProperty)(item, "event")) {
                                        return rejectedItem.sequence == item.event.sequence;
                                    }
                                    else if ((0, utils_1.hasOwnProperty)(item, "session")) {
                                        return rejectedItem.sequence == item.session.sequence;
                                    }
                                    //by default
                                    return false;
                                });
                                return !isBadItem;
                            });
                        }
                        if (!(parameters.packet.items.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.collectPacket(actor, parameters)];
                    case 2:
                        collectPacketResponse = _a.sent();
                        (0, utils_1.log)("AnalyticsStoreApi.sendPacket collectPacket", collectPacketResponse);
                        if ((0, utils_1.isOk)(collectPacketResponse)) {
                            return [2 /*return*/, (0, utils_1.createOkResult)(null)];
                        }
                        else if ((0, utils_1.isErr)(collectPacketResponse)) {
                            return [2 /*return*/, collectPacketResponse];
                        }
                        return [3 /*break*/, 4];
                    case 3: 
                    //all event are bad
                    return [2 /*return*/, (0, utils_1.createOkResult)(null)];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        if ((0, utils_1.isErr)(validatePacketResponse)) {
                            return [2 /*return*/, validatePacketResponse];
                        }
                        _a.label = 6;
                    case 6: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        }); };
        this.actor_getAnalyticsReceiverApi = function (actor, parameters) { return __awaiter(_this, void 0, void 0, function () {
            var result, e_1, apiPrincipal, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, actor.getAnalyticsReceiverApi([parameters.clientPrincipal], parameters.sdkVersion, parameters.accessToken)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        (0, utils_1.warn)("AnalyticsStoreApi.getAnalyticsReceiverApi actor.getAnalyticsReceiverApi", e_1);
                        return [2 /*return*/, (0, utils_1.createErrRetry)()];
                    case 3:
                        (0, utils_1.log)("AnalyticsStoreApi.getAnalyticsReceiverApi actor.getAnalyticsReceiverApi", result);
                        if ((0, utils_1.isOk)(result)) {
                            apiPrincipal = AnalyticsStoreApi.getAnalyticsReceiverApiPrincipal(result.ok);
                            return [2 /*return*/, (0, utils_1.createOkResult)({
                                    canisterPrincipal: apiPrincipal,
                                    accessToken: parameters.accessToken
                                })];
                        }
                        else if ((0, utils_1.isErr)(result)) {
                            error = result.err;
                            if ((0, utils_1.isErrTemporarilyUnavailable)(error)) {
                                return [2 /*return*/, (0, utils_1.createErrRetry)()];
                            }
                        }
                        return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        }); };
        this.validatePacket = function (actor, parameters) { return __awaiter(_this, void 0, void 0, function () {
            var result, e_2, rejectedItems, error, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, actor.validatePacket([parameters.clientPrincipal], parameters.sdkVersion, parameters.accessToken, parameters.packet)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_2 = _a.sent();
                        (0, utils_1.warn)("AnalyticsStoreApi.validatePacket actor.validatePacket", e_2);
                        return [2 /*return*/, (0, utils_1.createErrRetry)()];
                    case 3:
                        (0, utils_1.log)("AnalyticsStoreApi.validatePacket actor.validatePacket", result);
                        if ((0, utils_1.isOk)(result)) {
                            rejectedItems = [];
                            if (result.ok.rejectedItems.length == 1) {
                                rejectedItems = result.ok.rejectedItems[0];
                            }
                            return [2 /*return*/, (0, utils_1.createOkResult)(rejectedItems)];
                        }
                        else if ((0, utils_1.isErr)(result)) {
                            error = result.err;
                            if ((0, utils_1.isErrApi)(error)) {
                                apiError = error.api;
                                if ((0, utils_1.isErrTemporarilyUnavailable)(apiError)) {
                                    return [2 /*return*/, (0, utils_1.createErrRetry)()];
                                }
                            }
                        }
                        return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        }); };
        this.collectPacket = function (actor, parameters) { return __awaiter(_this, void 0, void 0, function () {
            var result, e_3, error, apiError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, actor.collectPacket([parameters.clientPrincipal], parameters.sdkVersion, parameters.accessToken, parameters.packet)];
                    case 1:
                        result = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        (0, utils_1.warn)("AnalyticsStoreApi.collectPacket actor.collectPacket", e_3);
                        return [2 /*return*/, (0, utils_1.createErrRetry)()];
                    case 3:
                        (0, utils_1.log)("AnalyticsStoreApi.collectPacket actor.collectPacket", result);
                        if ((0, utils_1.isOk)(result)) {
                            return [2 /*return*/, (0, utils_1.createOkResult)(null)];
                        }
                        else if ((0, utils_1.isErr)(result)) {
                            error = result.err;
                            if ((0, utils_1.isErrApi)(error)) {
                                apiError = error.api;
                                if ((0, utils_1.isErrTemporarilyUnavailable)(apiError)) {
                                    return [2 /*return*/, (0, utils_1.createErrRetry)()];
                                }
                            }
                        }
                        return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        }); };
    }
    AnalyticsStoreApi.prototype.getAnalyticsReceiverApiRecursively = function (parameters, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var getAnalyticsReceiverApiResult, _a, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getAnalyticsReceiverApi(parameters)];
                    case 1:
                        getAnalyticsReceiverApiResult = _b.sent();
                        (0, utils_1.log)("AnalyticsStoreApi.getAnalyticsReceiverApiRecursively.getAnalyticsReceiverApi", getAnalyticsReceiverApiResult, { retriesLeft: retriesLeft });
                        if (!(0, utils_1.isOk)(getAnalyticsReceiverApiResult)) return [3 /*break*/, 2];
                        return [2 /*return*/, getAnalyticsReceiverApiResult];
                    case 2:
                        if (!(0, utils_1.isErr)(getAnalyticsReceiverApiResult)) return [3 /*break*/, 8];
                        _a = getAnalyticsReceiverApiResult.err;
                        switch (_a) {
                            case "retry": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(retriesLeft > 0)) return [3 /*break*/, 6];
                        if (!!this.destroyed) return [3 /*break*/, 5];
                        timeout = (0, APIService_1.getTimeout)(APIService_1.ANALYTICS_STORE_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, this.getAnalyticsReceiverApiRecursively(parameters, retriesLeft - 1)];
                    case 5:
                        (0, utils_1.warn)("AnalyticsStoreApi: getAnalyticsReceiverApiRecursively skipped - destroyed");
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        {
                            return [3 /*break*/, 8];
                        }
                        _b.label = 8;
                    case 8: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    AnalyticsStoreApi.prototype.trackPacketRecursively = function (parameters, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var sendPacketResponse, _a, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.sendPacket(parameters)];
                    case 1:
                        sendPacketResponse = _b.sent();
                        if (!(0, utils_1.isOk)(sendPacketResponse)) return [3 /*break*/, 2];
                        return [2 /*return*/, sendPacketResponse];
                    case 2:
                        if (!(0, utils_1.isErr)(sendPacketResponse)) return [3 /*break*/, 8];
                        _a = sendPacketResponse.err;
                        switch (_a) {
                            case "retry": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(retriesLeft > 0)) return [3 /*break*/, 6];
                        if (!!this.destroyed) return [3 /*break*/, 5];
                        timeout = (0, APIService_1.getTimeout)(APIService_1.ANALYTICS_STORE_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, this.trackPacketRecursively(parameters, retriesLeft - 1)];
                    case 5:
                        (0, utils_1.warn)("AnalyticsStoreApi: trackPacketRecursively skipped - destroyed");
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        {
                            return [3 /*break*/, 8];
                        }
                        _b.label = 8;
                    case 8: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    AnalyticsStoreApi.prototype.getAnalyticsReceiverApi = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var getApiActor, handleGetAnalyticsReceiverApiResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        getApiActor = (0, analyticsStore_1.createCanisterActor)(parameters.canisterPrincipal.toText(), new agent_1.AnonymousIdentity(), parameters.host);
                        return [4 /*yield*/, this.actor_getAnalyticsReceiverApi(getApiActor, parameters)];
                    case 1:
                        handleGetAnalyticsReceiverApiResponse = _a.sent();
                        (0, utils_1.log)("AnalyticsStoreApi.getAnalyticsReceiverApi", handleGetAnalyticsReceiverApiResponse);
                        if ((0, utils_1.isOk)(handleGetAnalyticsReceiverApiResponse)) {
                            return [2 /*return*/, (0, utils_1.createOkResult)(handleGetAnalyticsReceiverApiResponse.ok)];
                        }
                        else if ((0, utils_1.isErr)(handleGetAnalyticsReceiverApiResponse)) {
                            return [2 /*return*/, handleGetAnalyticsReceiverApiResponse];
                        }
                        return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    AnalyticsStoreApi.getAnalyticsReceiverApiPrincipal = function (analyticsReceiverApi) {
        var getAnalyticsReceiverApiData = (0, utils_1.getSharedFunctionData)(analyticsReceiverApi.isCollectRequired);
        if (getAnalyticsReceiverApiData) {
            var principal = getAnalyticsReceiverApiData[0];
            return principal;
        }
        return undefined;
    };
    return AnalyticsStoreApi;
}());
exports.AnalyticsStoreApi = AnalyticsStoreApi;
//# sourceMappingURL=AnalyticsStoreApi.js.map