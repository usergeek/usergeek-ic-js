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
    var HelloResult = IDL.Rec();
    var SdkVersion = IDL.Nat32;
    var TopologyId = IDL.Nat32;
    var ProjectApiKey = IDL.Text;
    var AccessToken = IDL.Text;
    var AnalyticsReceiverApiError = IDL.Variant({
        'invalidClient': IDL.Null,
        'wrongAccessToken': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
    });
    var IsCollectRequiredResult = IDL.Variant({
        'ok': IDL.Bool,
        'err': AnalyticsReceiverApiError,
    });
    var IsCollectRequired = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [IsCollectRequiredResult], ['query']);
    var CollectResult = IDL.Variant({
        'ok': IDL.Null,
        'err': AnalyticsReceiverApiError,
    });
    var Collect = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [CollectResult], []);
    var AnalyticsReceiverApi = IDL.Record({
        'isCollectRequired': IsCollectRequired,
        'collect': Collect,
    });
    var GetAnalyticsReceiverApiResult = IDL.Variant({
        'ok': AnalyticsReceiverApi,
        'err': AnalyticsReceiverApiError,
    });
    var GetAnalyticsReceiverApi = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [GetAnalyticsReceiverApiResult], ['query']);
    var AnalyticsReceiver = IDL.Record({
        'getAnalyticsReceiverApi': GetAnalyticsReceiverApi,
        'accessToken': AccessToken,
    });
    var Hello = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, IDL.Opt(TopologyId), ProjectApiKey], [HelloResult], ['query']);
    var Topology = IDL.Record({
        'topologyId': TopologyId,
        'coordinators': IDL.Vec(Hello),
    });
    var GetAnalyticsReceiverError = IDL.Variant({
        'wrongApiKey': IDL.Null,
        'clientBlocked': IDL.Null,
        'invalidClient': IDL.Null,
        'clientNotRegistered': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
        'wrongTopology': IDL.Null,
    });
    var GetAnalyticsReceiverResult = IDL.Variant({
        'ok': AnalyticsReceiver,
        'err': GetAnalyticsReceiverError,
    });
    var GetAnalyticsReceiver = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey], [GetAnalyticsReceiverResult], ['query']);
    var RegisterClientOkResult = IDL.Record({
        'analyticsReceiver': AnalyticsReceiver,
        'analyticsStoreNotified': IDL.Bool,
    });
    var RegisterClientError = IDL.Variant({
        'wrongApiKey': IDL.Null,
        'invalidClient': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
        'wrongTopology': IDL.Null,
    });
    var RegisterClientResult = IDL.Variant({
        'ok': RegisterClientOkResult,
        'err': RegisterClientError,
    });
    var RegisterClient = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey], [RegisterClientResult], []);
    var ClientRegistry = IDL.Record({
        'getAnalyticsReceiver': GetAnalyticsReceiver,
        'registerClient': RegisterClient,
    });
    HelloResult.fill(IDL.Variant({
        'temporaryUnavailable': IDL.Null,
        'invalidClient': IDL.Null,
        'analyticsReceiver': AnalyticsReceiver,
        'changeTopology': Topology,
        'clientRegistry': ClientRegistry,
        'collectSuccess': IDL.Null,
    }));
    return IDL.Service({
        'hello': IDL.Func([
            IDL.Opt(IDL.Principal),
            SdkVersion,
            IDL.Opt(TopologyId),
            ProjectApiKey,
        ], [HelloResult], ['query']),
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
var createCanisterActor = function (canisterId, identity, host) {
    return createActor(canisterId, {
        agentOptions: {
            identity: identity,
            host: host
        }
    });
};
exports.createCanisterActor = createCanisterActor;
//# sourceMappingURL=coordinator.js.map