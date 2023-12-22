# enetcppjs

modified [enet](https://github.com/lsalzman/enet) library with nodejs bindings  
especially made for [LeagueEmulatorJS](https://github.com/Karmel0x/LeagueEmulatorJS)

enet source:  
[github.com/LeagueSandbox/ENetSharpLeague/tree/indev/ENet](https://github.com/LeagueSandbox/ENetSharpLeague/tree/indev/ENet)

# Usage
check [examples](examples)

# Build
```
cd bindings
npm install -g node-gyp
node-gyp configure
node-gyp build
```
