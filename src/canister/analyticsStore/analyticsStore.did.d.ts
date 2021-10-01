import type {Principal} from '@dfinity/principal';

export type AccessToken = string;

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
export type GetAnalyticsReceiverApiResult = { 'ok': AnalyticsReceiverApi } |
    { 'err': AnalyticsReceiverApiError };
export type IsCollectRequired = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<IsCollectRequiredResult>;
export type IsCollectRequiredResult = { 'ok': boolean } |
    { 'err': AnalyticsReceiverApiError };
export type SdkVersion = number;

export interface _SERVICE {
    'collect': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
    ) => Promise<CollectResult>,
    'getAnalyticsReceiverApi': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
    ) => Promise<GetAnalyticsReceiverApiResult>,
    'isCollectRequired': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
    ) => Promise<IsCollectRequiredResult>
}
