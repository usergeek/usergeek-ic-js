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
exports.getTimeout = exports.APIService = exports.ANALYTICS_STORE_RETRIES = exports.CLIENT_REGISTRY_RETRIES = exports.COORDINATOR_RETRIES = exports.timeoutBetweenRetriesSec = void 0;
var CoordinatorAPI_1 = require("./CoordinatorAPI");
var ClientRegistryApi_1 = require("./ClientRegistryApi");
var utils_1 = require("./utils");
var AnalyticsStoreApi_1 = require("./AnalyticsStoreApi");
exports.timeoutBetweenRetriesSec = 2;
var GLOBAL_RETRIES = 20;
exports.COORDINATOR_RETRIES = 20;
exports.CLIENT_REGISTRY_RETRIES = 20;
exports.ANALYTICS_STORE_RETRIES = 20;
var APIService = /** @class */ (function () {
    function APIService() {
        var _this = this;
        this.destroyed = false;
        this.destroy = function () {
            var _a, _b, _c;
            _this.destroyed = true;
            (_a = _this.coordinatorApi) === null || _a === void 0 ? void 0 : _a.destroy();
            _this.coordinatorApi = undefined;
            (_b = _this.clientRegistryApi) === null || _b === void 0 ? void 0 : _b.destroy();
            _this.clientRegistryApi = undefined;
            (_c = _this.analyticsStoreApi) === null || _c === void 0 ? void 0 : _c.destroy();
            _this.analyticsStoreApi = undefined;
            (0, utils_1.warn)("APIService: destroyed");
        };
    }
    APIService.prototype.getAnalyticsReceiverApi = function (apiParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var result, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getAnalyticsReceiverApiRecursively(apiParameters, GLOBAL_RETRIES)];
                    case 1:
                        result = _a.sent();
                        (0, utils_1.log)("APIService.getAnalyticsReceiverApi: getAnalyticsReceiverApiRecursively() result", result);
                        return [2 /*return*/, result];
                    case 2:
                        e_1 = _a.sent();
                        (0, utils_1.warn)("APIService.getAnalyticsReceiverApi getAnalyticsReceiverApiRecursively() error", e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    APIService.prototype.getAnalyticsReceiverApiRecursively = function (apiParameters, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorResponse, okResponse, clientRegistryPrincipal, clientRegistryApiParameters, clientRegistryResponse, analyticsReceiverView, analyticsStoreApiParameters, analyticsReceiverApiResult, analyticsReceiverApiView, _a, timeout, analyticsReceiverView, analyticsStoreApiParameters, analyticsReceiverApiResult, analyticsReceiverApiView;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.coordinatorApi) {
                            this.coordinatorApi = new CoordinatorAPI_1.CoordinatorApi();
                        }
                        return [4 /*yield*/, this.coordinatorApi.callCoordinatorRecursively(apiParameters, exports.COORDINATOR_RETRIES)];
                    case 1:
                        coordinatorResponse = _b.sent();
                        (0, utils_1.log)("APIService.getAnalyticsReceiverApiRecursively.CoordinatorApi.callCoordinatorRecursively", coordinatorResponse);
                        if (!!this.destroyed) return [3 /*break*/, 17];
                        if (!(0, utils_1.isOk)(coordinatorResponse)) return [3 /*break*/, 16];
                        okResponse = coordinatorResponse.ok;
                        if (!(0, CoordinatorAPI_1.isClientRegistry)(okResponse)) return [3 /*break*/, 14];
                        clientRegistryPrincipal = okResponse.clientRegistry.canisterPrincipal;
                        clientRegistryApiParameters = __assign(__assign({}, apiParameters), { clientRegistryPrincipal: clientRegistryPrincipal });
                        if (!this.clientRegistryApi) {
                            this.clientRegistryApi = new ClientRegistryApi_1.ClientRegistryApi();
                        }
                        return [4 /*yield*/, this.clientRegistryApi.callClientRegistryRecursively(clientRegistryApiParameters, exports.CLIENT_REGISTRY_RETRIES)];
                    case 2:
                        clientRegistryResponse = _b.sent();
                        (0, utils_1.log)("APIService.getAnalyticsReceiverApiRecursively.ClientRegistryApi.callClientRegistryRecursively", clientRegistryResponse);
                        if (!!this.destroyed) return [3 /*break*/, 12];
                        if (!(0, utils_1.isOk)(clientRegistryResponse)) return [3 /*break*/, 4];
                        analyticsReceiverView = clientRegistryResponse.ok;
                        analyticsStoreApiParameters = __assign(__assign({}, apiParameters), { canisterPrincipal: analyticsReceiverView.analyticsReceiverView.canisterPrincipal, accessToken: analyticsReceiverView.analyticsReceiverView.accessToken });
                        if (!this.analyticsStoreApi) {
                            this.analyticsStoreApi = new AnalyticsStoreApi_1.AnalyticsStoreApi();
                        }
                        return [4 /*yield*/, this.analyticsStoreApi.getAnalyticsReceiverApiRecursively(analyticsStoreApiParameters, exports.ANALYTICS_STORE_RETRIES)];
                    case 3:
                        analyticsReceiverApiResult = _b.sent();
                        (0, utils_1.log)("APIService.getAnalyticsReceiverApiRecursively.AnalyticsStoreApi.getAnalyticsReceiverApiRecursively", analyticsReceiverApiResult);
                        if (!this.destroyed) {
                            if ((0, utils_1.isOk)(analyticsReceiverApiResult)) {
                                analyticsReceiverApiView = analyticsReceiverApiResult.ok;
                                return [2 /*return*/, (0, utils_1.createOkResult)({
                                        analyticsReceiverApiView: analyticsReceiverApiView,
                                        analyticsStoreNotified: analyticsReceiverView.analyticsStoreNotified
                                    })];
                            }
                        }
                        else {
                            (0, utils_1.warn)("APIService: analyticsStoreApi.getAnalyticsReceiverApiRecursively() result skipped - destroyed");
                        }
                        return [3 /*break*/, 11];
                    case 4:
                        if (!(0, utils_1.isErr)(clientRegistryResponse)) return [3 /*break*/, 11];
                        _a = clientRegistryResponse.err;
                        switch (_a) {
                            case "restart": return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 10];
                    case 5:
                        if (!!this.destroyed) return [3 /*break*/, 8];
                        timeout = (0, exports.getTimeout)(GLOBAL_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this.getAnalyticsReceiverApiRecursively(apiParameters, retriesLeft - 1)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8:
                        (0, utils_1.warn)("APIService: getAnalyticsReceiverApiRecursively skipped - destroyed");
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        {
                            return [2 /*return*/, clientRegistryResponse];
                        }
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        (0, utils_1.warn)("APIService: clientRegistryApi.callClientRegistryRecursively() result skipped - destroyed");
                        _b.label = 13;
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        if (!(0, CoordinatorAPI_1.isAnalyticsReceiver)(okResponse)) return [3 /*break*/, 16];
                        analyticsReceiverView = okResponse.analyticsReceiver.view;
                        analyticsStoreApiParameters = __assign(__assign({}, apiParameters), { canisterPrincipal: analyticsReceiverView.canisterPrincipal, accessToken: analyticsReceiverView.accessToken });
                        if (!this.analyticsStoreApi) {
                            this.analyticsStoreApi = new AnalyticsStoreApi_1.AnalyticsStoreApi();
                        }
                        return [4 /*yield*/, this.analyticsStoreApi.getAnalyticsReceiverApiRecursively(analyticsStoreApiParameters, exports.ANALYTICS_STORE_RETRIES)];
                    case 15:
                        analyticsReceiverApiResult = _b.sent();
                        (0, utils_1.log)("APIService.getAnalyticsReceiverApiRecursively.AnalyticsStoreApi.getAnalyticsReceiverApiRecursively", analyticsReceiverApiResult);
                        if (!this.destroyed) {
                            if ((0, utils_1.isOk)(analyticsReceiverApiResult)) {
                                analyticsReceiverApiView = analyticsReceiverApiResult.ok;
                                return [2 /*return*/, (0, utils_1.createOkResult)({
                                        analyticsReceiverApiView: analyticsReceiverApiView,
                                        analyticsStoreNotified: false
                                    })];
                            }
                        }
                        else {
                            (0, utils_1.warn)("APIService: analyticsStoreApi.getAnalyticsReceiverApiRecursively() result skipped - destroyed");
                        }
                        _b.label = 16;
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        (0, utils_1.warn)("APIService: coordinatorApi.callCoordinatorRecursively() result skipped - destroyed");
                        _b.label = 18;
                    case 18: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    return APIService;
}());
exports.APIService = APIService;
var getTimeout = function (retryIndex) {
    return Math.max(exports.timeoutBetweenRetriesSec, Math.pow(exports.timeoutBetweenRetriesSec, retryIndex + 1)) * 1000;
};
exports.getTimeout = getTimeout;
//# sourceMappingURL=APIService.js.map