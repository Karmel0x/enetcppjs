
import EnetWrapper, { ENetEvent, EnetSocketAddress, eventType, packetFlag } from './enet-wrapper';

export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class EnetSocket {

    static packetFlag = packetFlag;
    static eventType = eventType;

    // TODO
    //static freePacket(packet: EnetPacketAddress){
    //    EnetWrapper.freePacket(packet);
    //}

    socket;
    netLoopRunning = false;

    constructor(socket: EnetSocketAddress | undefined = undefined) {
        this.socket = socket || EnetWrapper.createSocket();
    }

    bind(port: number, ip: string) {
        let binded = EnetWrapper.bind(this.socket, port, ip);
        if (!binded)
            throw new Error("Failed to bind socket");
    }

    connect(port: number, ip: string) {
        // peer is not null even if connection fails
        // service will emit connect or disconnect event
        let peer = EnetWrapper.connect(this.socket, port, ip);
        if (!peer)
            throw new Error("Failed to connect socket");
    }

    send(peerNum: number, data: ArrayBufferLike, channel: number = 0, flag: number = packetFlag.reliable) {
        return EnetWrapper.send(this.socket, peerNum, data, channel, flag);
    }

    service() {
        // TODO: promise?
        return EnetWrapper.service(this.socket);
    }

    async netLoop(callback: (msg: ENetEvent) => void) {
        if (this.netLoopRunning)
            return;

        this.netLoopRunning = true;

        for (; ;) {
            let msg = this.service();
            if (!msg.type) {
                await delay(1);
                continue;
            }

            callback(msg);
        }
    }

    setBlowfish(peerNum: number, base64Key: string) {
        EnetWrapper.setBlowfish(this.socket, peerNum, base64Key);
    }

}

export default class Enet {
    static createSocket() {
        const enet = new EnetSocket();
        return enet;
    }
}
