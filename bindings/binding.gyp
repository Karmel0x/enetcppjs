{
  "targets": [
    {
      "target_name": "enetcppjs",
      "sources": [
        "../enet/callbacks.c",
        "../enet/host.c",
        "../enet/list.c",
        "../enet/packet.c",
        "../enet/peer.c",
        "../enet/protocol.c",
        "../enet/unix.c",
        "../enet/win32.c",
        "../intlib/blowfish.cpp",
        "../intlib/base64.cpp",
        "main.cpp"
      ],
      "include_dirs": [
		'../enet/include',
		'../intlib'
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": ["NAPI_CPP_EXCEPTIONS", "ENET_CHECKSUM"],
      "libraries": [
        "-lws2_32.lib",
        "-lwinmm.lib"
      ]
    }
  ]
}