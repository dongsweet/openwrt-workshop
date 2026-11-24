# v2rayB

v2rayB is an OpenWrt control plane for V2Ray- or Xray-based transparent proxies.
It combines a SQLite application database, generated proxy/MosDNS/nftables
configuration, dnsmasq integration, LuCI management, and an optional connectivity
watchdog.

The implementation is an installable test build. Manual and subscription
nodes/profiles, runtime proxy switching, rollback, and basic LuCI management
are implemented. JSON subscription formats and periodic automatic refresh are
not.

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

The core package declares dependencies on sqlite3-cli, v2ray-core, xray-core,
v2ray-geoip, mosdns, nftables-json, bind-dig, and curl. Both engine packages are
installed, but only the engine selected by the active profile is started.

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
MosDNS sends matching `rrN---sn-...` Google Play GGC names to domestic DNS and
adds their answers to v2rayB's nft set. Other names in that suffix fall back to
V2Ray DNS.

A global ordered direct-DNS upstream list supplies node bootstrap, subscription
hostname resolution and the MosDNS direct branch. v2rayB writes the bootstrap,
subscription, force-proxy and default-upstream changes for a transition before
restarting dnsmasq once. The service captures dnsmasq settings before switching
and restores them on stop. Stopping also removes the
v2rayB-owned nftables table and managed processes.

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

## Force Proxy Domains

The profile policy's **Force proxy domains** setting is separate from
source-address bypass and follows profile selection. Each listed domain remains
on the normal dnsmasq/V2Ray DNS path, while
dnsmasq also inserts its IPv4 and IPv6 answers into the force_proxy4 and
force_proxy6 nft sets. nftables checks those sets before source bypass, direct
IP, and pass returns, then redirects matching TCP traffic to the existing
transparent proxy listener. The same domain list is emitted as an exact Xray
routing rule ahead of `geoip:cn`, with route-only TLS/HTTP sniffing enabled, so a
mainland CDN answer cannot be routed direct again after nft redirection. No
additional V2Ray inbound is created.

Enter one domain per line. A blank list disables the rule. This is intended for
control-plane domains that must use the proxy even when their DNS answer is
also present in a direct/pass set; do not add Google Play GGC download domains
that are intentionally kept direct.

## Configuration Apply

Save & Apply first commits the draft and renders the new runtime files. Database
commit, rendering, and boot-state failures roll back the configuration. Once the
new configuration has been rendered, a proxy startup or connectivity failure
does not roll it back: the apply job reports `Proxy startup failed`, the new
configuration remains active in the database, and the draft is cleared. The
service stays fail-open until the user retries, edits the profile, or watchdog
restores takeover.

## Source Address Bypass

The global **Bypass source IPv4/CIDR** setting keeps selected LAN clients out
of the transparent proxy. Matching traffic returns before the `prerouting`
redirect rules, so the packet keeps its original destination and continues
through normal source-based policy routing. This is useful for IPTV set-top
boxes whose traffic must use a dedicated routing table and uplink.

Enter one IPv4 address or CIDR per line. Bare addresses are normalized to `/32`;
an empty list disables the bypass. The setting is global because it describes
which clients v2rayB may intercept, not a property of the selected proxy node.
When upgrading a schema-v9 database, a legacy
`/etc/v2rayB/rules/proxy_bypass_sources4.txt` is imported once into the database;
subsequent changes should be made through LuCI or `v2rayBctl set-setting`.

## Proxy Engines

Each profile selects its proxy engine (`V2Ray` or `Xray`). Xray is required for
REALITY nodes that fail the V2Ray compatibility path. Saving and applying a
profile switch also switches the engine and restarts the managed process.

The normal `/etc/init.d/v2ray` and `/etc/init.d/xray` services are disabled by
the v2rayB package. They must remain inactive because v2rayB starts only the
binary selected by the active profile.

## Watchdog and Probe

The profile's **Verify proxy connectivity** switch controls the loopback SOCKS
health-probe inbound, its port, and the startup connectivity check. The global
**Enable watchdog** switch controls continuous monitoring after startup.

| Profile probe | Global watchdog | Behavior |
| --- | --- | --- |
| Off | Either value | No health inbound or startup check; traffic and DNS are imported immediately. The watchdog is not started. |
| On | Off | The startup check runs, but there is no continuous watchdog. |
| On | On | The startup check runs and continuous monitoring starts after a 60 second delay. |

The watchdog probes every 10 to 30 seconds. Three consecutive failures move the
service to `suspended`: the original dnsmasq configuration is restored, the
v2rayB nftables table is removed, and MosDNS is stopped. V2Ray/Xray and the
watchdog remain running so the loopback health probe can continue.

While suspended, a failed probe still checks whether the engine process is
alive. With **Restart engine during recovery** enabled, watchdog restarts a
running engine that remains unreachable, then repeats the connectivity probe.
Restarts are throttled to one attempt every five minutes. This handles a process
that exists but is hung; a missing engine is started through the normal resume
path.

After the engine becomes reachable, **Automatically restore takeover** repeats
the startup connectivity check and restores nftables and DNS imports. A failed
attempt remains safely suspended. With automatic recovery disabled, watchdog
continues monitoring but does not re-import traffic or DNS.

A plain `/etc/init.d/v2rayB start` keeps a suspended service suspended. On Apply,
switching to a different profile performs a full restart so the new engine and
node configuration are loaded. Retrying the same profile uses resume/recovery.
`restart` and `reload` always use a full stop/start cycle. The LuCI restart
action and an explicit `resume` are also available.

Each profile also selects the intercepted TCP destination ports, its transparent
proxy listener port (default `12345`), and its optional connectivity-probe port
(default `12346`). China IP traffic can use V2Ray's `geoip:cn` direct outbound
rule.

UDP transparent proxying is disabled by default. A profile may enable a separate
ordered UDP destination-port list (for example `443`) and a dedicated TPROXY
listener port (default `12347`). It applies to LAN-originated traffic, uses the
same pass/direct/China routing decisions, and adds the required fwmark policy
routing. The engine runs as root only while UDP TPROXY is enabled because this
OpenWrt image cannot otherwise grant `CAP_NET_ADMIN` for `IP_TRANSPARENT`.
Its proxy and direct outbounds are marked `22083`; the router-output redirect
returns on that mark to prevent the engine's own TCP or UDP connections from
looping back into itself.
nftables TPROXY and socket-match kernel modules are package dependencies.

## Test Scope

Verify MosDNS `nftset` behavior, the device's resolver, engine switching, and LAN
client traffic on the actual router before treating the package as
production-ready.

## Google Play CDN Scope

Only hostnames matching
`rr[0-9]+(---|\.)sn-(2x3|ni5|j5o)\w{5}\.xn--ngstr-lra8j\.com` receive domestic
DNS answers and nftset insertion for mainland Google CDN nodes, based on the
[referenced analysis](https://blog.l3zc.com/2025/03/chinese-cdn-used-by-playstore/).
dnsmasq forwards that suffix to MosDNS so it can apply the exact match. The rule
is deliberately not broadened to direct-resolve the whole
`xn--ngstr-lra8j.com` domain.
