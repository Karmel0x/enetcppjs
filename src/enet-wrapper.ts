
// reference file: '../bindings/main.cpp'
// @ts-ignore
import enetcppjs from '../bindings/build/Release/enetcppjs.node';

export interface EnetSocketAddress { }
export interface EnetPeerAddress { }
export interface EnetPacketAddress { }

export const packetFlag = {
  /** packet must be received by the target peer and resend attempts should be
   * made until the packet is delivered */
  reliable: 1 << 0,
  /** packet will not be sequenced with other packets
   * not supported for reliable packets */
  unsequenced: 1 << 1,
  /** packet will not allocate data, and user must supply it instead */
  noAllocate: 1 << 2,
} as const;

export type PacketFlag = typeof packetFlag[keyof typeof packetFlag] | number;

export const eventType = {
  /** no event occurred within the specified time limit */
  none: 0,
  /** a connection request initiated by enet_host_connect has completed.
    * The peer field contains the peer which successfully connected. 
    */
  connect: 1,
  /** a peer has disconnected. This event is generated on a successful 
    * completion of a disconnect initiated by enet_pper_disconnect, if 
    * a peer has timed out, or if a connection request intialized by 
    * enet_host_connect has timed out. The peer field contains the peer 
    * which disconnected. The data field contains user supplied data 
    * describing the disconnection, or 0, if none is available.
    */
  disconnect: 2,
  /** a packet has been received from a peer. The peer field specifies the
    * peer which sent the packet. The channelID field specifies the channel
    * number upon which the packet was received. The packet field contains
    * the packet that was received; this packet must be destroyed with
    * enet_packet_destroy after use.
    */
  receive: 3,
} as const;

export type ENetEvent = {
  type: typeof eventType.none;
} | {
  type: typeof eventType.connect | typeof eventType.disconnect;
  peerNum: number;
} | {
  type: typeof eventType.receive;
  peerNum: number;
  data: ArrayBuffer;
  channel: number;
  packet: EnetPacketAddress;
};

export interface EnetWrapper {
  createSocket(): EnetSocketAddress;
  bind(enetWrapper: EnetSocketAddress, port: number, ip: string): boolean;
  destroy(enetWrapper: EnetSocketAddress): void;
  connect(enetWrapper: EnetSocketAddress, port: number, ip: string): EnetPeerAddress | undefined;
  disconnect(enetWrapper: EnetSocketAddress, peerNum: number, soon: boolean): void;
  send(enetWrapper: EnetSocketAddress, peerNum: number, data: ArrayBufferLike, channel: number, flag: PacketFlag): boolean;
  service(enetWrapper: EnetSocketAddress): ENetEvent;
  freePacket(packet: EnetPacketAddress): void;
  setBlowfish(enetWrapper: EnetSocketAddress, peerNum: number, base64Key: string): void;
}


export default enetcppjs as EnetWrapper;
