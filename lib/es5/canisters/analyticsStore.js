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
    var Event = IDL.Record({
        'name': IDL.Text,
        'sequence': IDL.Int,
        'timeMillis': IDL.Int,
    });
    var Session = IDL.Record({ 'sequence': IDL.Int, 'timeMillis': IDL.Int });
    var PacketItem = IDL.Variant({ 'event': Event, 'session': Session });
    var Packet = IDL.Record({ 'items': IDL.Vec(PacketItem) });
    var CollectPacketResultOk = IDL.Record({});
    var CollectPacketResultError = IDL.Variant({
        'api': AnalyticsReceiverApiError,
    });
    var CollectPacketResult = IDL.Variant({
        'ok': CollectPacketResultOk,
        'err': CollectPacketResultError,
    });
    var IsCollectRequiredResult = IDL.Variant({
        'ok': IDL.Bool,
        'err': AnalyticsReceiverApiError,
    });
    var IsCollectRequired = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [IsCollectRequiredResult], ['query']);
    var PacketRejectedItem = IDL.Record({ 'sequence': IDL.Int });
    var ValidatePacketResultOk = IDL.Record({
        'rejectedItems': IDL.Opt(IDL.Vec(PacketRejectedItem)),
    });
    var ValidatePacketResultError = IDL.Variant({
        'api': AnalyticsReceiverApiError,
    });
    var ValidatePacketResult = IDL.Variant({
        'ok': ValidatePacketResultOk,
        'err': ValidatePacketResultError,
    });
    var ValidatePacket = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet], [ValidatePacketResult], ['query']);
    var CollectPacket = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet], [CollectPacketResult], []);
    var Collect = IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [CollectResult], []);
    var AnalyticsReceiverApi = IDL.Record({
        'isCollectRequired': IsCollectRequired,
        'validatePacket': ValidatePacket,
        'collectPacket': CollectPacket,
        'collect': Collect,
    });
    var GetAnalyticsReceiverApiResult = IDL.Variant({
        'ok': AnalyticsReceiverApi,
        'err': AnalyticsReceiverApiError,
    });
    return IDL.Service({
        'collect': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [CollectResult], []),
        'collectPacket': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet], [CollectPacketResult], []),
        'getAnalyticsReceiverApi': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [GetAnalyticsReceiverApiResult], ['query']),
        'isCollectRequired': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken], [IsCollectRequiredResult], ['query']),
        'validatePacket': IDL.Func([IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet], [ValidatePacketResult], ['query']),
    });
};
/**
 *
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canisters/analyticsStore.did.d.ts")._SERVICE>}
 */
var createActor = function (canisterId, options) {
    var agent = new agent_1.HttpAgent(__assign({}, options === null || options === void 0 ? void 0 : options.agentOptions));
    // Fetch root key for certificate validation during development
    if (process.env.NODE_ENV !== "production") {
        agent.fetchRootKey().catch(function (err) {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }
    // Creates an actor with using the candid interface and the HttpAgent
    return agent_1.Actor.createActor(idlFactory, __assign({ agent: agent, canisterId: canisterId }, options === null || options === void 0 ? void 0 : options.actorOptions));
};
/**
 *
 * @param {string} canisterId
 * @param {import("@dfinity/agent").Identity} identity
 * @param {string} host
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canisters/analyticsStore.did.d.ts")._SERVICE>}
 */
var createCanisterActor = function (canisterId, identity, host) {
    return createActor(canisterId, {
        agentOptions: {
            identity: identity,
            host: host
        }
    });
};
exports.createCanisterActor = createCanisterActor;
//# sourceMappingURL=analyticsStore.js.map