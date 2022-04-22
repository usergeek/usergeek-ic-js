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
exports.CoordinatorApi = exports.isAnalyticsReceiver = exports.isClientRegistry = void 0;
var agent_1 = require("@dfinity/agent");
var coordinator_1 = require("./canisters/coordinator");
var APIStorage_1 = require("./APIStorage");
var utils_1 = require("./utils");
var ClientRegistryApi_1 = require("./ClientRegistryApi");
var APIService_1 = require("./APIService");
var constants_1 = require("./canisters/constants");
var isClientRegistry = function (obj) {
    return (0, utils_1.hasOwnProperty)(obj, "clientRegistry");
};
exports.isClientRegistry = isClientRegistry;
var isAnalyticsReceiver = function (obj) {
    return (0, utils_1.hasOwnProperty)(obj, "analyticsReceiver");
};
exports.isAnalyticsReceiver = isAnalyticsReceiver;
var currentSessionTopologyId;
var CoordinatorApi = /** @class */ (function () {
    function CoordinatorApi() {
        var _this = this;
        this.destroyed = false;
        this.destroy = function () {
            _this.destroyed = true;
            (0, utils_1.warn)("CoordinatorApi: destroyed");
        };
        this.getResult = function (apiParameters) { return __awaiter(_this, void 0, void 0, function () {
            var canisterIds;
            return __generator(this, function (_a) {
                currentSessionTopologyId = APIStorage_1.APIStorage.coordinator.getTopologyId();
                canisterIds = APIStorage_1.APIStorage.coordinator.getCanisterIds();
                if (canisterIds.length === 0) {
                    canisterIds = Array.from(constants_1.coordinator_canister_ids);
                }
                if (canisterIds.length === 0) {
                    (0, utils_1.warn)("no canisters");
                    return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
                return [2 /*return*/, this.getClientRegistryRecursively(apiParameters, canisterIds)];
            });
        }); };
        this.getClientRegistryRecursively = function (apiParameters, inProgressCanisterIds) { return __awaiter(_this, void 0, void 0, function () {
            var canisterId, result, e_1, clientRegistry, clientRegistryPrincipal, analyticsReceiver, analyticsReceiverView, changeTopology, newTopologyId, newCoordinators, newCanisterIds, i, newCoordinatorData, coordinatorPrincipal, coordinatorMethodName, timeout, updatedInProgressCanisters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        canisterId = CoordinatorApi.getCanisterId(inProgressCanisterIds);
                        (0, utils_1.log)("CoordinatorApi.getClientRegistryRecursively using", { inProgressCanisterIds: inProgressCanisterIds, currentSessionTopologyId: currentSessionTopologyId, canisterId: canisterId });
                        if (!canisterId) return [3 /*break*/, 7];
                        result = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.hello(apiParameters, canisterId)];
                    case 2:
                        result = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        (0, utils_1.warn)("CoordinatorApi.getClientRegistryRecursively actor.hello", e_1);
                        return [2 /*return*/, (0, utils_1.createErrRetry)()];
                    case 4:
                        (0, utils_1.log)("CoordinatorApi.getClientRegistryRecursively actor.hello", result);
                        if ((0, utils_1.hasOwnProperty)(result, "clientRegistry")) {
                            clientRegistry = result.clientRegistry;
                            clientRegistryPrincipal = (0, utils_1.getSharedFunctionDataPrincipal)(clientRegistry.getAnalyticsReceiver);
                            if (clientRegistryPrincipal) {
                                return [2 /*return*/, (0, utils_1.createOkResult)({ clientRegistry: { canisterPrincipal: clientRegistryPrincipal } })];
                            }
                        }
                        else if ((0, utils_1.hasOwnProperty)(result, "analyticsReceiver")) {
                            analyticsReceiver = result.analyticsReceiver;
                            analyticsReceiverView = ClientRegistryApi_1.ClientRegistryApi.getAnalyticsReceiverData(analyticsReceiver);
                            if (analyticsReceiverView) {
                                return [2 /*return*/, (0, utils_1.createOkResult)({ analyticsReceiver: { view: analyticsReceiverView } })];
                            }
                        }
                        else if ((0, utils_1.hasOwnProperty)(result, "changeTopology")) {
                            changeTopology = result.changeTopology;
                            newTopologyId = changeTopology.topologyId;
                            newCoordinators = changeTopology.coordinators;
                            newCanisterIds = [];
                            for (i = 0; i < newCoordinators.length; i++) {
                                newCoordinatorData = (0, utils_1.getSharedFunctionData)(newCoordinators[i]);
                                if (newCoordinatorData) {
                                    coordinatorPrincipal = newCoordinatorData[0], coordinatorMethodName = newCoordinatorData[1];
                                    if (coordinatorMethodName == "hello") {
                                        newCanisterIds.push(coordinatorPrincipal.toText());
                                    }
                                }
                            }
                            if (newCanisterIds.length > 0) {
                                currentSessionTopologyId = newTopologyId;
                                APIStorage_1.APIStorage.coordinator.setCanisterIds(newCanisterIds);
                                APIStorage_1.APIStorage.coordinator.setTopologyId(newTopologyId);
                            }
                            return [2 /*return*/, (0, utils_1.createErrResult)("changeTopology")];
                        }
                        else if ((0, utils_1.hasOwnProperty)(result, "invalidClient")) {
                            return [2 /*return*/, (0, utils_1.createErrFatal)()];
                        }
                        if (!!this.destroyed) return [3 /*break*/, 6];
                        timeout = APIService_1.timeoutBetweenRetriesSec * 1000;
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 5:
                        _a.sent();
                        updatedInProgressCanisters = CoordinatorApi.markCanisterIdAsFailed(canisterId, inProgressCanisterIds);
                        return [2 /*return*/, this.getClientRegistryRecursively(apiParameters, updatedInProgressCanisters)];
                    case 6:
                        (0, utils_1.warn)("CoordinatorApi: temporaryUnavailable: getClientRegistryRecursively skipped - destroyed");
                        _a.label = 7;
                    case 7: return [2 /*return*/, (0, utils_1.createErrRetry)()];
                }
            });
        }); };
        this.hello = function (apiParameters, canisterId) { return __awaiter(_this, void 0, void 0, function () {
            var actor, topologyId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actor = (0, coordinator_1.createCanisterActor)(canisterId, new agent_1.AnonymousIdentity(), apiParameters.host);
                        topologyId = currentSessionTopologyId;
                        return [4 /*yield*/, actor.hello([apiParameters.clientPrincipal], apiParameters.sdkVersion, topologyId ? [topologyId] : [], apiParameters.apiKey)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); };
    }
    CoordinatorApi.prototype.callCoordinatorRecursively = function (apiParameters, retriesLeft) {
        return __awaiter(this, void 0, void 0, function () {
            var coordinatorResponse, _a, timeout, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getResult(apiParameters)];
                    case 1:
                        coordinatorResponse = _b.sent();
                        (0, utils_1.log)("CoordinatorApi.callCoordinatorRecursively.coordinator", coordinatorResponse, { retriesLeft: retriesLeft });
                        if (!(0, utils_1.isOk)(coordinatorResponse)) return [3 /*break*/, 2];
                        return [2 /*return*/, coordinatorResponse];
                    case 2:
                        if (!(0, utils_1.isProceed)(coordinatorResponse)) return [3 /*break*/, 3];
                        return [2 /*return*/, coordinatorResponse];
                    case 3:
                        if (!(0, utils_1.isErr)(coordinatorResponse)) return [3 /*break*/, 13];
                        _a = coordinatorResponse.err;
                        switch (_a) {
                            case "changeTopology": return [3 /*break*/, 4];
                            case "retry": return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 12];
                    case 4:
                        if (!!this.destroyed) return [3 /*break*/, 6];
                        timeout = (0, APIService_1.getTimeout)(APIService_1.COORDINATOR_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.callCoordinatorRecursively(apiParameters, retriesLeft - 1)];
                    case 6:
                        (0, utils_1.warn)("CoordinatorApi: changeTopology: callCoordinatorRecursively skipped - destroyed");
                        _b.label = 7;
                    case 7: return [3 /*break*/, 13];
                    case 8:
                        if (!(retriesLeft > 0)) return [3 /*break*/, 11];
                        if (!!this.destroyed) return [3 /*break*/, 10];
                        timeout = (0, APIService_1.getTimeout)(APIService_1.COORDINATOR_RETRIES - retriesLeft);
                        (0, utils_1.log)("sleep for", timeout, "ms");
                        return [4 /*yield*/, (0, utils_1.delayPromise)(timeout)];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, this.callCoordinatorRecursively(apiParameters, retriesLeft - 1)];
                    case 10:
                        (0, utils_1.warn)("CoordinatorApi: retry: callCoordinatorRecursively skipped - destroyed");
                        _b.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        {
                        }
                        _b.label = 13;
                    case 13: return [2 /*return*/, (0, utils_1.createErrFatal)()];
                }
            });
        });
    };
    CoordinatorApi.markCanisterIdAsFailed = function (failedCanisterId, inProgressCanisterIds) {
        return inProgressCanisterIds.filter(function (value) { return value !== failedCanisterId; });
    };
    CoordinatorApi.getRandomCanisterId = function (array) {
        var index = Math.floor(Math.random() * array.length);
        return array[index];
    };
    CoordinatorApi.getCanisterId = function (inProgressCanisterIds) {
        if (inProgressCanisterIds.length == 0) {
            return undefined;
        }
        return CoordinatorApi.getRandomCanisterId(inProgressCanisterIds);
    };
    return CoordinatorApi;
}());
exports.CoordinatorApi = CoordinatorApi;
//# sourceMappingURL=CoordinatorAPI.js.map