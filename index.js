
const enetcppjs = require('./bindings/build/Release/enetcppjs.node');

/** @deprecated */
enetcppjs.sendPacket = enetcppjs.sendPacket_buffer;

/** @deprecated */
enetcppjs.sendPacket2 = enetcppjs.sendPacket_arrayBuffer;

/** @deprecated */
enetcppjs.netLoop = enetcppjs.netLoop_buffer;

/** @deprecated */
enetcppjs.netLoop2 = enetcppjs.netLoop_arrayBuffer;

module.exports = /** @type {typeof import('./enet').Enet} */ (enetcppjs);
