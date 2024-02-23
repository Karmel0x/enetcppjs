
#include <string>
#include <vector>
#include <algorithm>
#include <map>
#include <enet/enet.h>
#include <blowfish.h>
#include <base64.h>

struct EnetSocketEvent {
    ENetEvent event;
    unsigned int peerNum;
};

class EnetSocket {
public:
    static bool initialized;

    static bool initialize() {
        if (!initialized) {
            if (enet_initialize() != 0)
                return false;

            atexit(enet_deinitialize);
            initialized = true;
        }
        return true;
    }

    static void freePacket(ENetPacket* packet) {
        enet_packet_destroy(packet);
    }

    ENetHost* enetHost;
    std::vector<ENetPeer*> peers;
    std::vector<BlowFish*> encrypters;
    std::map<std::string, BlowFish*> encryptersMap;

    EnetSocket() : enetHost(nullptr) {}

    bool bind(uint16_t port, const char* host) {
        ENetAddress address;
        enet_address_set_host(&address, host);
        address.port = port;

        enetHost = enet_host_create(&address, 32, 0, 0);
        if (enetHost == nullptr)
            return false;

        return true;
    }

    void destroy() {
        if (enetHost != nullptr) {
            enet_host_destroy(enetHost);
            enetHost = nullptr;
        }
    }

    ENetPeer* connect(uint16_t port, const char* host) {
        enetHost = enet_host_create(nullptr, 1, 0, 0);
        if (enetHost == nullptr)
            return nullptr;

        ENetAddress address;
        enet_address_set_host(&address, host);
        address.port = port;

        auto peer = enet_host_connect(enetHost, &address, 8);
        //if (peer == nullptr)
        //    return nullptr;

        return peer;
    }

    void disconnect(ENetPeer* peer, bool soon = false) {
        if (peer != nullptr) {
            if (soon)
                enet_peer_disconnect_later(peer, 0);
            else
                enet_peer_disconnect(peer, 0);
        }
    }

    void disconnect(unsigned int peerNum, bool soon = false) {
        auto peer = peers[peerNum];
        disconnect(peer, soon);
    }

    bool sendData(ENetPeer* peer, unsigned char* data, size_t length, enet_uint8 channel, enet_uint32 flag = ENET_PACKET_FLAG_RELIABLE) {
        if (peer == nullptr)
            return false;

        //fprintf(stderr, "sending %u bytes to %u on channel %u\n", length, peer, channel);
        //fprintf(stderr, "bytes: ");
        //for (int i = 0; i < length; i++)
        //    fprintf(stderr, "%02x ", data[i]);
        //fprintf(stderr, "\n");

        auto packet = enet_packet_create(data, length, flag);
        if (enet_peer_send(peer, channel, packet) != 0)
            return false;

        return true;
    }

    bool send(unsigned int peerNum, unsigned char* data, size_t length, enet_uint8 channel, enet_uint32 flag = ENET_PACKET_FLAG_RELIABLE) {
        auto peer = peers[peerNum];
        if (peer == nullptr)
            return false;

        encrypt(data, length, peerNum);
        //fprintf(stderr, "sending %u bytes to %u on channel %u\n", length, peerNum, channel);
        return sendData(peer, data, length, channel, flag);
    }

    EnetSocketEvent service() {
        ENetEvent event;
        unsigned int peerNum = 0;

        if (enet_host_service(enetHost, &event, 0) > 0) {
            switch (event.type) {
            case ENET_EVENT_TYPE_NONE:
                break;
            case ENET_EVENT_TYPE_CONNECT:
                //fprintf(stderr, "peer %u connected\n", event.peer);
                event.peer->mtu = 996;
                event.data = 0;
                peers.push_back(event.peer);
                encrypters.push_back(nullptr);
                peerNum = std::distance(peers.begin(), std::find(peers.begin(), peers.end(), event.peer));
                break;

            case ENET_EVENT_TYPE_RECEIVE:
                //fprintf(stderr, "packet of length %u was received from %u on channel %u\n",
                //    event.packet->dataLength, event.peer, event.channelID);
                peerNum = std::distance(peers.begin(), std::find(peers.begin(), peers.end(), event.peer));
                decrypt(event.packet->data, event.packet->dataLength, peerNum);
                break;

            case ENET_EVENT_TYPE_DISCONNECT:
                //fprintf(stderr, "peer %u disconnected\n", event.peer);
                peerNum = std::distance(peers.begin(), std::find(peers.begin(), peers.end(), event.peer));
                peers[peerNum] = nullptr;
                encrypters[peerNum] = nullptr;
                delete event.peer->data;
                break;
            }
        }

        EnetSocketEvent socketEvent;
        socketEvent.event = event;
        socketEvent.peerNum = peerNum;
        return socketEvent;
    }

    void encrypt(unsigned char* source, size_t length, unsigned int peerNum = 0) {
        if (length >= 8) {
            auto blowfish = encrypters[peerNum];
            if (blowfish != nullptr) {
                //fprintf(stderr, "encrypting %u bytes\n", length);
                blowfish->Encrypt(source, length - (length % 8)); // everything minus the last bytes that overflow the 8 byte boundary
            }
        }
    }

    void decrypt(unsigned char* source, size_t length, unsigned int peerNum = 0) {
        if (length >= 8) {
            auto blowfish = encrypters[peerNum];
            if (blowfish != nullptr) {
                //fprintf(stderr, "decrypting %u bytes\n", length);
                blowfish->Decrypt(source, length - (length % 8)); // everything minus the last bytes that overflow the 8 byte boundary
            }
        }
    }

    void setBlowfish(unsigned int peerNum, BlowFish* blowfish) {
        //fprintf(stderr, "setting blowfish for peer %u to %u\n", peerNum, blowfish);
        encrypters[peerNum] = blowfish;
    }

    void setBlowfish(unsigned int peerNum, std::string blowfishKey) {
        if (blowfishKey.length() <= 0) {
            setBlowfish(peerNum, nullptr);
            return;
        }

        if (encryptersMap.find(blowfishKey) == encryptersMap.end()) {
            std::string key = base64_decode(blowfishKey);
            if (key.length() <= 0)
                return;

            BlowFish* blowfish = new BlowFish((unsigned char*)key.c_str(), 16);
            encryptersMap[blowfishKey] = blowfish;
        }

        setBlowfish(peerNum, encryptersMap[blowfishKey]);
    }
};

bool EnetSocket::initialized = false;

#include <node_api.h>

napi_value createSocket(napi_env env, napi_callback_info info) {
    EnetSocket::initialize();
    EnetSocket* socket = new EnetSocket();

    napi_value socketAddress;
    napi_create_external(env, socket, nullptr, nullptr, &socketAddress);
    return socketAddress;
}

napi_value bind(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    int32_t port;
    napi_get_value_int32(env, args[1], &port);

    char* ip;
    size_t ipLength;
    napi_get_value_string_latin1(env, args[2], nullptr, 0, &ipLength);
    ip = new char[ipLength + 1];
    napi_get_value_string_latin1(env, args[2], ip, ipLength + 1, &ipLength);

    bool ret = socket->bind(port, ip);

    delete[] ip;

    napi_value value;
    napi_get_boolean(env, ret, &value);
    return value;
}

napi_value destroy(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    socket->destroy();

    return nullptr;
}

napi_value connect(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    int32_t port;
    napi_get_value_int32(env, args[1], &port);

    char* ip;
    size_t ipLength;
    napi_get_value_string_latin1(env, args[2], nullptr, 0, &ipLength);
    ip = new char[ipLength + 1];
    napi_get_value_string_latin1(env, args[2], ip, ipLength + 1, &ipLength);

    auto peer = socket->connect(port, ip);

    delete[] ip;

    napi_value peerValue;

    if (peer != nullptr)
        napi_create_external(env, peer, nullptr, nullptr, &peerValue);

    return peerValue;
}

napi_value disconnect(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    unsigned int peerNum;
    napi_get_value_uint32(env, args[1], &peerNum);

    bool soon;
    napi_get_value_bool(env, args[2], &soon);

    socket->disconnect(peerNum, soon);

    return nullptr;
}

napi_value send(napi_env env, napi_callback_info info) {
    size_t argc = 5;
    napi_value args[5];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    unsigned int peerNum;
    napi_get_value_uint32(env, args[1], &peerNum);

    unsigned char* data;
    size_t length;
    napi_get_arraybuffer_info(env, args[2], (void**)&data, &length);

    unsigned int channel;
    napi_get_value_uint32(env, args[3], &channel);

    uint32_t flag;
    napi_get_value_uint32(env, args[4], &flag);

    bool ret = socket->send(peerNum, data, length, channel, flag);

    napi_value value;
    napi_get_boolean(env, ret, &value);
    return value;
}

// TODO: promise?
napi_value service(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    auto socketEvent = socket->service();
    auto event = socketEvent.event;
    auto peerNum = socketEvent.peerNum;

    napi_value eventValue;
    napi_create_object(env, &eventValue);

    napi_value typeValue;
    napi_create_int32(env, event.type, &typeValue);
    napi_set_named_property(env, eventValue, "type", typeValue);

    if (event.type > ENET_EVENT_TYPE_NONE) {
        napi_value peerNumValue;
        napi_create_int32(env, peerNum, &peerNumValue);
        napi_set_named_property(env, eventValue, "peerNum", peerNumValue);

        if (event.type == ENET_EVENT_TYPE_RECEIVE) {
            napi_value channelValue;
            napi_create_uint32(env, event.channelID, &channelValue);
            napi_set_named_property(env, eventValue, "channel", channelValue);

            napi_value packetAddress;
            napi_create_external(env, event.packet, nullptr, nullptr, &packetAddress);
            napi_set_named_property(env, eventValue, "packet", packetAddress);

            napi_value dataValue;
            napi_create_external_arraybuffer(env, event.packet->data, event.packet->dataLength, nullptr, nullptr, &dataValue);
            napi_set_named_property(env, eventValue, "data", dataValue);
        }
    }

    return eventValue;
}

napi_value freePacket(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    ENetPacket* packet;
    napi_get_value_external(env, args[0], (void**)&packet);

    EnetSocket::freePacket(packet);

    return nullptr;
}

napi_value setBlowfish(napi_env env, napi_callback_info info) {
    size_t argc = 3;
    napi_value args[3];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    EnetSocket* socket;
    napi_get_value_external(env, args[0], (void**)&socket);

    unsigned int peerNum;
    napi_get_value_uint32(env, args[1], &peerNum);

    char* key;
    size_t keyLength;
    napi_get_value_string_latin1(env, args[2], nullptr, 0, &keyLength);
    key = new char[keyLength + 1];
    napi_get_value_string_latin1(env, args[2], key, keyLength + 1, &keyLength);

    socket->setBlowfish(peerNum, key);

    delete[] key;

    return nullptr;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor descriptors[] = {
        { "createSocket", 0, createSocket, 0, 0, 0, napi_default, 0 },
        { "bind", 0, bind, 0, 0, 0, napi_default, 0 },
        { "destroy", 0, destroy, 0, 0, 0, napi_default, 0 },
        { "connect", 0, connect, 0, 0, 0, napi_default, 0 },
        { "disconnect", 0, disconnect, 0, 0, 0, napi_default, 0 },
        { "send", 0, send, 0, 0, 0, napi_default, 0 },
        { "service", 0, service, 0, 0, 0, napi_default, 0 },
        { "freePacket", 0, freePacket, 0, 0, 0, napi_default, 0 },
        { "setBlowfish", 0, setBlowfish, 0, 0, 0, napi_default, 0 },
    };
    napi_define_properties(env, exports, sizeof(descriptors) / sizeof(*descriptors), descriptors);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
