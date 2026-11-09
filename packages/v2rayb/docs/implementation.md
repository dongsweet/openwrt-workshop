# v2rayB Implementation

The canonical package payload is `files/`; the Makefile at the package root
builds both the core and LuCI packages.

## Current Scope

- SQLite-backed manual nodes, profiles, and runtime settings.
- Generated V2Ray and MosDNS configs under `/tmp/v2rayB/active/`.
- DNS switching with rollback, an owned nftables table, and a DNS watchdog.
- Watchdog cooldown timestamp persisted under `/tmp` across watchdog restarts.
- JavaScript LuCI page backed by a narrow rpcd/ucode API and explicit read/write ACLs.
- Structured node editor for VLESS, VMess, Trojan, Shadowsocks, TLS/Reality,
  TCP/WS/H2/gRPC and mux settings; outbound JSON is generated internally.
- No Lua controller, Lua template, or `luci-compat` dependency.
- Exact Google Play GGC regex routing; existing pass and other domain policies
  remain in dnsmasq and are not copied into MosDNS.

Subscription download/update and automatic import of captured legacy JSON files
are intentionally outside the current scope. The optional importer normalizes an
explicitly selected file into the application database; it does not use raw
legacy JSON at runtime.

See the package README for current device state and cutover guidance.

## Local Tests

Run from the package root:

```sh
python3 tests/test_schema.py
python3 tests/test_import.py
python3 tests/test_rules.py
python3 tests/test_luci.py
sh tests/test_render.sh
sh tests/test_lifecycle.sh
```

The importer test uses only sanitized fixtures under `tests/fixtures/` and a
temporary database. It does not read router snapshots or write device
configuration.
