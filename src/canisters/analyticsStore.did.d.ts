import type {Principal} from '@dfinity/principal';

export type AccessToken = string;
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
export type GetAnalyticsReceiverApiResult = { 'ok': AnalyticsReceiverApi } |
    { 'err': AnalyticsReceiverApiError };
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
    'collect': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
    ) => Promise<CollectResult>,
    'collectPacket' : (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
        arg_3: Packet,
    ) => Promise<CollectPacketResult>,
    'getAnalyticsReceiverApi': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
    ) => Promise<GetAnalyticsReceiverApiResult>,
    'isCollectRequired': (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
    ) => Promise<IsCollectRequiredResult>,
    'validatePacket' : (
        arg_0: [] | [Principal],
        arg_1: SdkVersion,
        arg_2: AccessToken,
        arg_3: Packet,
    ) => Promise<ValidatePacketResult>,
}
