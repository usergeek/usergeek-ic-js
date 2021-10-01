import {Actor, HttpAgent} from "@dfinity/agent";

const idlFactory = ({IDL}) => {
    const SdkVersion = IDL.Nat32;
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
    return IDL.Service({
        'getAnalyticsReceiver': IDL.Func(
            [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],
            [GetAnalyticsReceiverResult],
            ['query'],
        ),
        'registerClient': IDL.Func(
            [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],
            [RegisterClientResult],
            [],
        ),
    });
};

/**
 *
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canister/clientRegistry/clientRegistry.did.d.ts")._SERVICE>}
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
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canister/clientRegistry/clientRegistry.did.d.ts")._SERVICE>}
 */
export const createCanisterActor = (canisterId, identity) => {
    return createActor(canisterId, {
        agentOptions: {
            identity: identity
        }
    })
}