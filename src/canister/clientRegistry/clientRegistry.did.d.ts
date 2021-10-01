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
export type Collect = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<CollectResult>;
export type CollectResult = { 'ok': null } |
    { 'err': AnalyticsReceiverApiError };
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
export type IsCollectRequired = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<IsCollectRequiredResult>;
export type IsCollectRequiredResult = { 'ok': boolean } |
    { 'err': AnalyticsReceiverApiError };
export type ProjectApiKey = string;
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

export interface _SERVICE {
    'getAnalyticsReceiver': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: ProjectApiKey,
    ) => Promise<GetAnalyticsReceiverResult>,
    'registerClient': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: ProjectApiKey,
    ) => Promise<RegisterClientResult>,
}
