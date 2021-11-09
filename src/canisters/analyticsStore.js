import {Actor, HttpAgent} from "@dfinity/agent";

const idlFactory = ({IDL}) => {
    const SdkVersion = IDL.Nat32;
    const AccessToken = IDL.Text;
    const AnalyticsReceiverApiError = IDL.Variant({
        'invalidClient': IDL.Null,
        'wrongAccessToken': IDL.Null,
        'temporarilyUnavailable': IDL.Null,
    });
    const CollectResult = IDL.Variant({
        'ok': IDL.Null,
        'err': AnalyticsReceiverApiError,
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
    return IDL.Service({
        'collect': IDL.Func(
            [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],
            [CollectResult],
            [],
        ),
        'getAnalyticsReceiverApi': IDL.Func(
            [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],
            [GetAnalyticsReceiverApiResult],
            ['query'],
        ),
        'isCollectRequired': IDL.Func(
            [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],
            [IsCollectRequiredResult],
            ['query'],
        ),
    });
};

/**
 *
 * @param {string | import("@dfinity/principal").Principal} canisterId Canister ID of Agent
 * @param {{agentOptions?: import("@dfinity/agent").HttpAgentOptions; actorOptions?: import("@dfinity/agent").ActorConfig}} [options]
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canisters/analyticsStore.did.d.ts")._SERVICE>}
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
 * @return {import("@dfinity/agent").ActorSubclass<import("src/canisters/analyticsStore.did.d.ts")._SERVICE>}
 */
export const createCanisterActor = (canisterId, identity, host) => {
    return createActor(canisterId, {
        agentOptions: {
            identity: identity,
            host: host
        }
    })
}