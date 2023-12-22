
import EnetUsingEvents from '../src/enet-using-events';

const socket = EnetUsingEvents.createSocket();

socket.connect(1234, "127.0.0.1");
console.log('connect');

socket.on('connect', (peerNum) => {
    console.log('connect', peerNum);

    let data = new Uint8Array([4, 5, 6]).buffer;
    console.log('send', peerNum, data);
    socket.send(peerNum, data);
});

socket.on('disconnect', (peerNum) => {
    console.log('disconnect', peerNum);
});

socket.on('receive', (peerNum, channel, data) => {
    console.log('receive', peerNum, channel, data);
});
