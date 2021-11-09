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
exports.getTimeout = exports.SessionFacade = exports.timeoutBetweenRetriesSec = void 0;
var CoordinatorService_1 = require("./CoordinatorService");
var ClientRegistryService_1 = require("./ClientRegistryService");
var utils_1 = require("./utils");
var AnalyticsStoreService_1 = require("./AnalyticsStoreService");
exports.timeoutBetweenRetriesSec = 2;
var sdkVersion = 1;
var GLOBAL_RETRIES = 20;
var COORDINATOR_RETRIES = 20;
var CLIENT_REGISTRY_RETRIES = 20;
var ANALYTICS_STORE_RETRIES = 20;
var SessionFacade = /** @class */ (function () {
    function SessionFacade(sessionContext) {
        this.sessionContext = sessionContext;
    }
    SessionFacade.prototype.trackSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.recursiveCall(sdkVersion, GLOBAL_RETRIES)];
                    case 1:
                        result = _a.sent();
                        (0, utils_1.log)("trackSession():", result);
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        (0, utils_1.warn)("sessionFacade.trackSession", e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SessionFacade.prototype.recursiveCall = function (sdkVersion, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorResponse, proceedResponse, clientRegistryPrincipal, clientRegistryResponse, analyticsReceiverView, canisterPrincipal, accessToken, analyticsStoreResponse, _a, timeout, analyticsReceiverView, canisterPrincipal, accessToken, analyticsStoreResponse;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.recursiveCallCoordinator(sdkVersion, COORDINATOR_RETRIES)];
                    case 1:
                        coordinatorResponse = _b.sent();
                        (0, utils_1.log)("recursive.callCoordinator", coordinatorResponse);
                        if (!(0, utils_1.isOk)(coordinatorResponse)) return [3 /*break*/, 2];
                        //registered in coordinator
                        return [2 /*return*/, coordinatorResponse.ok];
                    case 2:
                        if (!(0, utils_1.isProceed)(coordinatorResponse)) return [3 /*break*/, 15];
                        proceedResponse = coordinatorResponse.proceed;
                        if (!(0, CoordinatorService_1.isProceedToClientRegistry)(proceedResponse)) return [3 /*break*/, 13];
                        clientRegistryPrincipal = proceedResponse.clientRegistry.canisterPrincipal;
                        return [4 /*yield*/, this.recursiveCallClientRegistry(sdkVersion, clientRegistryPrincipal, CLIENT_REGISTRY_RETRIES)];
                    case 3:
                        clientRegistryResponse = _b.sent();
                        (0, utils_1.log)("recursive.callClientRegistry", clientRegistryResponse);
                        if (!(0, utils_1.isProceed)(clientRegistryResponse)) return [3 /*break*/, 6];
                        analyticsReceiverView = clientRegistryResponse.proceed;
                        if (!analyticsReceiverView) return [3 /*break*/, 5];
                        canisterPrincipal = analyticsReceiverView.canisterPrincipal, accessToken = analyticsReceiverView.accessToken;
                        return [4 /*yield*/, this.recursiveCallAnalyticsStore(sdkVersion, canisterPrincipal, accessToken, ANALYTICS_STORE_RETRIES)];
                    case 4:
                        analyticsStoreResponse = _b.sent();
                        (0, utils_1.log)("recursive.callAnalyticsStore", analyticsStoreResponse);
                        return [2 /*return*/, analyticsStoreResponse];
                    case 5: return [2 /*return*/, clientRegistryResponse];
                    case 6:
                        if (!(0, utils_1.isOk)(clientRegistryResponse)) return [3 /*break*/, 7];
                        return [2 /*return*/, clientRegistryResponse];
                    case 7:
                        if (!(0, utils_1.isErr)(clientRegistryResponse)) return [3 /*break*/, 12];
                        _a = clientRegistryResponse.err;
                        switch (_a) {
                            case "restart": return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 11];
                    case 8:
                        timeout = (0, exports.getTimeout)(GLOBAL_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, this.recursiveCall(sdkVersion, retriesLeft - 1)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11:
                        {
                            return [2 /*return*/, clientRegistryResponse];
                        }
                        _b.label = 12;
                    case 12: return [3 /*break*/, 15];
                    case 13:
                        if (!(0, CoordinatorService_1.isProceedToAnalyticsReceiver)(proceedResponse)) return [3 /*break*/, 15];
                        analyticsReceiverView = proceedResponse.analyticsReceiver.view;
                        if (!analyticsReceiverView) return [3 /*break*/, 15];
                        canisterPrincipal = analyticsReceiverView.canisterPrincipal, accessToken = analyticsReceiverView.accessToken;
                        return [4 /*yield*/, this.recursiveCallAnalyticsStore(sdkVersion, canisterPrincipal, accessToken, ANALYTICS_STORE_RETRIES)];
                    case 14:
                        analyticsStoreResponse = _b.sent();
                        (0, utils_1.log)("recursive.callAnalyticsStore", analyticsStoreResponse);
                        return [2 /*return*/, analyticsStoreResponse];
                    case 15: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    SessionFacade.prototype.recursiveCallCoordinator = function (sdkVersion, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorResponse, _a, timeout, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, CoordinatorService_1.getResult)(sdkVersion, this.sessionContext)];
                    case 1:
                        coordinatorResponse = _b.sent();
                        (0, utils_1.log)("getResult.coordinator", coordinatorResponse, { retriesLeft: retriesLeft });
                        if (!(0, utils_1.isOk)(coordinatorResponse)) return [3 /*break*/, 2];
                        return [2 /*return*/, coordinatorResponse];
                    case 2:
                        if (!(0, utils_1.isProceed)(coordinatorResponse)) return [3 /*break*/, 3];
                        return [2 /*return*/, coordinatorResponse];
                    case 3:
                        if (!(0, utils_1.isErr)(coordinatorResponse)) return [3 /*break*/, 10];
                        _a = coordinatorResponse.err;
                        switch (_a) {
                            case "changeTopology": return [3 /*break*/, 4];
                            case "retry": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 9];
                    case 4:
                        timeout = (0, exports.getTimeout)(COORDINATOR_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.recursiveCallCoordinator(sdkVersion, retriesLeft - 1)];
                    case 6:
                        if (!(retriesLeft > 0)) return [3 /*break*/, 8];
                        timeout = (0, exports.getTimeout)(COORDINATOR_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, this.recursiveCallCoordinator(sdkVersion, retriesLeft - 1)];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        {
                        }
                        _b.label = 10;
                    case 10: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    SessionFacade.prototype.recursiveCallClientRegistry = function (sdkVersion, clientRegistryPrincipal, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var clientRegistryResponse, _a, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, ClientRegistryService_1.getResult)(sdkVersion, this.sessionContext, clientRegistryPrincipal)];
                    case 1:
                        clientRegistryResponse = _b.sent();
                        (0, utils_1.log)("getResult.clientRegistry", clientRegistryResponse, { retriesLeft: retriesLeft });
                        if (!(0, utils_1.isProceed)(clientRegistryResponse)) return [3 /*break*/, 2];
                        return [2 /*return*/, clientRegistryResponse];
                    case 2:
                        if (!(0, utils_1.isOk)(clientRegistryResponse)) return [3 /*break*/, 3];
                        return [2 /*return*/, clientRegistryResponse];
                    case 3:
                        if (!(0, utils_1.isErr)(clientRegistryResponse)) return [3 /*break*/, 9];
                        _a = clientRegistryResponse.err;
                        switch (_a) {
                            case "retry": return [3 /*break*/, 4];
                            case "restart": return [3 /*break*/, 7];
                        }
                        return [3 /*break*/, 8];
                    case 4:
                        if (!(retriesLeft > 0)) return [3 /*break*/, 6];
                        timeout = (0, exports.getTimeout)(CLIENT_REGISTRY_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.recursiveCallClientRegistry(sdkVersion, clientRegistryPrincipal, retriesLeft - 1)];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        {
                            return [2 /*return*/, (0, utils_1.createErrRestart)()];
                        }
                        _b.label = 8;
                    case 8:
                        {
                            return [3 /*break*/, 9];
                        }
                        _b.label = 9;
                    case 9: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    SessionFacade.prototype.recursiveCallAnalyticsStore = function (sdkVersion, canisterPrincipal, accessToken, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var analyticsStoreResponse, _a, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, AnalyticsStoreService_1.getResult)(sdkVersion, this.sessionContext, canisterPrincipal, accessToken)];
                    case 1:
                        analyticsStoreResponse = _b.sent();
                        (0, utils_1.log)("getResult.analyticsStore", analyticsStoreResponse, { retriesLeft: retriesLeft });
                        if (!(0, utils_1.isOk)(analyticsStoreResponse)) return [3 /*break*/, 2];
                        return [2 /*return*/, analyticsStoreResponse];
                    case 2:
                        if (!(0, utils_1.isErr)(analyticsStoreResponse)) return [3 /*break*/, 7];
                        _a = analyticsStoreResponse.err;
                        switch (_a) {
                            case "retry": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(retriesLeft > 0)) return [3 /*break*/, 5];
                        timeout = (0, exports.getTimeout)(ANALYTICS_STORE_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 4:
                        _b.sent();
                        return [2 /*return*/, this.recursiveCallAnalyticsStore(sdkVersion, canisterPrincipal, accessToken, retriesLeft - 1)];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        {
                            return [3 /*break*/, 7];
                        }
                        _b.label = 7;
                    case 7: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    return SessionFacade;
}());
exports.SessionFacade = SessionFacade;
var getTimeout = function (retryIndex) {
    return Math.max(exports.timeoutBetweenRetriesSec, Math.pow(exports.timeoutBetweenRetriesSec, retryIndex + 1)) * 1000;
};
exports.getTimeout = getTimeout;
//# sourceMappingURL=SessionFacade.js.map