import type {Principal} from '@dfinity/principal';

export type AccessToken = string;
export interface AnalyticsReceiver {
    'getAnalyticsReceiverApi': GetAnalyticsReceiverApi,
    'accessToken': AccessToken,
}
export interface AnalyticsReceiverApi {
    'isCollectRequired' : IsCollectRequired,
  'validatePacket' : ValidatePacket,
  'collectPacket' : CollectPacket,
    'collect' : Collect,
}
export type AnalyticsReceiverApiError = { 'invalidClient': null } |
    { 'wrongAccessToken': null } |
    { 'temporarilyUnavailable': null };
export type Collect = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
) => Promise<CollectResult>;
export type CollectPacket = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
    arg_3: Packet,
  ) => Promise<CollectPacketResult>;
export type CollectPacketResult = { 'ok' : CollectPacketResultOk } |
  { 'err' : CollectPacketResultError };
export type CollectPacketResultError = { 'api' : AnalyticsReceiverApiError };
export type CollectPacketResultOk = {};
export type CollectResult = { 'ok': null } |
    { 'err': AnalyticsReceiverApiError };
export interface Event {
  'name' : string,
  'sequence' : bigint,
  'timeMillis' : bigint,
}
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
export interface Packet { 'items' : Array<PacketItem> }
export type PacketItem = { 'event' : Event } |
  { 'session' : Session };
export interface PacketRejectedItem { 'sequence' : bigint }
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
export interface Session { 'sequence' : bigint, 'timeMillis' : bigint }
export type ValidatePacket = (
    arg_0: [] | [Principal],
    arg_1: SdkVersion,
    arg_2: AccessToken,
    arg_3: Packet,
  ) => Promise<ValidatePacketResult>;
export type ValidatePacketResult = { 'ok' : ValidatePacketResultOk } |
  { 'err' : ValidatePacketResultError };
export type ValidatePacketResultError = { 'api' : AnalyticsReceiverApiError };
export interface ValidatePacketResultOk {
  'rejectedItems' : [] | [Array<PacketRejectedItem>],
}
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
