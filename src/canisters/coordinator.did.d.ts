import type {Principal} from '@dfinity/principal';

export type AccessToken = string;

export interface AnalyticsReceiver {
    'getAnalyticsReceiverApi': GetAnalyticsReceiverApi,
    'accessToken': AccessToken,
}

export interface AnalyticsReceiverApi {
    'isCollectRequired': IsCollectRequired,
    'collect': Collect,
}

export type AnalyticsReceiverApiError = { 'invalidClient': null } |
    { 'wrongAccessToken': null } |
    { 'temporarilyUnavailable': null };

export interface ClientRegistry {
    'getAnalyticsReceiver': GetAnalyticsReceiver,
    'registerClient': RegisterClient,
}

export type Collect = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<CollectResult>;
export type CollectResult = { 'ok': null } |
    { 'err': AnalyticsReceiverApiError };
export type GetAnalyticsReceiver = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: ProjectApiKey,
) => Promise<GetAnalyticsReceiverResult>;
export type GetAnalyticsReceiverApi = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<GetAnalyticsReceiverApiResult>;
export type GetAnalyticsReceiverApiResult = { 'ok': AnalyticsReceiverApi } |
    { 'err': AnalyticsReceiverApiError };
export type GetAnalyticsReceiverError = { 'wrongApiKey': null } |
    { 'clientBlocked': null } |
    { 'invalidClient': null } |
    { 'clientNotRegistered': null } |
    { 'temporarilyUnavailable': null } |
    { 'wrongTopology': null };
export type GetAnalyticsReceiverResult = { 'ok': AnalyticsReceiver } |
    { 'err': GetAnalyticsReceiverError };
export type Hello = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: [] | [TopologyId],
    arg_3: ProjectApiKey,
) => Promise<HelloResult>;
export type HelloResult = { 'temporaryUnavailable': null } |
    { 'invalidClient': null } |
    { 'analyticsReceiver': AnalyticsReceiver } |
    { 'changeTopology': Topology } |
    { 'clientRegistry': ClientRegistry } |
    { 'collectSuccess': null };
export type IsCollectRequired = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<IsCollectRequiredResult>;
export type IsCollectRequiredResult = { 'ok': boolean } |
    { 'err': AnalyticsReceiverApiError };
export type ProjectApiKey = string;
export type RegisterClient = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: ProjectApiKey,
) => Promise<RegisterClientResult>;
export type RegisterClientError = { 'wrongApiKey': null } |
    { 'invalidClient': null } |
    { 'temporarilyUnavailable': null } |
    { 'wrongTopology': null };

export interface RegisterClientOkResult {
    'analyticsReceiver': AnalyticsReceiver,
    'analyticsStoreNotified': boolean,
}

export type RegisterClientResult = { 'ok': RegisterClientOkResult } |
    { 'err': RegisterClientError };
export type SdkVersion = number;

export interface Topology {
    'topologyId': TopologyId,
    'coordinators': Array<Hello>,
}

export type TopologyId = number;

export interface _SERVICE {
    'hello': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: [] | [TopologyId],
        arg_3: ProjectApiKey,
    ) => Promise<HelloResult>,
}
