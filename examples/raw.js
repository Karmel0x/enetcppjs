
/** @type {import('../src/enet-wrapper').EnetWrapper} */
// @ts-ignore
const EnetWrapper = require('../bindings/build/Release/enetcppjs.node');

function runServer() {
    const socket = EnetWrapper.createSocket();
    console.log('runServer.socket:', socket);
    const binded = EnetWrapper.bind(socket, 5119, '127.0.0.1');
    console.log('runServer.binded:', binded);

    async function netLoop() {
        for (; ;) {
            const event = EnetWrapper.service(socket);
            if (event && event.type > 0) {
                console.log('server.event', event);
            }
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    netLoop();
}

function runClient() {
    const socket = EnetWrapper.createSocket();
    console.log('runClient.socket:', socket);
    const binded = EnetWrapper.connect(socket, 5119, '127.0.0.1');
    console.log('runClient.connect:', binded);

    async function netLoop() {
        for (; ;) {
            const event = EnetWrapper.service(socket);
            if (event.type > 0) {
                console.log('client.event', event);
            }
            await new Promise(resolve => setTimeout(resolve, 1));
        }
    }

    netLoop();

    setTimeout(() => {
        let data = new Uint8Array([1, 2, 3]).buffer;
        console.log(data);
        const sent = EnetWrapper.send(socket, 0, data, 0, /*packetFlag.reliable*/1);
        console.log(sent);
    }, 3000);
}

runServer();
runClient();
