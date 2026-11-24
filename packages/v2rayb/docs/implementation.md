# v2rayB Implementation

The canonical package payload is `files/`; the Makefile at the package root
builds both the core and LuCI packages.

## Current Scope

- SQLite-backed manual nodes, profiles, and runtime settings.
- Generated proxy-engine and MosDNS configs under `/tmp/v2rayB/active/`.
- A global IPv4/CIDR source bypass that preserves policy-routed LAN traffic.
- A per-profile force-proxy domain list backed by dnsmasq nftset population and
  nftables rules ordered before direct/pass returns. The generated engine config
  uses route-only TLS/HTTP sniffing and exact domain routing before `geoip:cn`,
  preventing a forced domain from becoming direct again inside the engine;
  switching profiles also switches this policy.
- Optional per-profile UDP TPROXY on an independent destination-port list and
  listener port. It uses fwmark `0x5642`, routing table `164`, `nft_tproxy`,
  and IPv4/IPv6 local routes; cleanup is part of every takeover withdrawal.
  The engine proxy outbound carries mark `22083`, which exits the router-output
  redirect before policy routing to prevent a root-run engine loop.
- DNS switching with rollback, an owned nftables table, and an optional
  proxy-connectivity watchdog. Every runtime dnsmasq config transition uses
  restart, never reload, because HUP does not reliably parse newly created
  `conf-dir` files; all files for a transition are written first so dnsmasq
  restarts once, and v2rayB waits for the DNS listener before continuing.
- The last watchdog fallback timestamp is kept under `/tmp` across watchdog
  restarts; it does not automatically resume a suspended proxy.
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
Each subscription can enable or disable IPv4-only downloading. Downloads run in
an unprivileged helper. Subscription hostnames use the global direct-DNS upstream
list and their addresses are added to the v2rayB direct sets so retries bypass
the router traffic proxy; proxy traffic itself is not affected.

The active profile owns the engine choice (`v2ray` or `xray`). The lifecycle
resolves the binary and config-test mode from the applied profile, with Xray
using `/usr/share/v2ray` for geo data.
A global, ordered direct-DNS upstream list is shared by node bootstrap, subscription
downloads and the MosDNS direct branch. Each profile policy stores the transparent
proxy listener port, the connectivity probe enable flag, and the probe port. When the probe is enabled, an isolated local
SOCKS inbound completes an HTTPS request through the selected proxy before traffic
redirection and DNS switching are enabled. Startup rolls back if this probe fails.
When disabled, traffic and DNS are imported without an end-to-end proxy check.

The watchdog is an optional global setting, saved through the same draft transaction
as service and profile changes. It starts only when the global watchdog setting
and the active profile's connectivity probe are both enabled. A disabled profile
probe also suppresses the startup check and the health-probe inbound.
When continuous monitoring is enabled, three consecutive probe failures move the
service to `suspended`,
restore the dnsmasq baseline, remove the v2rayB nftables table and stop the managed
MosDNS while retaining the enabled service setting, proxy engine and watchdog.
If any fail-open cleanup step fails, a runtime marker keeps the watchdog probing
and retrying cleanup while the visible state is `degraded` or `stopping`.
The watchdog continues probing. When `watchdog_restart_engine=1`, repeated
probe failures in suspended restart an engine whose PID still exists. Restarts
are limited to one per five-minute backoff, after which the startup probe is
repeated. A missing engine uses the normal resume/start path. When
`watchdog_auto_recover=1`, a reachable engine calls recovery to restore DNS and
nftables imports. Failed recovery remains suspended and is retried. A plain start
leaves suspended unchanged. Restart and reload invoke resume; an explicit resume
or applying a profile change does the same. During Apply, a suspended state uses
resume only when the active-profile ID is unchanged; a different profile forces a
full restart. Apply preserves the newly committed configuration when only service
startup or connectivity fails: the job reports `service-start-failed`, clears the
draft, and leaves the service fail-open rather than rolling the database back. Mux defaults to disabled and is enabled only when a URI query
or VMess payload explicitly requests it. JSON subscription formats and automatic
periodic refresh remain future work.
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
sh tests/test_watchdog.sh
sh tests/test_migration.sh
sh tests/test_draft.sh
sh tests/test_apply_job.sh
```

The importer test uses only sanitized fixtures under `tests/fixtures/` and a
temporary database. It does not read router snapshots or write device
configuration.
