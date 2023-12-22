
import { delay } from '../src/enet';
import EnetUsingEvents from '../src/enet-using-events';

const server = EnetUsingEvents.createSocket();
const client = EnetUsingEvents.createSocket();

server.bind(1234, "127.0.0.1");
console.log('server.bind');

client.connect(1234, "127.0.0.1");
console.log('client.connect');

server.on('connect', (peerNum) => {
    console.log('server.connect', peerNum);
    runTests(peerNum);
});

client.on('connect', (peerNum) => {
    console.log('client.connect', peerNum);
});

server.on('disconnect', (peerNum) => {
    console.log('server.disconnect', peerNum);
});

client.on('disconnect', (peerNum) => {
    console.log('client.disconnect', peerNum);
});

server.on('receive', (peerNum, channel, data) => {
    console.log('server.receive', peerNum, channel, data);
});

client.on('receive', (peerNum, channel, data) => {
    console.log('client.receive', peerNum, channel, data);
});

async function runTests(peerNum: number) {
    await delay(1000);

    {
        let data = new Uint8Array([1, 2, 3]).buffer;
        console.log('server.send', peerNum, data);
        server.send(peerNum, data);
        await delay(1000);
    }

    {
        let data = new Uint8Array([4, 5, 6]).buffer;
        console.log('client.send', 0, data);
        client.send(0, data);
        await delay(1000);
    }

    console.log('server.setBlowfish', peerNum);
    server.setBlowfish(peerNum, "1234567890");
    await delay(1000);

    {
        let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
        console.log('server.send', peerNum, data);
        server.send(peerNum, data);
        await delay(1000);
    }

    {
        let data = new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]).buffer;
        console.log('client.send', 0, data);
        client.send(0, data);
        await delay(1000);
    }

    console.log('client.setBlowfish', 0);
    client.setBlowfish(0, "1234567890");
    await delay(1000);

    {
        let data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer;
        console.log('server.send', peerNum, data);
        server.send(peerNum, data);
        await delay(1000);
    }

    {
        let data = new Uint8Array([8, 7, 6, 5, 4, 3, 2, 1]).buffer;
        console.log('client.send', 0, data);
        client.send(0, data);
        await delay(1000);
    }
}
