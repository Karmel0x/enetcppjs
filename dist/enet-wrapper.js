"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var enet_wrapper_exports = {};
__export(enet_wrapper_exports, {
  default: () => enet_wrapper_default,
  eventType: () => eventType,
  packetFlag: () => packetFlag
});
module.exports = __toCommonJS(enet_wrapper_exports);
var import_enetcppjs = __toESM(require("../bindings/prebuilds/win32-x64/enetcppjs.node"));
const packetFlag = {
  /** packet must be received by the target peer and resend attempts should be
   * made until the packet is delivered */
  reliable: 1 << 0,
  /** packet will not be sequenced with other packets
   * not supported for reliable packets */
  unsequenced: 1 << 1,
  /** packet will not allocate data, and user must supply it instead */
  noAllocate: 1 << 2
};
const eventType = {
  /** no event occurred within the specified time limit */
  none: 0,
  /** a connection request initiated by enet_host_connect has completed.
    * The peer field contains the peer which successfully connected. 
    */
  connect: 1,
  /** a peer has disconnected. This event is generated on a successful 
    * completion of a disconnect initiated by enet_pper_disconnect, if 
    * a peer has timed out, or if a connection request intialized by 
    * enet_host_connect has timed out. The peer field contains the peer 
    * which disconnected. The data field contains user supplied data 
    * describing the disconnection, or 0, if none is available.
    */
  disconnect: 2,
  /** a packet has been received from a peer. The peer field specifies the
    * peer which sent the packet. The channelID field specifies the channel
    * number upon which the packet was received. The packet field contains
    * the packet that was received; this packet must be destroyed with
    * enet_packet_destroy after use.
    */
  receive: 3
};
var enet_wrapper_default = import_enetcppjs.default;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  eventType,
  packetFlag
});
//# sourceMappingURL=enet-wrapper.js.map
