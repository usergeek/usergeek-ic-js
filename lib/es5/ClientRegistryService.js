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
exports.getAnalyticsReceiverData = exports.getResult = void 0;
var agent_1 = require("@dfinity/agent");
var clientRegistry_1 = require("./canister/clientRegistry/clientRegistry");
var utils_1 = require("./utils");
var getResult = function (sdkVersion, apiKey, clientPrincipal, clientRegistryPrincipal) { return __awaiter(void 0, void 0, void 0, function () {
    var actor, handleGetAnalyticsReceiverResponse, analyticsReceiverView, _a, handleRegisterClientResult;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                actor = (0, clientRegistry_1.createCanisterActor)(clientRegistryPrincipal.toText(), new agent_1.AnonymousIdentity());
                return [4, handleGetAnalyticsReceiver(actor, clientPrincipal, sdkVersion, apiKey)];
            case 1:
                handleGetAnalyticsReceiverResponse = _b.sent();
                (0, utils_1.log)("handle.getAnalyticsReceiver", handleGetAnalyticsReceiverResponse);
                if (!(0, utils_1.isOk)(handleGetAnalyticsReceiverResponse)) return [3, 2];
                analyticsReceiverView = handleGetAnalyticsReceiverResponse.ok;
                if (analyticsReceiverView) {
                    return [2, (0, utils_1.createProceedResult)(analyticsReceiverView)];
                }
                return [3, 8];
            case 2:
                if (!(0, utils_1.isErr)(handleGetAnalyticsReceiverResponse)) return [3, 8];
                _a = handleGetAnalyticsReceiverResponse.err;
                switch (_a) {
                    case "clientNotRegistered": return [3, 3];
                    case "retry": return [3, 5];
                    case "restart": return [3, 6];
                }
                return [3, 7];
            case 3: return [4, handleRegisterClient(actor, clientPrincipal, sdkVersion, apiKey)];
            case 4:
                handleRegisterClientResult = _b.sent();
                (0, utils_1.log)("handle.registerClient", handleRegisterClientResult);
                if ((0, utils_1.isOk)(handleRegisterClientResult)) {
                    return [2, (0, utils_1.createOkResult)("registered")];
                }
                else if ((0, utils_1.isProceed)(handleRegisterClientResult)) {
                    return [2, handleRegisterClientResult];
                }
                else if ((0, utils_1.isErr)(handleRegisterClientResult)) {
                    return [2, handleRegisterClientResult];
                }
                return [3, 8];
            case 5:
                {
                    return [2, (0, utils_1.createErrRetry)()];
                }
                _b.label = 6;
            case 6:
                {
                    return [2, (0, utils_1.createErrRestart)()];
                }
                _b.label = 7;
            case 7:
                {
                    return [3, 8];
                }
                _b.label = 8;
            case 8: return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
exports.getResult = getResult;
var handleGetAnalyticsReceiver = function (actor, clientPrincipal, sdkVersion, apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_1, analyticsReceiverView, error;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, actor.getAnalyticsReceiver([clientPrincipal], sdkVersion, apiKey)];
            case 1:
                result = _a.sent();
                return [3, 3];
            case 2:
                e_1 = _a.sent();
                (0, utils_1.warn)("actor.getAnalyticsReceiver", e_1);
                return [2, (0, utils_1.createErrRetry)()];
            case 3:
                (0, utils_1.log)("actor.getAnalyticsReceiver", result);
                if ((0, utils_1.isOk)(result)) {
                    analyticsReceiverView = (0, exports.getAnalyticsReceiverData)(result.ok);
                    if (analyticsReceiverView) {
                        return [2, (0, utils_1.createOkResult)(analyticsReceiverView)];
                    }
                }
                else if ((0, utils_1.isErr)(result)) {
                    error = result.err;
                    if ((0, utils_1.hasOwnProperty)(error, "clientNotRegistered")) {
                        return [2, (0, utils_1.createErrResult)("clientNotRegistered")];
                    }
                    if ((0, utils_1.isErrTemporarilyUnavailable)(error)) {
                        return [2, (0, utils_1.createErrRetry)()];
                    }
                    if ((0, utils_1.isErrWrongTopology)(error)) {
                        return [2, (0, utils_1.createErrRestart)()];
                    }
                }
                return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
var handleRegisterClient = function (actor, clientPrincipal, sdkVersion, apiKey) { return __awaiter(void 0, void 0, void 0, function () {
    var result, e_2, _a, analyticsReceiver, analyticsStoreNotified, analyticsReceiverView, error;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4, actor.registerClient([clientPrincipal], sdkVersion, apiKey)];
            case 1:
                result = _b.sent();
                return [3, 3];
            case 2:
                e_2 = _b.sent();
                (0, utils_1.warn)("actor.registerClient", e_2);
                return [2, (0, utils_1.createErrRetry)()];
            case 3:
                (0, utils_1.log)("actor.registerClient", result);
                if ((0, utils_1.isOk)(result)) {
                    _a = result.ok, analyticsReceiver = _a.analyticsReceiver, analyticsStoreNotified = _a.analyticsStoreNotified;
                    if (analyticsStoreNotified) {
                        return [2, (0, utils_1.createOkResult)(null)];
                    }
                    analyticsReceiverView = (0, exports.getAnalyticsReceiverData)(analyticsReceiver);
                    if (analyticsReceiverView) {
                        return [2, (0, utils_1.createProceedResult)(analyticsReceiverView)];
                    }
                }
                else if ((0, utils_1.isErr)(result)) {
                    error = result.err;
                    if ((0, utils_1.isErrTemporarilyUnavailable)(error)) {
                        return [2, (0, utils_1.createErrRetry)()];
                    }
                    if ((0, utils_1.isErrWrongTopology)(error)) {
                        return [2, (0, utils_1.createErrRestart)()];
                    }
                }
                return [2, (0, utils_1.createErrFatal)()];
        }
    });
}); };
var getAnalyticsReceiverData = function (analyticsReceiver) {
    var getAnalyticsReceiverApiPrincipal = (0, utils_1.getSharedFunctionDataPrincipal)(analyticsReceiver.getAnalyticsReceiverApi);
    if (getAnalyticsReceiverApiPrincipal) {
        return {
            canisterPrincipal: getAnalyticsReceiverApiPrincipal,
            accessToken: analyticsReceiver.accessToken
        };
    }
    return undefined;
};
exports.getAnalyticsReceiverData = getAnalyticsReceiverData;
//# sourceMappingURL=ClientRegistryService.js.map