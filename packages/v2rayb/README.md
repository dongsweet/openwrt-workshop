# v2rayB

v2rayB is an OpenWrt control plane for a V2Ray-based transparent proxy. It
combines a SQLite application database, generated V2Ray/MosDNS/nftables
configuration, dnsmasq integration, LuCI management, and a DNS watchdog.

The implementation is an installable test build. Manual nodes and profiles,
runtime proxy switching, rollback, and basic LuCI management are implemented.
Subscriptions and the full policy-management workflow are not.

The target architecture is documented in [docs/design.md](docs/design.md).
The implementation boundary and test notes are in
[docs/implementation.md](docs/implementation.md).

## Repository Layout

```text
Makefile                  Two packages: v2rayb and luci-app-v2rayb
files/                    Canonical package payload
docs/                     Architecture and implementation notes
tests/                    Local schema, rendering, and lifecycle tests
tools/import_legacy.py    Optional legacy JSON normalizer
```

Legacy router snapshots, private V2Ray JSON, transient state, and APK artifacts
are not part of this repository. Keep them in the monorepo's ignored `local/`
directory.

## Packages

The package Makefile builds:

- `v2rayb`: lifecycle controller, SQLite schema, DNS/firewall orchestration,
  rules, and watchdog.
- `luci-app-v2rayb`: JavaScript LuCI console backed by rpcd/ucode. It does not
  require `luci-compat` or the Lua runtime.

The core package declares dependencies on sqlite3-cli, v2ray-core,
v2ray-geoip, mosdns, nftables-json, bind-dig, and curl.

## Router State

The development router was inspected on 2026-11-09:

- ImmortalWrt 25.12.0 on aarch64.
- Core `v2rayb` r9 and LuCI app r20 were installed.
- The v2rayB database had no node or profile.
- v2rayB, its watchdog, and MosDNS were stopped and disabled at boot.
- dnsmasq was running.
- The `inet v2rayB` nftables table was absent.
- dnsmasq used `noresolv=1` with `223.5.5.5`, not WAN DHCP DNS.

Inspect the live state before deploying or starting the service:

```sh
uci show dhcp.@dnsmasq[0] | grep -E 'server|noresolv|confdir|resolvfile'
ps w | grep -E '[v]2ray|[m]osdns|[v]2rayB'
nft list tables | grep v2rayB
/etc/init.d/v2rayB status
```

Back up any pre-existing nftables table before replacing it. v2rayB refuses to
delete a `table inet v2rayB` that it did not create.

## DNS Design

The package does not migrate, replace, or disable the router's
`/etc/dnsmasq.d` rules. dnsmasq remains the primary resolver. In proxy mode its
default upstream is V2Ray DNS at `127.0.0.1#5353`; only the
`xn--ngstr-lra8j.com` suffix is forwarded to MosDNS at `127.0.0.1#5354`.
MosDNS sends matching Google Play GGC names to domestic DNS and adds their
answers to v2rayB's nft set. Other names in that suffix fall back to V2Ray DNS.

The service captures dnsmasq settings before switching and restores them on
stop. Stopping also removes the v2rayB-owned nftables table and managed
processes.

## First Start

1. Open LuCI at **Services -> v2rayB**.
2. Add a VLESS, VMess, Trojan, or Shadowsocks node.
3. Create a profile using that node as its primary node.
4. Review the live DNS, process, and nftables state.
5. Start manually and test DNS and LAN traffic.
6. Enable boot startup only after repeated start/stop and client tests pass.

For a VLESS TLS/TCP node, the generated outbound has this shape:

```json
{"settings":{"vnext":[{"address":"proxy.example.com","port":443,"users":[{"id":"UUID","encryption":"none","level":0}]}]},"streamSettings":{"network":"tcp","security":"tls","tlsSettings":{"serverName":"proxy.example.com"}}}
```

Useful checks after a manual start:

```sh
/etc/init.d/v2rayB start
/usr/libexec/v2rayB/v2rayBctl status
dig @127.0.0.1 www.google.com
dig @127.0.0.1 -p 5354 www.google.com
nft list table inet v2rayB
```

The LuCI Diagnostics tab also provides a router-originated URL probe. It
queries the local dnsmasq listener, reports the matching dnsmasq/MosDNS rule,
then performs a real HTTP(S) request pinned to the returned DNS addresses.
The result includes TLS/HTTP status, local and remote sockets, kernel route,
egress interface/gateway, and timings. The DNS upstream path is inferred from
configuration; the HTTPS socket and egress route are observed from the actual
request. Because the current transparent redirect table is for LAN traffic in
PREROUTING, this probe does not prove that a LAN client will take the same
proxy path.

Stop and restore normal DNS:

```sh
/etc/init.d/v2rayB stop
/usr/libexec/v2rayB/v2rayBctl status
```

## Test Scope

The test build intercepts LAN TCP ports 80, 443, 8080, and 8443. It does not
proxy router-originated traffic or UDP applications. `services.googleapis.cn`
remains controlled by dnsmasq and a dedicated V2Ray inbound so it remains
proxied even when its answer is a China IP. Other China IP traffic uses V2Ray's
`geoip:cn` direct outbound rule.

Verify MosDNS `nftset` behavior, the device's WAN resolver, and LAN client
traffic on the actual router before treating the package as production-ready.

## Google Play CDN Scope

Only hostnames matching
`r+[0-9]+(---|\.)sn-(2x3|ni5|j5o)\w{5}\.xn--ngstr-lra8j\.com` receive domestic
DNS answers and nftset insertion for mainland Google CDN nodes, based on the
[referenced analysis](https://blog.l3zc.com/2025/03/chinese-cdn-used-by-playstore/).
dnsmasq forwards that suffix to MosDNS so it can apply the exact match. The rule
is deliberately not broadened to direct-resolve the whole
`xn--ngstr-lra8j.com` domain.
