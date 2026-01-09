"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var enet_exports = {};
__export(enet_exports, {
  EnetSocket: () => EnetSocket,
  default: () => Enet
});
module.exports = __toCommonJS(enet_exports);
var import_enet_wrapper = __toESM(require("./enet-wrapper"));
var import_utils = require("./utils");
class EnetSocket {
  static {
    __name(this, "EnetSocket");
  }
  static packetFlag = import_enet_wrapper.packetFlag;
  static eventType = import_enet_wrapper.eventType;
  static freePacket(packet) {
    import_enet_wrapper.default.freePacket(packet);
  }
  socket;
  netLoopRunning = false;
  constructor(socket = void 0) {
    this.socket = socket || import_enet_wrapper.default.createSocket();
    if (!this.socket)
      throw new Error("Failed to initialize enet socket");
  }
  bind(port, ip) {
    const binded = import_enet_wrapper.default.bind(this.socket, port, ip);
    if (!binded)
      throw new Error("Failed to bind socket");
  }
  destroy() {
    this.netLoopRunning = false;
    import_enet_wrapper.default.destroy(this.socket);
  }
  connect(port, ip) {
    const peer = import_enet_wrapper.default.connect(this.socket, port, ip);
    if (!peer)
      throw new Error("Failed to connect socket");
  }
  disconnect(peerNum, soon = false) {
    import_enet_wrapper.default.disconnect(this.socket, peerNum, soon);
  }
  send(peerNum, data, channel = 0, flags = import_enet_wrapper.packetFlag.reliable) {
    return import_enet_wrapper.default.send(this.socket, peerNum, data, channel, flags);
  }
  service() {
    return import_enet_wrapper.default.service(this.socket);
  }
  async netLoop(callback) {
    if (this.netLoopRunning)
      return;
    this.netLoopRunning = true;
    for (; ; ) {
      if (!this.netLoopRunning)
        break;
      const msg = this.service();
      if (!msg.type) {
        await (0, import_utils.delay)(1);
        continue;
      }
      callback(msg);
    }
  }
  setBlowfish(peerNum, base64Key) {
    import_enet_wrapper.default.setBlowfish(this.socket, peerNum, base64Key);
  }
}
class Enet {
  static {
    __name(this, "Enet");
  }
  static createSocket() {
    const enet = new EnetSocket();
    return enet;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnetSocket
});
//# sourceMappingURL=enet.js.map
