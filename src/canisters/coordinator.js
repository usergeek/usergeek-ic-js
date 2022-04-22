import {Actor, HttpAgent} from "@dfinity/agent";

const idlFactory = ({IDL}) => {
    const HelloResult = IDL.Rec();
    const SdkVersion = IDL.Nat32;
    const TopologyId = IDL.Nat32;
    const ProjectApiKey = IDL.Text;
    const AccessToken = IDL.Text;
    const AnalyticsReceiverApiError = IDL.Variant({
        'invalidClient': IDL.Null,
        'wrongAccessToken': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
    });
    const IsCollectRequiredResult = IDL.Variant({
        'ok': IDL.Bool,
        'err': AnalyticsReceiverApiError,
    });
    const IsCollectRequired = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],
        [IsCollectRequiredResult],
        ['query'],
    );
    const Event = IDL.Record({
        'name': IDL.Text,
        'sequence': IDL.Int,
        'timeMillis': IDL.Int,
    });
    const Session = IDL.Record({'sequence': IDL.Int, 'timeMillis': IDL.Int});
    const PacketItem = IDL.Variant({'event': Event, 'session': Session});
    const Packet = IDL.Record({'items': IDL.Vec(PacketItem)});
    const PacketRejectedItem = IDL.Record({'sequence': IDL.Int});
    const ValidatePacketResultOk = IDL.Record({
        'rejectedItems': IDL.Opt(IDL.Vec(PacketRejectedItem)),
    });
    const ValidatePacketResultError = IDL.Variant({
        'api': AnalyticsReceiverApiError,
    });
    const ValidatePacketResult = IDL.Variant({
        'ok': ValidatePacketResultOk,
        'err': ValidatePacketResultError,
    });
    const ValidatePacket = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet],
        [ValidatePacketResult],
        ['query'],
    );
    const CollectPacketResultOk = IDL.Record({});
    const CollectPacketResultError = IDL.Variant({
        'api': AnalyticsReceiverApiError,
    });
    const CollectPacketResult = IDL.Variant({
        'ok': CollectPacketResultOk,
        'err': CollectPacketResultError,
    });
    const CollectPacket = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet],
        [CollectPacketResult],
        [],
    );
    const CollectResult = IDL.Variant({
        'ok': IDL.Null,
        'err': AnalyticsReceiverApiError,
    });
    const Collect = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],
        [CollectResult],
        [],
    );
    const AnalyticsReceiverApi = IDL.Record({
        'isCollectRequired': IsCollectRequired,
        'validatePacket': ValidatePacket,
        'collectPacket': CollectPacket,
        'collect': Collect,
    });
    const GetAnalyticsReceiverApiResult = IDL.Variant({
        'ok': AnalyticsReceiverApi,
        'err': AnalyticsReceiverApiError,
    });
    const GetAnalyticsReceiverApi = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],
        [GetAnalyticsReceiverApiResult],
        ['query'],
    );
    const AnalyticsReceiver = IDL.Record({
        'getAnalyticsReceiverApi': GetAnalyticsReceiverApi,
        'accessToken': AccessToken,
    });
    const Hello = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, IDL.Opt(TopologyId), ProjectApiKey],
        [HelloResult],
        ['query'],
    );
    const Topology = IDL.Record({
        'topologyId': TopologyId,
        'coordinators': IDL.Vec(Hello),
    });
    const GetAnalyticsReceiverError = IDL.Variant({
        'wrongApiKey': IDL.Null,
        'clientBlocked': IDL.Null,
        'invalidClient': IDL.Null,
        'clientNotRegistered': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
        'wrongTopology': IDL.Null,
    });
    const GetAnalyticsReceiverResult = IDL.Variant({
        'ok': AnalyticsReceiver,
        'err': GetAnalyticsReceiverError,
    });
    const GetAnalyticsReceiver = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],
        [GetAnalyticsReceiverResult],
        ['query'],
    );
    const RegisterClientOkResult = IDL.Record({
        'analyticsReceiver': AnalyticsReceiver,
        'analyticsStoreNotified': IDL.Bool,
    });
    const RegisterClientError = IDL.Variant({
        'wrongApiKey': IDL.Null,
        'invalidClient': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
        'wrongTopology': IDL.Null,
    });
    const RegisterClientResult = IDL.Variant({
        'ok': RegisterClientOkResult,
        'err': RegisterClientError,
    });
    const RegisterClient = IDL.Func(
        [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],
        [RegisterClientResult],
        [],
    );
    const ClientRegistry = IDL.Record({
        'getAnalyticsReceiver': GetAnalyticsReceiver,
        'registerClient': RegisterClient,
    });
    HelloResult.fill(
        IDL.Variant({
            'temporaryUnavailable': IDL.Null,
            'invalidClient': IDL.Null,
            'analyticsReceiver': AnalyticsReceiver,
            'changeTopology': Topology,
            'clientRegistry': ClientRegistry,
            'collectSuccess': IDL.Null,
        })
    );
    return IDL.Service({
        'hello': IDL.Func(
            [
                IDL.Opt(IDL.Principal),
                SdkVersion,
                IDL.Opt(TopologyId),
                ProjectApiKey,
            ],
            [HelloResult],
            ['query'],
        ),
    });
};

/**
 *
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canisters/coordinator.did.d.ts")._SERVICE>}
 */
const createActor = (canisterId, options) => {
    const agent = new HttpAgent({...options?.agentOptions});

    // Fetch root key for certificate validation during development
    if (process.env.NODE_ENV !== "production") {
        agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
            console.error(err);
        });
    }

    // Creates an actor with using the candid interface and the HttpAgent
    return Actor.createActor(idlFactory, {
        agent,
        canisterId,
        ...options?.actorOptions,
    });
};

/**
 *
 * @param {string} canisterId
 * @param {import("@dfinity/agent").Identity} identity
 * @param {string} host
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canisters/coordinator.did.d.ts")._SERVICE>}
 */
export const createCanisterActor = (canisterId, identity, host) => {
    return createActor(canisterId, {
        agentOptions: {
            identity: identity,
            host: host
        }
    })
}