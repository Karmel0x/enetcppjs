{
    "targets": [{
        "target_name": "enetcppjs",
        "sources": [
            "../libs/enet/callbacks.c",
            "../libs/enet/host.c",
            "../libs/enet/list.c",
            "../libs/enet/packet.c",
            "../libs/enet/peer.c",
            "../libs/enet/protocol.c",
            "../libs/enet/unix.c",
            "../libs/enet/win32.c",
            "../libs/intlib/blowfish.cpp",
            "../libs/intlib/base64.cpp",
            "main.cpp"
        ],
        "include_dirs": [
            "../libs/enet/include",
            "../libs/intlib"
        ],
        "cflags!": ["-fno-exceptions"],
        "cflags_cc!": ["-fno-exceptions"],
        "defines": ["NAPI_CPP_EXCEPTIONS", "ENET_CHECKSUM"],
        "conditions": [
            ["OS == 'win'", {
                "libraries": [
                    "-lws2_32.lib",
                    "-lwinmm.lib"
                ]
            }],
            ["OS == 'linux'", {
                "target_name": "enetcppjs-linux"
            }]
        ]
    }]
}
