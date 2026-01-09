"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var enet_using_events_exports = {};
__export(enet_using_events_exports, {
  EnetSocketUsingEvents: () => EnetSocketUsingEvents,
  default: () => EnetUsingEvents
});
module.exports = __toCommonJS(enet_using_events_exports);
var import_node_events = require("node:events");
var import_enet = require("./enet");
var import_enet_wrapper = require("./enet-wrapper");
class EnetSocketUsingEvents extends import_enet.EnetSocket {
  static {
    __name(this, "EnetSocketUsingEvents");
  }
  eventEmitter = new import_node_events.EventEmitter();
  eventLoop() {
    super.netLoop((msg) => {
      if (msg.type === import_enet_wrapper.eventType.connect) {
        this.emit("connect", msg.peerNum);
      } else if (msg.type === import_enet_wrapper.eventType.disconnect) {
        this.emit("disconnect", msg.peerNum);
      } else if (msg.type === import_enet_wrapper.eventType.receive) {
        this.emit("receive", msg.peerNum, msg.data, msg.channel);
      }
    });
  }
  bind(port, ip) {
    super.bind(port, ip);
    this.eventLoop();
  }
  connect(port, ip) {
    super.connect(port, ip);
    this.eventLoop();
  }
  on(event, listener) {
    this.eventEmitter.on(event, listener);
    return this;
  }
  once(event, listener) {
    this.eventEmitter.once(event, listener);
    return this;
  }
  off(event, listener) {
    this.eventEmitter.off(event, listener);
    return this;
  }
  emit(event, ...args) {
    this.eventEmitter.emit(event, ...args);
    return this;
  }
}
class EnetUsingEvents {
  static {
    __name(this, "EnetUsingEvents");
  }
  static createSocket() {
    const enet = new EnetSocketUsingEvents();
    return enet;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EnetSocketUsingEvents
});
//# sourceMappingURL=enet-using-events.js.map
