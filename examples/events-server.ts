
import EnetUsingEvents from '../src/enet-using-events';

const socket = EnetUsingEvents.createSocket();

socket.bind(1234, '127.0.0.1');
console.log('bind');

socket.on('connect', (peerNum) => {
    console.log('connect', peerNum);
    runTests(peerNum);
});

socket.on('disconnect', (peerNum) => {
    console.log('disconnect', peerNum);
});

socket.on('receive', (peerNum, data, channel) => {
    console.log('receive', peerNum, data, channel);
});

async function runTests(peerNum: number) {
    {
        let data = new Uint8Array([1, 2, 3]).buffer;
        console.log('send', peerNum, data);
        socket.send(peerNum, data);
    }

    socket.setBlowfish(peerNum, "1234567890");

    {
        let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
        console.log('send2', peerNum, data);
        socket.send(peerNum, data);
    }
}
