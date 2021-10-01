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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanisterActor = void 0;
var agent_1 = require("@dfinity/agent");
var idlFactory = function (_a) {
    var IDL = _a.IDL;
    var SdkVersion = IDL.Nat32;
    var AccessToken = IDL.Text;
    var AnalyticsReceiverApiError = IDL.Variant({
        'invalidClient': IDL.Null,
        'wrongAccessToken': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
    });
    var CollectResult = IDL.Variant({
        'ok': IDL.Null,
        'err': AnalyticsReceiverApiError,
    });
    var IsCollectRequiredResult = IDL.Variant({
        'ok': IDL.Bool,
        'err': AnalyticsReceiverApiError,
    });
    var IsCollectRequired = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [IsCollectRequiredResult], ['query']);
    var Collect = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [CollectResult], []);
    var AnalyticsReceiverApi = IDL.Record({
        'isCollectRequired': IsCollectRequired,
        'collect': Collect,
    });
    var GetAnalyticsReceiverApiResult = IDL.Variant({
        'ok': AnalyticsReceiverApi,
        'err': AnalyticsReceiverApiError,
    });
    return IDL.Service({
        'collect': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [CollectResult], []),
        'getAnalyticsReceiverApi': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [GetAnalyticsReceiverApiResult], ['query']),
        'isCollectRequired': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [IsCollectRequiredResult], ['query']),
    });
};
var createActor = function (canisterId, options) {
    var agent = new agent_1.HttpAgent(__assign({}, options === null || options === void 0 ? void 0 : options.agentOptions));
    if (process.env.NODE_ENV !== "production") {
        agent.fetchRootKey().catch(function (err) {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }
    return agent_1.Actor.createActor(idlFactory, __assign({ agent: agent, canisterId: canisterId }, options === null || options === void 0 ? void 0 : options.actorOptions));
};
var createCanisterActor = function (canisterId, identity) {
    return createActor(canisterId, {
        agentOptions: {
            identity: identity
        }
    });
};
exports.createCanisterActor = createCanisterActor;
//# sourceMappingURL=analyticsStore.js.map