
import EnetUsingEvents from '../src/enet-using-events';

const socket = EnetUsingEvents.createSocket();

socket.connect(1234, '127.0.0.1');
console.log('connect');

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
        let data = new Uint8Array([4, 5, 6]).buffer;
        console.log('send', peerNum, data);
        socket.send(peerNum, data);
    }

    {
        let data = new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]).buffer;
        console.log('send2', peerNum, data);
        socket.send(peerNum, data);
    }
}
