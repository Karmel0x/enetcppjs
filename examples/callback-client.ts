
import Enet, { EnetSocket } from '../src/enet';

const enet = Enet.createSocket();
enet.connect(1234, '127.0.0.1');
console.log('connect');

enet.netLoop((msg) => {
    console.log('netLoop', msg);

    if (msg.type == EnetSocket.eventType.connect) {
        console.log('connected');

        let data = new Uint8Array([4, 5, 6]).buffer;
        console.log('send', msg.peerNum, data);
        enet.send(msg.peerNum, data);
    }
});
