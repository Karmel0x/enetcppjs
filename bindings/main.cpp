#include <stdio.h>
#include <string>
#include <cstring>
#include <enet/enet.h>
#include <blowfish.h>
#include <base64.h>


ENetHost* _server;
BlowFish* _blowfish;

bool initialize(int port = 5119, std::string host = "127.0.0.1", std::string blowfishKey = "17BLOhi6KZsTtldTsizvHg==") {

	if (enet_initialize() != 0)
		return false;

	atexit(enet_deinitialize);

	ENetAddress address;
	enet_address_set_host(&address, host.c_str());
	address.port = port;

	_server = enet_host_create(&address, 32, 0, 0);
	if (_server == NULL)
		return false;

	std::string key = base64_decode(blowfishKey);
	if (key.length() <= 0)
		return false;

	_blowfish = new BlowFish((unsigned char*)key.c_str(), 16);
	return true;
}

bool initialize_client(int port = 5119, std::string host = "127.0.0.1", std::string blowfishKey = "17BLOhi6KZsTtldTsizvHg==") {

	if (enet_initialize() != 0)
		return false;

	atexit(enet_deinitialize);
	
	_server = enet_host_create(NULL, 1, 0, 0);
	if (_server == NULL)
		return false;

	std::string key = base64_decode(blowfishKey);
	if (key.length() <= 0)
		return false;

	_blowfish = new BlowFish((unsigned char*)key.c_str(), 16);

	ENetAddress address;
	ENetPeer* peer;

	enet_address_set_host(&address, host.c_str());
	address.port = port;

	peer = enet_host_connect(_server, &address, 8);
	if (peer == NULL) {
		fprintf(stderr, "No available peers for initiating an ENet connection.\n");
		return false;
	}

	return true;
}

ENetPeer* peers[10];
int peers_count = 0;
int packet_count[] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
int packet_count2[] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };

int peer_num_by_peer(ENetPeer* peer) {
	for (int i = 0; i < 10; i++)
		if (peers[i] == peer)
			return i;
	return -1;
}

ENetEvent netLoop() {
	ENetEvent event;

	if (enet_host_service(_server, &event, 0) > 0) {
		int peer_num = 0;
		switch (event.type) {
		case ENET_EVENT_TYPE_CONNECT:
			//printf("A new client connected: %i.%i.%i.%i:%i", event.peer->address.host & 0xFF, (event.peer->address.host >> 8) & 0xFF, (event.peer->address.host >> 16) & 0xFF, (event.peer->address.host >> 24) & 0xFF, event.peer->address.port);
			printf("ENET_EVENT_TYPE_CONNECT peer_num:%d\n", peers_count);
			event.peer->mtu = 996;
			event.data = 0;
			peers[peers_count] = event.peer;
			peers_count++;
			return event;

		case ENET_EVENT_TYPE_RECEIVE:
			peer_num = peer_num_by_peer(event.peer);
			//currentPeer = event.peer;
			//printf("ENET_EVENT_TYPE_RECEIVE peer_num:%d, packet_count:%d, packet_count2:%d, sessionID:%d\n", peer_num, packet_count[peer_num], packet_count2[peer_num], event.peer->sessionID);

			if (event.packet->dataLength >= 8
				&& ++packet_count[peer_num] > 1// Decrypt if player already exist
				//&& event.peer->data
				)
				_blowfish->Decrypt(event.packet->data, event.packet->dataLength - (event.packet->dataLength % 8));// Encrypt everything minus the last bytes that overflow the 8 byte boundary

			return event;

			//enet_packet_destroy(event.packet);

		case ENET_EVENT_TYPE_DISCONNECT: //enet_peer_disconnect(event.peer, 0);
			peer_num = peer_num_by_peer(event.peer);
			packet_count[peer_num] = 0;//handleDisconnect(event.peer);
			packet_count2[peer_num] = 0;
			printf("ENET_EVENT_TYPE_DISCONNECT\n");
			delete event.peer->data;
			return event;
		}
	}
	return event;
}

bool sendPacket(ENetPeer* peer, const unsigned char* source, uint32 length, unsigned char channelNo, uint32 flag = ENET_PACKET_FLAG_RELIABLE, int peer_num = 0) {
	//for(int i = 0; i < length; i++)
	//	printf("%02X ", source[i]);
	////PDEBUG_LOG_LINE(Logging," Sending packet:\n");
	//if(length < 300)
	//	printPacket(data, length);

	unsigned char* data = new unsigned char[length];
	memcpy(data, source, length);

	//if (length >= 8 && ++packet_count2[peer_num] > 1)
	if (length >= 8 && ++packet_count[peer_num] > 1)
		_blowfish->Encrypt(data, length - (length % 8)); //Encrypt everything minus the last bytes that overflow the 8 byte boundary

	ENetPacket* packet = enet_packet_create(data, length, flag);
	if (enet_peer_send(peer, channelNo, packet) < 0) {
		delete[] data;
		//PDEBUG_LOG_LINE(Logging,"Warning fail, send!");
		return false;
	}

	delete[] data;
	return true;
}

bool sendPacket(int peer, unsigned char* source, size_t length, unsigned char channelNo, uint32 flag = ENET_PACKET_FLAG_RELIABLE) {
	return sendPacket(peers[peer], source, length, channelNo, flag, peer);
}

#include <node_api.h>

napi_value sendPacket_buffer(napi_env env, napi_callback_info info) {
	size_t argc = 3;
	napi_value args[3];
	napi_get_cb_info(env, info, &argc, args, NULL, NULL);

	int peerNum;
	napi_get_value_int32(env, args[0], &peerNum);

	unsigned char* data;
	size_t length;
	napi_get_buffer_info(env, args[1], (void**)&data, &length);

	unsigned int channel;
	napi_get_value_uint32(env, args[2], &channel);

	bool ret = sendPacket(peerNum, data, length, channel);

	napi_value value;
	napi_create_int32(env, ret, &value);
	return value;
}

napi_value sendPacket_arrayBuffer(napi_env env, napi_callback_info info) {
	size_t argc = 3;
	napi_value args[3];
	napi_get_cb_info(env, info, &argc, args, NULL, NULL);

	int peerNum;
	napi_get_value_int32(env, args[0], &peerNum);

	unsigned char* data;
	size_t length;
	napi_get_arraybuffer_info(env, args[1], (void**)&data, &length);

	unsigned int channel;
	napi_get_value_uint32(env, args[2], &channel);

	bool ret = sendPacket(peerNum, data, length, channel);

	napi_value value;
	napi_create_int32(env, ret, &value);
	return value;
}

napi_value netLoop_buffer(napi_env env, napi_callback_info info) {

	ENetEvent event = netLoop();

	napi_value obj;
	napi_create_object(env, &obj);

	napi_value value;

	if (event.type) {
		napi_create_uint32(env, (int)event.type, &value);
		napi_set_named_property(env, obj, "type", value);
	}
	if (event.channelID) {
		napi_create_uint32(env, (int)event.channelID, &value);
		napi_set_named_property(env, obj, "channel", value);
	}
	if (event.packet) {
		napi_create_external_buffer(env, event.packet->dataLength, event.packet->data, NULL, NULL, &value);
		napi_set_named_property(env, obj, "buffer", value);
	}
	if (event.peer) {
		int peerNum = peer_num_by_peer(event.peer);
		napi_create_int32(env, (int)peerNum, &value);
		napi_set_named_property(env, obj, "peer_num", value);
	}

	return obj;
}

napi_value netLoop_arrayBuffer(napi_env env, napi_callback_info info) {

	ENetEvent event = netLoop();

	napi_value obj;
	napi_create_object(env, &obj);

	napi_value value;

	if (event.type) {
		napi_create_uint32(env, (int)event.type, &value);
		napi_set_named_property(env, obj, "type", value);
	}
	if (event.channelID) {
		napi_create_uint32(env, (int)event.channelID, &value);
		napi_set_named_property(env, obj, "channel", value);
	}
	if (event.packet) {
		napi_create_external_arraybuffer(env, event.packet->data, event.packet->dataLength, NULL, NULL, &value);
		napi_set_named_property(env, obj, "buffer", value);
	}
	if (event.peer) {
		int peerNum = peer_num_by_peer(event.peer);
		napi_create_int32(env, (int)peerNum, &value);
		napi_set_named_property(env, obj, "peerNum", value);
	}

	return obj;
}

napi_value initialize1(napi_env env, napi_callback_info info) {
	size_t argc = 3;
	napi_value args[3];
	napi_get_cb_info(env, info, &argc, args, NULL, NULL);

	int port;
	napi_get_value_int32(env, args[0], &port);

	char host[50];
	size_t length_host;
	napi_get_value_string_latin1(env, args[1], host, 50, &length_host);

	char blowfishKey[50];
	size_t length_blowfishKey;
	napi_get_value_string_latin1(env, args[2], blowfishKey, 50, &length_blowfishKey);

	int ret = initialize(port, std::string(host), std::string(blowfishKey));

	napi_value value;
	napi_create_int32(env, ret, &value);
	return value;
}

napi_value initializeClient1(napi_env env, napi_callback_info info) {
	size_t argc = 3;
	napi_value args[3];
	napi_get_cb_info(env, info, &argc, args, NULL, NULL);

	int port;
	napi_get_value_int32(env, args[0], &port);

	char host[50];
	size_t length_host;
	napi_get_value_string_latin1(env, args[1], host, 50, &length_host);

	char blowfishKey[50];
	size_t length_blowfishKey;
	napi_get_value_string_latin1(env, args[2], blowfishKey, 50, &length_blowfishKey);

	int ret = initialize_client(port, std::string(host), std::string(blowfishKey));

	napi_value value;
	napi_create_int32(env, ret, &value);
	return value;
}

napi_value Init(napi_env env, napi_value exports) {

	napi_value fn;

	napi_create_function(env, NULL, 0, initialize1, NULL, &fn);
	napi_set_named_property(env, exports, "initialize", fn);

	napi_create_function(env, NULL, 0, initializeClient1, NULL, &fn);
	napi_set_named_property(env, exports, "initialize_client", fn);

	napi_create_function(env, NULL, 0, netLoop_buffer, NULL, &fn);
	napi_set_named_property(env, exports, "netLoop_buffer", fn);

	napi_create_function(env, NULL, 0, sendPacket_buffer, NULL, &fn);
	napi_set_named_property(env, exports, "sendPacket_buffer", fn);

	napi_create_function(env, NULL, 0, netLoop_arrayBuffer, NULL, &fn);
	napi_set_named_property(env, exports, "netLoop_arrayBuffer", fn);

	napi_create_function(env, NULL, 0, sendPacket_arrayBuffer, NULL, &fn);
	napi_set_named_property(env, exports, "sendPacket_arrayBuffer", fn);

	//napi_create_function(env, NULL, 0, netLoop_dataView, NULL, &fn);
	//napi_set_named_property(env, exports, "netLoop_dataView", fn);

	//napi_create_function(env, NULL, 0, sendPacket_dataView,, NULL, &fn);
	//napi_set_named_property(env, exports, "sendPacket_dataView,", fn);

	//napi_create_function(env, NULL, 0, SayHello3, NULL, &fn);
	//napi_set_named_property(env, exports, "sayHello3", fn);

	napi_create_int32(env, (int)ENET_EVENT_TYPE_NONE, &fn);
	napi_set_named_property(env, exports, "ENET_EVENT_TYPE_NONE", fn);
	napi_create_int32(env, (int)ENET_EVENT_TYPE_CONNECT, &fn);
	napi_set_named_property(env, exports, "ENET_EVENT_TYPE_CONNECT", fn);
	napi_create_int32(env, (int)ENET_EVENT_TYPE_DISCONNECT, &fn);
	napi_set_named_property(env, exports, "ENET_EVENT_TYPE_DISCONNECT", fn);
	napi_create_int32(env, (int)ENET_EVENT_TYPE_RECEIVE, &fn);
	napi_set_named_property(env, exports, "ENET_EVENT_TYPE_RECEIVE", fn);

	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
