# v2rayB Unified Proxy Control Plane

Status: the first installable test build is implemented in `files/` and
`Makefile`. It supports manual nodes/profiles, runtime DNS/firewall switching,
and watchdog checks. Subscription ingestion and the full LuCI management
workflow remain future work.

This document defines the target architecture for the router solution. The
current package is a test implementation and must not be treated as a complete
implementation of this design.

## 1. Goals

- Expose one public control surface: `/etc/init.d/v2rayB` and LuCI.
- Treat V2Ray, the narrow MosDNS Google Play branch, dnsmasq integration,
  nftables rules, and the watchdog as
  one recoverable proxy mode.
- Store subscriptions, manually added nodes, policies, and the active choice
  in v2rayB's own database rather than in UCI.
- Allow future proxy engines such as Xray or sing-box without redesigning the
  DNS and firewall control plane.
- Make stopping the service restore ordinary WAN DNS and ordinary routing.
- Make every start, stop, reload, and recovery operation idempotent.

## 2. Non-goals

- Do not preserve `config-hk2.json` or `config-home.json` as permanent
  runtime dependencies.
- Do not put complete proxy JSON documents or subscription node lists into
  UCI sections.
- Do not flush the global nftables ruleset or modify unrelated firewall
  tables.
- Do not enable an independent MosDNS service. The `mosdns` package supplies
  the binary; v2rayB owns the generated config and starts/stops its MosDNS
  instance as part of the proxy lifecycle.

## 3. Source Of Truth And Files

The application database is the source of truth for v2rayB-owned data:

```text
/etc/v2rayB/v2rayB.db
/etc/v2rayB/schema.sql
/etc/v2rayB/migrations/
/etc/v2rayB/subscriptions/       # raw subscription cache, not runtime config
/etc/v2rayB/templates/            # engine-specific render templates
/etc/v2rayB/rules/                # persistent rule sources
/tmp/v2rayB/                      # locks, state, generated configs, backups
```

Generated files are disposable artifacts:

```text
/tmp/v2rayB/active/v2ray.json
/tmp/v2rayB/active/mosdns.yaml
/tmp/v2rayB/active/nftables.nft
/tmp/v2rayB/state
```

Legacy V2Ray JSON files are private rollback/reference material, not runtime
inputs. They are not imported as raw profiles or automatically converted by
the service. The operator creates a normalized manual node and profile in the
application database; the running service selects only that database profile.

## 4. Data Model

The first database schema should contain these logical entities:

```text
settings
  key, value, updated_at

sources
  id, type, name, url, format, enabled, updated_at

nodes
  id, source_id, name, protocol, server, port, data_json, enabled

profiles
  id, name, engine, node_id, policy_id, enabled

policies
  id, name, dns_policy_json, routing_policy_json

rulesets
  id, name, type, path, checksum, updated_at
```

`sources.type` distinguishes `subscription` and `manual` in the initial
workflow; a manually entered VLESS, VMess, Trojan, or Shadowsocks endpoint is
a normal row in `nodes` and does not need a fake subscription.

If explicit legacy import is ever added later, it must normalize supported
fields into `nodes`, `profiles`, and `policies`; a complete JSON document must
not become a second runtime configuration format. Legacy import is outside
the current deployment scope.

Protocol-specific fields belong in `nodes.data_json`, so the common schema can
represent TLS, WebSocket, Reality, UUID, password, and transport parameters
without adding a new database column for every protocol variation.

## 5. Proxy Engine Boundary

The control plane uses an engine adapter interface:

```text
validate(profile)
render(profile, policy, output_path)
start(config_path)
stop()
reload(config_path)
health()
```

Initial implementation:

```text
v2ray
```

Future implementations can add:

```text
xray
sing-box
```

The adapter generates a runtime config from database records. The database
does not store an engine-specific complete config as the active source.

## 6. DNS Topology

Normal mode:

```text
LAN client -> dnsmasq:53 -> WAN DHCP DNS
                  `-> existing /etc/dnsmasq.d domain-specific rules
```

Proxy mode:

```text
LAN client -> dnsmasq:53 -> V2Ray DNS:5353 (default upstream)
                  `-> xn--ngstr-lra8j.com -> MosDNS:5354
                                                  |- matching Play GGC names -> domestic DNS + nftset
                                                  `- everything else -> V2Ray DNS:5353
```

dnsmasq remains the primary resolver and keeps reading `/etc/dnsmasq.d` in both
modes. Its existing `server=/.../...` and `nftset=...` rules are not migrated,
rewritten, or disabled. v2rayB preserves domain-scoped UCI `server` entries
when temporarily replacing the default upstream. The service adds one
domain-specific forwarding rule for `xn--ngstr-lra8j.com` to MosDNS. MosDNS
matches only the configured Google Play GGC regular expression for domestic
resolution and nftset insertion; unmatched names fall back to V2Ray DNS.
Therefore the rule forwards a suffix to the narrow resolver, but does not make
the entire suffix a direct-DNS policy.

MosDNS configuration is generated from the database and its narrowly scoped
rule file. Its listener is not a UCI setting. UCI remains the baseline
integration mechanism for dnsmasq only when needed by OpenWrt.

The normal dnsmasq baseline must use the WAN-generated resolver file unless
the user explicitly chooses a fixed fallback. Proxy mode applies a temporary
override to `noresolv` and `server`; it must not commit v2rayB's temporary
values into the permanent DHCP configuration.

Current snapshot warning: `etc/config/dhcp` contains both
`list server '127.0.0.1#5353'` and `option noresolv '1'`. This is stale
proxy-mode state, not a safe normal-mode baseline. On service start, v2rayB
captures the existing values and applies its temporary proxy-mode upstream.
On stop, it removes that stale global local upstream and `noresolv` to restore
WAN DHCP DNS, while preserving domain-scoped UCI servers and all files in
`/etc/dnsmasq.d`. The package deliberately does not overwrite the user's DHCP
config or migrate the existing dnsmasq rules.

## 7. nftables Ownership

v2rayB owns only its own table, for example:

```text
table inet v2rayB
  set cn4
  set pass4
  set force_proxy4
  set cn6
  set pass6
  set force_proxy6
  chain prerouting
  chain output
```

Rules are rendered to a temporary file and loaded atomically with `nft -f`.
Stop and rollback delete only `table inet v2rayB` or its named objects. They
must never use `flush ruleset` or flush an unrelated ipset.

Native nft sets are preferred on firewall4. The MosDNS 5.3.4 set integration
must be tested on the actual device before finalizing the rule syntax. If the
plugin cannot write native nft sets, use a narrowly scoped compatibility layer
or a v2rayB-owned updater rather than mixing ownership of the same set.

## 8. Service State Machine

Runtime states:

```text
normal -> starting -> proxy
proxy  -> stopping -> normal
proxy  -> degraded -> recovery or normal
```

`/etc/init.d/v2rayB` is the only public lifecycle entry point. MosDNS is an
internal child service and is not independently enabled.

Start order:

1. Acquire the v2rayB lock and mark `starting`.
2. Render and validate the selected engine config, then capture dnsmasq state.
3. Start V2Ray and wait for its DNS listener.
4. Load the v2rayB nft table and sets.
5. Start MosDNS and wait for its listener.
6. Apply the temporary dnsmasq default-upstream override and narrow
   Google Play suffix forward, reload dnsmasq, and probe both MosDNS and
   dnsmasq.
7. Start the watchdog and mark `proxy`.

Any failure rolls back the completed steps and returns to normal mode.

Stop order:

1. Mark the service stopping so the watchdog cannot race recovery.
2. Remove proxy interception rules.
3. Restore the dnsmasq baseline and reload it while MosDNS is still running.
4. Stop watchdog, MosDNS, and the proxy engine.
5. Delete temporary state and mark `normal`.

The order prevents dnsmasq from being left pointing at a stopped local DNS
listener.

## 9. Enable And Disable Semantics

OpenWrt service boot enablement is separate from runtime proxy mode:

```text
/etc/init.d/v2rayB enable   # start proxy mode after boot/network readiness
/etc/init.d/v2rayB disable  # do not start proxy mode automatically
/etc/init.d/v2rayB start    # enter proxy mode now
/etc/init.d/v2rayB stop     # return to normal mode now
```

This does not require an `/etc/config/v2rayb` file. LuCI's “boot start” switch
calls the standard `enable`/`disable` actions. Settings such as watchdog
policy, fallback behavior, selected engine, and selected profile are stored in
the application database.

## 10. Backend And LuCI Boundary

LuCI must not edit the database or invoke arbitrary shell commands directly.
It calls a narrow rpcd/ubus API:

```text
status
start
stop
restart
reload
list_sources
update_subscription
list_nodes
select_profile
validate_profile
test_dns
get_logs
```

All mutating calls acquire the same lock used by the init script, validate
identifiers and paths, and use atomic file replacement. Subscription URLs and
node credentials are root-readable data and must not be written to logs.

Initial LuCI pages:

1. Overview and current state.
2. Sources and subscription update.
3. Nodes and profile selection.
4. DNS and routing policies.
5. Logs and diagnostics.

## 11. Implementation Phases

### Phase 0: Inventory and migration

- Capture current service, dnsmasq, MosDNS, and nft behavior.
- Restore a safe normal dnsmasq baseline.
- Define the database schema and migration version.
- Keep legacy JSON files as private rollback/reference material; enter the
  selected node/profile explicitly in the new application.

### Phase 1: Backend foundation

- Add SQLite storage and migrations.
- Add a small backend/CLI with locking and status reporting.
- Add the V2Ray engine adapter and runtime config renderer.
- Make start/stop/reload idempotent.

### Phase 2: DNS and firewall integration

- Generate MosDNS configuration.
- Validate domain matching and DNS upstream routing.
- Implement temporary dnsmasq switching and rollback.
- Implement v2rayB-owned nft table and set updates.

### Phase 3: Watchdog and recovery

- Move watchdog control under v2rayB.
- Probe the complete client path, not only one internal listener.
- Restart after the configured failure threshold.
- Fall back to normal mode after repeated recovery failure.

### Phase 4: LuCI application

- Add rpcd API and ACLs.
- Add overview, profile, node, source, and diagnostics pages.
- Add standard service enable/disable controls.

### Phase 5: Subscriptions and additional engines

- Add atomic subscription fetch and node replacement.
- Add node validation and optional latency checks.
- Add Xray/sing-box adapters only after the V2Ray path is stable.

## 12. Acceptance Criteria

- Stopping v2rayB restores WAN DHCP DNS without manual UCI edits.
- No v2rayB nft table, set, or rule remains after stop.
- Starting v2rayB leaves dnsmasq as the primary resolver, with V2Ray DNS as
  its default upstream and MosDNS serving only the Google Play GGC branch.
- Existing `/etc/dnsmasq.d` domain upstream and nftset rules remain enabled and
  are not copied into the v2rayB database or MosDNS rule files.
- A failed start leaves the router in normal mode.
- A failed watchdog recovery eventually falls back to normal mode.
- A subscription update failure leaves the previous working node set intact.
- LuCI can select a manual node and a subscription node through the same API.
- The old fixed filenames are not required after migration.
