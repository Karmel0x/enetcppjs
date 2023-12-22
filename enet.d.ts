import { Buffer } from 'buffer';

export enum ENetEventType {
    ENET_EVENT_TYPE_NONE = 0,
    ENET_EVENT_TYPE_CONNECT = 1,
    ENET_EVENT_TYPE_DISCONNECT = 2,
    ENET_EVENT_TYPE_RECEIVE = 3,
}

export interface ENetEventBuffer {
    type: number;
    channel: number;
    buffer: Buffer;
    peer_num: number;
}

export interface ENetEventArrayBuffer {
    type: number;
    channel: number;
    buffer: ArrayBuffer;
    peerNum: number;
}

export class Enet {
    public static initialize(port: number, host: string, blowfishKey: string): boolean;

	/** @deprecated */
    public static netLoop_buffer(): ENetEventBuffer;
	/** @deprecated */
    public static sendPacket_buffer(peerNum: number, data: Buffer, channel: number): number;

    public static netLoop_arrayBuffer(): ENetEventArrayBuffer;
    public static sendPacket_arrayBuffer(peerNum: number, data: ArrayBuffer, channel: number): number;
	
    public static readonly ENET_EVENT_TYPE_NONE: ENetEventType = ENetEventType.ENET_EVENT_TYPE_NONE;
    public static readonly ENET_EVENT_TYPE_CONNECT: ENetEventType = ENetEventType.ENET_EVENT_TYPE_CONNECT;
    public static readonly ENET_EVENT_TYPE_DISCONNECT: ENetEventType = ENetEventType.ENET_EVENT_TYPE_DISCONNECT;
    public static readonly ENET_EVENT_TYPE_RECEIVE: ENetEventType = ENetEventType.ENET_EVENT_TYPE_RECEIVE;
}
