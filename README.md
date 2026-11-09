# OpenWrt Workshop

A personal monorepo for OpenWrt packages, LuCI applications, router
automation, and field-test tooling.

## Packages

| Package | Description |
| --- | --- |
| `packages/luci-app-multi-frpc` | Multi-server FRP client management for LuCI |
| `packages/luci-app-v2ray-adv` | Advanced V2Ray configuration and transparent proxy UI |
| `packages/v2rayb` | Database-backed V2Ray lifecycle, DNS, firewall, and watchdog control plane |

Each package keeps its own README, build metadata, and license.

## Layout

```text
packages/              OpenWrt package feeds and package-local tests
local/                 Ignored private snapshots and build artifacts
README.md              Repository overview and build notes
feeds.conf.example     Optional local OpenWrt feed entry
```

The `local/` directory is never committed. Use it for router downloads,
private node configurations, generated APKs/IPKs, and other machine-specific
material.

## Build

Use a Linux shell, WSL, or an OpenWrt buildroot. Point `OPENWRT_SDK` at an SDK
that matches the target architecture and package format:

```sh
export OPENWRT_SDK=/path/to/openwrt-sdk

for package in luci-app-multi-frpc luci-app-v2ray-adv v2rayb; do
	ln -s "$PWD/packages/$package" "$OPENWRT_SDK/package/$package"
done

cd "$OPENWRT_SDK"
make package/v2rayb/compile V=s
make package/luci-app-multi-frpc/compile V=s
make package/luci-app-v2ray-adv/compile V=s
```

A package feed can also point directly at the `packages/` directory:

```sh
echo "src-link openwrt-workshop /absolute/path/to/openwrt-workshop/packages" \
	>> /path/to/buildroot/feeds.conf
```

## Tests

The v2rayB tests are package-local and can run from a Linux shell:

```sh
cd packages/v2rayb
python3 tests/test_schema.py
python3 tests/test_import.py
python3 tests/test_rules.py
python3 tests/test_luci.py
sh tests/test_render.sh
sh tests/test_lifecycle.sh
```

## Security

Do not commit proxy credentials, private subscription data, router backups, or
deployment snapshots. The root ignore rules exclude common private paths and
credential formats, but review staged changes before publishing.
