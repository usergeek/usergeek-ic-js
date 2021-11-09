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
exports.getResult = void 0;
var analyticsStore_1 = require("./canisters/analyticsStore");
var utils_1 = require("./utils");
var agent_1 = require("@dfinity/agent");
var getResult = function (sdkVersion, sessionContext, canisterPrincipal, accessToken) { return __awaiter(void 0, void 0, void 0, function () {
    var getApiActor, handleGetAnalyticsReceiverApiResponse, apiPrincipal, actor, handleIsCollectRequiredResponse, handleCollectResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                getApiActor = (0, analyticsStore_1.createCanisterActor)(canisterPrincipal.toText(), new agent_1.AnonymousIdentity(), sessionContext.host);
                return [4, handleGetAnalyticsReceiverApi(getApiActor, sessionContext.clientPrincipal, sdkVersion, accessToken)];
            case 1:
                handleGetAnalyticsReceiverApiResponse = _a.sent();
                if (!(0, utils_1.isOk)(handleGetAnalyticsReceiverApiResponse)) return [3, 8];
                apiPrincipal = handleGetAnalyticsReceiverApiResponse.ok;
                actor = (0, analyticsStore_1.createCanisterActor)(apiPrincipal.toText(), new agent_1.AnonymousIdentity(), sessionContext.host);
                return [4, isCollectRequired(actor, sessionContext.clientPrincipal, sdkVersion, accessToken)];
            case 2:
                handleIsCollectRequiredResponse = _a.sent();
                if (!(0, utils_1.isOk)(handleIsCollectRequiredResponse)) return [3, 6];
                if (!handleIsCollectRequiredResponse.ok.isCollectRequired) return [3, 4];
                return [4, handleCollect(actor, sessionContext.clientPrincipal, sdkVersion, accessToken)];
            case 3:
                handleCollectResponse = _a.sent();
                if ((0, utils_1.isOk)(handleCollectResponse)) {
                    return [2, (0, utils_1.createOkResult)("collected")];
                }
                else if ((0, utils_1.isErr)(handleCollectResponse)) {
                    return [2, handleCollectResponse];
                }
                return [3, 5];
            case 4: return [2, (0, utils_1.createOkResult)("alreadyCollected")];
            case 5: return [3, 7];
            case 6:
                if ((0, utils_1.isErr)(handleIsCollectRequiredResponse)) {
                    return [2, handleIsCollectRequiredResponse];
                }
                _a.label = 7;
            case 7: return [3, 9];
            case 8:
                if ((0, utils_1.isErr)(handleGetAnalyticsReceiverApiResponse)) {
                    return [2, handleGetAnalyticsReceiverApiResponse];
                }
                _a.label = 9;
            case 9: return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
exports.getResult = getResult;
var handleGetAnalyticsReceiverApi = function (actor, clientPrincipal, sdkVersion, accessToken) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_1, apiPrincipal, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, actor.getAnalyticsReceiverApi([clientPrincipal], sdkVersion, accessToken)];
            case 1:
                result = _a.sent();
                return [3, 3];
            case 2:
                e_1 = _a.sent();
                (0, utils_1.warn)("actor.getAnalyticsReceiverApi", e_1);
                return [2, (0, utils_1.createErrRetry)()];
            case 3:
                (0, utils_1.log)("actor.getAnalyticsReceiverApi", result);
                if ((0, utils_1.isOk)(result)) {
                    apiPrincipal = getAnalyticsReceiverApiPrincipal(result.ok);
                    return [2, (0, utils_1.createOkResult)(apiPrincipal)];
                }
                else if ((0, utils_1.isErr)(result)) {
                    error = result.err;
                    if ((0, utils_1.isErrTemporarilyUnavailable)(error)) {
                        return [2, (0, utils_1.createErrRetry)()];
                    }
                }
                return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
var isCollectRequired = function (actor, clientPrincipal, sdkVersion, accessToken) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_2, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, actor.isCollectRequired([clientPrincipal], sdkVersion, accessToken)];
            case 1:
                result = _a.sent();
                return [3, 3];
            case 2:
                e_2 = _a.sent();
                (0, utils_1.warn)("actor.isCollectRequired", e_2);
                return [2, (0, utils_1.createErrRetry)()];
            case 3:
                (0, utils_1.log)("actor.isCollectRequired", result);
                if ((0, utils_1.isOk)(result)) {
                    return [2, (0, utils_1.createOkResult)({ isCollectRequired: result.ok })];
                }
                else if ((0, utils_1.isErr)(result)) {
                    error = result.err;
                    if ((0, utils_1.isErrTemporarilyUnavailable)(error)) {
                        return [2, (0, utils_1.createErrRetry)()];
                    }
                }
                return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
var handleCollect = function (actor, clientPrincipal, sdkVersion, accessToken) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_3, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, actor.collect([clientPrincipal], sdkVersion, accessToken)];
            case 1:
                result = _a.sent();
                return [3, 3];
            case 2:
                e_3 = _a.sent();
                (0, utils_1.warn)("actor.collect", e_3);
                return [2, (0, utils_1.createErrRetry)()];
            case 3:
                (0, utils_1.log)("actor.collect", result);
                if ((0, utils_1.isOk)(result)) {
                    return [2, (0, utils_1.createOkResult)(null)];
                }
                else if ((0, utils_1.isErr)(result)) {
                    error = result.err;
                    if ((0, utils_1.isErrTemporarilyUnavailable)(error)) {
                        return [2, (0, utils_1.createErrRetry)()];
                    }
                }
                return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
var getAnalyticsReceiverApiPrincipal = function (analyticsReceiverApi) {
    var getAnalyticsReceiverApiData = (0, utils_1.getSharedFunctionData)(analyticsReceiverApi.isCollectRequired);
    if (getAnalyticsReceiverApiData) {
        var principal = getAnalyticsReceiverApiData[0];
        return principal;
    }
    return undefined;
};
//# sourceMappingURL=AnalyticsStoreService.js.map