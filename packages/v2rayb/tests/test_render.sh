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
"$ctl" apply-draft
if "$ctl" add-profile hk-profile 1 >/dev/null 2>&1; then
	echo "duplicate profile name unexpectedly accepted" >&2
	exit 1
fi
"$ctl" revert-draft
"$ctl" render-all
python3 -m json.tool "$TEST_DIR/runtime/active/v2ray.json" >/dev/null
grep -q '"protocol":"vless"' "$TEST_DIR/runtime/active/v2ray.json"
"$ctl" get-v2ray-config | python3 -m json.tool >/dev/null
"$ctl" status | grep -q '^profile_direct_dns=223.5.5.5:53$'
"$ctl" status | grep -q '^profile_transparent_proxy_ports=80,443,8080,8443$'
! "$ctl" status | grep -q '^transparent_proxy_ports='
grep -q 'qname &.*/mosdns-direct-domains.txt' "$TEST_DIR/runtime/active/mosdns.yaml"
grep -q 'exec: "nftset inet,v2rayB,direct4,ipv4_addr,32' "$TEST_DIR/runtime/active/mosdns.yaml"
! grep -q 'type: nftset' "$TEST_DIR/runtime/active/mosdns.yaml"
grep -q 'set force_proxy4' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set direct_static4' "$TEST_DIR/runtime/active/nftables.nft"
! grep -q 'elements = { *}' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'flags timeout; timeout 12h' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set pass { type ipv4_addr; flags interval;' "$TEST_DIR/runtime/active/nftables.nft"
! grep -q 'hk2.example.com' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set pass6 { type ipv6_addr; flags interval;' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'set force_proxy { type ipv4_addr; flags interval; }' "$TEST_DIR/runtime/active/nftables.nft"
! grep -q 'chain output' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'ip daddr @force_proxy tcp dport { 80, 443, 8080, 8443 } redirect to :12346' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'ip daddr @pass return' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'tcp dport { 80, 443, 8080, 8443 } redirect to :12345' "$TEST_DIR/runtime/active/nftables.nft"
grep -q '"force-proxy-in"' "$TEST_DIR/runtime/active/v2ray.json"
grep -q 'table inet v2rayB' "$TEST_DIR/runtime/active/nftables.nft"

"$ctl" update-node 1 hk-updated vless hk3.example.com 8443 '{"settings":{"vnext":[{"address":"hk3.example.com","port":8443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]},"streamSettings":{"network":"ws"}}' >/dev/null
"$ctl" list-nodes | grep -q 'hk-updated.*hk3.example.com.*8443'
if "$ctl" set-node-enabled 1 0 >/dev/null 2>&1; then
	echo "referenced node unexpectedly disabled" >&2
	exit 1
fi
for ports in '80,,443' '8443-8080' '0-443' '1-2-3'; do
	if "$ctl" set-profile-policy 1 223.5.5.5:53 "$ports" 1 >/dev/null 2>&1; then
		echo "invalid profile port list unexpectedly accepted: $ports" >&2
		exit 1
	fi
done
"$ctl" update-profile 1 hk-profile-updated 1 1.1.1.1:53 '80,443,8080-8443' 0 0 1 'example.com,xn--ngstr-lra8j.com' 'regexp:^cdn\.example\.com$' >/dev/null
"$ctl" get-profile 1 | grep -q '^name=hk-profile-updated$'
"$ctl" get-profile 1 | grep -q '^node_id=1$'
"$ctl" get-profile 1 | grep -q '^use_v2ray_dns=0$'
"$ctl" get-profile 1 | grep -q '^mosdns_domains=example.com,xn--ngstr-lra8j.com$'
"$ctl" get-profile-rules 1 | grep -q '^regexp:\^cdn\\.example\\.com\$'
"$ctl" apply-draft
"$ctl" dns-settings | grep -q '^dnsmasq_default=1.1.1.1#53$'
"$ctl" dns-settings | grep -q '^use_v2ray_dns=0$'
"$ctl" dns-settings | grep -q '^mosdns_enabled=1$'
"$ctl" render-all
grep -q 'addr: "udp://1.1.1.1:53"' "$TEST_DIR/runtime/active/mosdns.yaml"
grep -q 'qname &.*/mosdns-direct-domains.txt' "$TEST_DIR/runtime/active/mosdns.yaml"
grep -q 'regexp:\^cdn\\.example\\.com\$' "$TEST_DIR/runtime/active/mosdns-direct-domains.txt"
grep -q 'tcp dport { 80, 443, 8080-8443 } redirect to :12345' "$TEST_DIR/runtime/active/nftables.nft"
! grep -q 'geoip:cn' "$TEST_DIR/runtime/active/v2ray.json"
"$ctl" set-profile-policy 1 1.1.1.1:53 '80,443,8080-8443' 0 1 0 'example.com' 'regexp:^cdn\.example\.com$' 1
"$ctl" apply-draft
"$ctl" render-all
if command -v nft >/dev/null 2>&1; then
	nft -c -f "$TEST_DIR/runtime/active/nftables.nft"
fi
grep -q 'chain output' "$TEST_DIR/runtime/active/nftables.nft"
grep -q 'type nat hook output priority -100' "$TEST_DIR/runtime/active/nftables.nft"
output_chain="$(sed -n '/chain output {/,/^  }/p' "$TEST_DIR/runtime/active/nftables.nft")"
printf '%s\n' "$output_chain" | grep -q 'ip daddr @pass return'
printf '%s\n' "$output_chain" | grep -q 'tcp dport { 80, 443, 8080-8443 } redirect to :12345'
"$ctl" status | grep -q '^profile_proxy_router_traffic=1$'
grep -q 'tcp dport { 80, 443, 8080-8443 } redirect to :12345' "$TEST_DIR/runtime/active/nftables.nft"
"$ctl" dns-settings | grep -q '^dnsmasq_default=127.0.0.1#5353$'
"$ctl" dns-settings | grep -q '^mosdns_enabled=0$'
"$ctl" get-profile 1 | grep -q '^mosdns_domains=example.com$'
"$ctl" get-profile-rules 1 | grep -q '^regexp:\^cdn\\.example\\.com\$'
"$ctl" set-profile-policy 1 1.1.1.1:53 '80,443,8080-8443' 0 1 0 '' 'regexp:^cdn\.example\.com$' 0
"$ctl" get-profile-rules 1 | grep -q '^regexp:\^cdn\\.example\\.com\$'
if "$ctl" set-profile-enabled 1 0 >/dev/null 2>&1; then
	echo "active profile unexpectedly disabled" >&2
	exit 1
fi
if "$ctl" delete-profile 1 >/dev/null 2>&1; then
	echo "active profile unexpectedly deleted" >&2
	exit 1
fi
"$ctl" set-setting active_profile ''
"$ctl" set-profile-enabled 1 0
"$ctl" set-profile-enabled 1 1
"$ctl" delete-profile 1
policy_count="$("$V2RAYB_SQLITE3" -batch -bail "$V2RAYB_DB" 'SELECT COUNT(*) FROM draft_policies;')"
[ "$policy_count" = 0 ]
"$ctl" set-node-enabled 1 0
"$ctl" delete-node 1
! "$ctl" list-nodes | grep -q 'hk-updated'
echo "render tests: ok"
