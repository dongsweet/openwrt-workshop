#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-render-test
rm -rf "$TEST_DIR" "$TEST_DIR-rules"
export V2RAYB_DB="$TEST_DIR/v2rayB.db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/runtime"
export V2RAYB_RULE_DIR="$TEST_DIR-rules"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"

ctl="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
"$ctl" init-db
"$ctl" add-node hk vless hk2.example.com 443 '{"settings":{"vnext":[{"address":"hk2.example.com","port":443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]},"streamSettings":{"network":"tcp"}}'
"$ctl" add-profile hk-profile 1 >/dev/null
if "$ctl" add-profile hk-profile 1 >/dev/null 2>&1; then
	echo "duplicate profile name unexpectedly accepted" >&2
	exit 1
fi
"$ctl" render-all
python3 -m json.tool "$TEST_DIR/runtime/active/v2ray.json" >/dev/null
grep -q '"protocol":"vless"' "$TEST_DIR/runtime/active/v2ray.json"
grep -q 'qname &/etc/v2rayB/rules/direct_domains.txt' "$TEST_DIR/runtime/active/mosdns.yaml"
grep -q 'set force_proxy4' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set direct_static4' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'flags timeout; timeout 12h' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set pass { type ipv4_addr; flags interval; }' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set force_proxy { type ipv4_addr; flags interval; }' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'ip daddr @force_proxy tcp dport { 80, 443, 8080, 8443 } redirect to :12346' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'ip daddr @pass return' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'tcp dport { 80, 443, 8080, 8443 } redirect to :12345' "$TEST_DIR/runtime/active/nftables.nft"
grep -q '"force-proxy-in"' "$TEST_DIR/runtime/active/v2ray.json"
! grep -q 'chain output' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'table inet v2rayB' "$TEST_DIR/runtime/active/nftables.nft"
if "$ctl" set-setting transparent_proxy_ports '80,,443' >/dev/null 2>&1; then
	echo "invalid port list unexpectedly accepted" >&2
	exit 1
fi
echo "render tests: ok"
