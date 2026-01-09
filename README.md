# enetcppjs

modified [enet](https://github.com/lsalzman/enet) library with nodejs bindings  
especially made for [LeagueEmulatorJS](https://github.com/Karmel0x/LeagueEmulatorJS)

enet source:  
[github.com/LeagueSandbox/ENetSharpLeague/tree/indev/ENet](https://github.com/LeagueSandbox/ENetSharpLeague/tree/indev/ENet)

# Usage
check [examples](examples)

# Build
```
# requires node.js and python3
npm install -g node-gyp

cd bindings
node-gyp configure
node-gyp build --release
```

```
cd ..
npm run build
```

# Linux
change `win32` to `linux` in `src\enet-wrapper.ts` and run `npm run build`

# Todo
- use `node-gyp-build` with `prebuildify`
