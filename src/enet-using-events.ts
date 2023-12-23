import { EventEmitter } from 'node:events';
import { EnetSocket } from './enet';
import { eventType } from './enet-wrapper';

interface IEnetSocketEventHandlers {
    'connect': (peerNum: number) => void;
    'disconnect': (peerNum: number) => void;
    'receive': (peerNum: number, data: ArrayBuffer, channel: number) => void;
}

export class EnetSocketUsingEvents extends EnetSocket {

    eventEmitter = new EventEmitter();

    eventLoop() {
        super.netLoop((msg) => {
            if (msg.type === eventType.connect) {
                this.emit('connect', msg.peerNum);
            }
            else if (msg.type === eventType.disconnect) {
                this.emit('disconnect', msg.peerNum);
            }
            else if (msg.type === eventType.receive) {
                this.emit('receive', msg.peerNum, msg.data, msg.channel);

                // TODO
                //setTimeout(() => {
                //    EnetSocket.freePacket(msg.packet);
                //}, 0);
            }
        });
    }

    bind(port: number, ip: string) {
        super.bind(port, ip);
        this.eventLoop();
    }

    connect(port: number, ip: string) {
        super.connect(port, ip);
        this.eventLoop();
    }

    on<T extends keyof IEnetSocketEventHandlers>(event: T, listener: IEnetSocketEventHandlers[T]) {
        this.eventEmitter.on(event, listener);
    }

    once<T extends keyof IEnetSocketEventHandlers>(event: T, listener: IEnetSocketEventHandlers[T]) {
        this.eventEmitter.once(event, listener);
    }

    emit<T extends keyof IEnetSocketEventHandlers>(event: T, ...args: Parameters<IEnetSocketEventHandlers[T]>) {
        this.eventEmitter.emit(event, ...args);
    }

}

export default class EnetUsingEvents {
    static createSocket() {
        const enet = new EnetSocketUsingEvents();
        return enet;
    }
}
