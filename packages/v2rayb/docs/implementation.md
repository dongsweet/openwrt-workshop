# v2rayB Implementation

The canonical package payload is `files/`; the Makefile at the package root
builds both the core and LuCI packages.

## Current Scope

- SQLite-backed manual nodes, profiles, and runtime settings.
- Generated V2Ray and MosDNS configs under `/tmp/v2rayB/active/`.
- DNS switching with rollback, an owned nftables table, and a DNS watchdog.
- Watchdog cooldown timestamp persisted under `/tmp` across watchdog restarts.
- JavaScript LuCI page backed by a narrow rpcd/ucode API and explicit read/write ACLs.
- Router-originated DNS/HTTP(S) diagnostics with observed socket and kernel route data.
- Structured node editor for VLESS, VMess, Trojan, Shadowsocks, TLS/Reality,
  TCP/WS/H2/gRPC and mux settings; outbound JSON is generated internally.
- Subscription sources with HTTP(S) download, URI/Base64 parsing, transactional
  node replacement, failure preservation, and manual LuCI refresh.
- No Lua controller, Lua template, or `luci-compat` dependency.
- Exact Google Play GGC regex routing; existing pass and other domain policies
  remain in dnsmasq and are not copied into MosDNS.

The first subscription implementation accepts plain URI lines or a Base64-
encoded URI list for VLESS, VMess, Trojan, and Shadowsocks. Raw subscription
payloads are cached under `/etc/v2rayB/subscriptions/`; parsed nodes are stored
under their subscription source and are shown separately from manual nodes.
JSON subscription formats and automatic periodic refresh remain future work.
The optional legacy importer normalizes an explicitly selected file into the
application database; it does not use raw legacy JSON at runtime.

See the package README for current device state and cutover guidance.

## Deployment Workflow

Use the package build and install path for every router update:

1. Change and test the source in this repository.
2. Commit and push the change.
3. Increment `PKG_RELEASE` in `Makefile`.
4. Build `package/v2rayb/compile` in the matching SDK.
5. Back up the router database and managed files.
6. Install the generated `.apk` files with `apk`.
7. Verify the installed package version, file checksums, RPC methods, and
   database counts on the router.

Do not deploy by copying individual files into `/www` or `/usr/share/rpcd`.
Direct file replacement bypasses package metadata and can leave browser or
service caches serving a mixture of versions.

## Local Tests

Run from the package root:

```sh
python3 tests/test_schema.py
python3 tests/test_import.py
python3 tests/test_rules.py
python3 tests/test_luci.py
sh tests/test_subscription.sh
sh tests/test_network_probe.sh
sh tests/test_render.sh
sh tests/test_lifecycle.sh
sh tests/test_migration.sh
sh tests/test_draft.sh
```

The importer test uses only sanitized fixtures under `tests/fixtures/` and a
temporary database. It does not read router snapshots or write device
configuration.
