#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-lifecycle-test-$$
mkdir -p "$TEST_DIR"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

. "$ROOT/files/etc/init.d/v2rayB"

log() { :; }
uci() {
	[ "$1" = -q ] || return 2
	shift
	case "$1" in
		show) return 0 ;;
		get)
			case "$2" in
				"${DNSMASQ_SECTION}.confdir") printf '%s\n' "$DNSMASQ_DIR" ;;
				"${DNSMASQ_SECTION}.server")
					[ -n "$MOCK_SERVER" ] || return 1
					if [ "${MOCK_UCI_GET_SPACE:-0}" = 1 ]; then
						printf '%s\n' "$MOCK_SERVER" | tr '\n' ' ' | sed 's/ $//'
					else
						printf '%s\n' "$MOCK_SERVER"
					fi
					;;
				"${DNSMASQ_SECTION}.noresolv") [ -n "$MOCK_NORESOLV" ] && printf '%s\n' "$MOCK_NORESOLV" ;;
				*) return 1 ;;
			esac
			;;
		delete)
			case "$2" in
				"${DNSMASQ_SECTION}.server") MOCK_SERVER="" ;;
				"${DNSMASQ_SECTION}.noresolv") MOCK_NORESOLV="" ;;
			esac
			;;
		add_list)
			if [ -n "$MOCK_SERVER" ]; then
				MOCK_SERVER="$MOCK_SERVER
${2#*=}"
			else
				MOCK_SERVER="${2#*=}"
			fi
			;;
		set)
			case "$2" in
				"${DNSMASQ_SECTION}.noresolv="*) MOCK_NORESOLV="${2#*=}" ;;
			esac
			;;
		*) return 2 ;;
	esac
}
cleanup_legacy_procd() {
	touch "$RUNTIME/legacy-cleaned"
	[ "${FAIL_LEGACY:-0}" = 0 ]
}
dnsmasq_reload() { [ "${DNS_RELOAD_FAIL:-0}" = 0 ]; }

spawn_managed() {
	mkdir -p "$PID_DIR"
	sleep 60 &
	printf '%s\n' "$!" > "$PID_DIR/$1.pid"
}

setup_case() {
	RUNTIME="$TEST_DIR/$1"
	PID_DIR="$RUNTIME/pids"
	DNS_BACKUP="$RUNTIME/dnsmasq-before"
	LOCK_DIR="$RUNTIME/lock"
	DNSMASQ_DIR="$RUNTIME/dnsmasq.d"
	MOSDNS_FORWARD_FILE="$DNSMASQ_DIR/90-v2rayB-mosdns.conf"
	MOSDNS_FORWARD_EXPECTED="$RUNTIME/dnsmasq-mosdns-expected"
	BOOTSTRAP_DNS_FILE="$DNSMASQ_DIR/90-v2rayB-bootstrap.conf"
	BOOTSTRAP_DNS_EXPECTED="$RUNTIME/dnsmasq-bootstrap-expected"
	SUBSCRIPTION_DNS_FILE="$DNSMASQ_DIR/89-v2rayB-subscriptions.conf"
	SUBSCRIPTION_DNS_EXPECTED="$RUNTIME/dnsmasq-subscriptions-expected"
	CTL="$TEST_DIR/ctl"
	MOCK_SERVER=""
	MOCK_NORESOLV=""
	MOCK_UCI_GET_SPACE=0
	TEST_DNSMASQ_DEFAULT='127.0.0.1#5353'
	TEST_MOSDNS_ENABLED=1
	TEST_MOSDNS_DOMAINS='xn--ngstr-lra8j.com'
	TEST_BOOTSTRAP_DOMAIN='bootstrap.example.com'
	TEST_SUBSCRIPTION_DOMAINS='sub.example.com,alternate.example.net'
	export RUNTIME PID_DIR FAIL_NFT DNSMASQ_DIR MOSDNS_FORWARD_FILE MOSDNS_FORWARD_EXPECTED \
		BOOTSTRAP_DNS_FILE BOOTSTRAP_DNS_EXPECTED SUBSCRIPTION_DNS_FILE SUBSCRIPTION_DNS_EXPECTED \
		MOCK_SERVER MOCK_NORESOLV MOCK_UCI_GET_SPACE TEST_DNSMASQ_DEFAULT TEST_MOSDNS_ENABLED TEST_MOSDNS_DOMAINS TEST_BOOTSTRAP_DOMAIN TEST_SUBSCRIPTION_DOMAINS
	mkdir -p "$DNS_BACKUP" "$DNSMASQ_DIR" "$PID_DIR"
	: > "$DNS_BACKUP/server"
	: > "$DNS_BACKUP/noresolv"
	printf '0\n' > "$DNS_BACKUP/stale"
	printf 'proxy\n' > "$RUNTIME/state"
}

cat > "$TEST_DIR/ctl" <<'EOF'
#!/bin/sh
case "$1" in
	set-state) printf '%s\n' "$2" > "$RUNTIME/state" ;;
	set-setting) exit 0 ;;
	delete-nft) [ "${FAIL_NFT:-0}" = 0 ] ;;
	dns-settings)
		printf '%s\n' 'runtime_state=starting' \
			"dnsmasq_default=$TEST_DNSMASQ_DEFAULT" \
			'direct_dns=223.5.5.5:53' "bootstrap_domain=$TEST_BOOTSTRAP_DOMAIN" 'use_v2ray_dns=1' \
			"mosdns_enabled=$TEST_MOSDNS_ENABLED" \
			"mosdns_domains=$TEST_MOSDNS_DOMAINS" \
			'mosdns_listen=127.0.0.1#5354' 'v2ray_dns_listen=127.0.0.1#5353' \
			"subscription_domains=$TEST_SUBSCRIPTION_DOMAINS"
		;;
	*) exit 2 ;;
esac
EOF
chmod +x "$TEST_DIR/ctl"

setup_case dns-reload
DNS_RELOAD_FAIL=1
FAIL_NFT=0
spawn_managed v2ray
v2ray_pid="$(cat "$PID_DIR/v2ray.pid")"
export DNS_RELOAD_FAIL
if stop_service; then
	echo "stop unexpectedly succeeded after dnsmasq reload failure" >&2
	exit 1
fi
kill -0 "$v2ray_pid"
[ -f "$DNS_BACKUP/server" ]
[ "$(sed -n '1p' "$RUNTIME/state")" = degraded ]
kill "$v2ray_pid"

setup_case nft-delete
DNS_RELOAD_FAIL=0
FAIL_NFT=1
spawn_managed v2ray
v2ray_pid="$(cat "$PID_DIR/v2ray.pid")"
export FAIL_NFT
if stop_service; then
	echo "stop unexpectedly succeeded after nft cleanup failure" >&2
	exit 1
fi
kill -0 "$v2ray_pid"
[ -f "$DNS_BACKUP/server" ]
[ "$(sed -n '1p' "$RUNTIME/state")" = degraded ]
kill "$v2ray_pid"

setup_case clean-stop
DNS_RELOAD_FAIL=0
FAIL_NFT=0
export FAIL_NFT
spawn_managed v2ray
spawn_managed mosdns
spawn_managed watchdog
printf '%s\n' '# Managed by v2rayB; removed when proxy mode stops.' \
	'server=/xn--ngstr-lra8j.com/127.0.0.1#5354' > "$MOSDNS_FORWARD_EXPECTED"
cp "$MOSDNS_FORWARD_EXPECTED" "$MOSDNS_FORWARD_FILE"
printf '%s\n' '# Managed by v2rayB; removed when proxy mode stops.' \
	'server=/bootstrap.example.com/223.5.5.5#53' > "$BOOTSTRAP_DNS_EXPECTED"
cp "$BOOTSTRAP_DNS_EXPECTED" "$BOOTSTRAP_DNS_FILE"
printf '%s\n' '# Managed by v2rayB; removed when proxy mode stops.' \
	'server=/sub.example.com/223.5.5.5#53' \
	'server=/alternate.example.net/223.5.5.5#53' > "$SUBSCRIPTION_DNS_EXPECTED"
cp "$SUBSCRIPTION_DNS_EXPECTED" "$SUBSCRIPTION_DNS_FILE"
printf '%s\n' managed > "$RUNTIME/dnsmasq-mosdns-rule"
stop_service
[ -e "$RUNTIME/legacy-cleaned" ]
[ ! -e "$PID_DIR/v2ray.pid" ]
[ ! -e "$PID_DIR/mosdns.pid" ]
[ ! -e "$PID_DIR/watchdog.pid" ]
[ ! -e "$DNS_BACKUP" ]
[ ! -e "$BOOTSTRAP_DNS_FILE" ]
[ ! -e "$BOOTSTRAP_DNS_EXPECTED" ]
[ ! -e "$SUBSCRIPTION_DNS_FILE" ]
[ ! -e "$SUBSCRIPTION_DNS_EXPECTED" ]
[ "$(sed -n '1p' "$RUNTIME/state")" = normal ]

setup_case dns-routing
DNS_RELOAD_FAIL=0
FAIL_NFT=0
export FAIL_NFT
printf '%s\n' '/example.cn/223.5.5.5' '127.0.0.1#5353' > "$DNS_BACKUP/server"
printf '1\n' > "$DNS_BACKUP/noresolv"
printf '1\n' > "$DNS_BACKUP/stale"
MOCK_SERVER="$(cat "$DNS_BACKUP/server")"
MOCK_NORESOLV=1
set_proxy_dns
cmp -s "$MOSDNS_FORWARD_FILE" "$MOSDNS_FORWARD_EXPECTED"
cmp -s "$BOOTSTRAP_DNS_FILE" "$BOOTSTRAP_DNS_EXPECTED"
grep -q 'server=/sub.example.com/223.5.5.5#53' "$SUBSCRIPTION_DNS_FILE"
grep -q 'server=/alternate.example.net/223.5.5.5#53' "$SUBSCRIPTION_DNS_FILE"
[ "$MOCK_SERVER" = '/example.cn/223.5.5.5
127.0.0.1#5353' ]
[ "$MOCK_NORESOLV" = 1 ]
restore_dnsmasq
[ ! -e "$MOSDNS_FORWARD_FILE" ]
[ ! -e "$BOOTSTRAP_DNS_FILE" ]
[ ! -e "$BOOTSTRAP_DNS_EXPECTED" ]
[ ! -e "$SUBSCRIPTION_DNS_FILE" ]
[ ! -e "$SUBSCRIPTION_DNS_EXPECTED" ]
[ "$MOCK_SERVER" = '/example.cn/223.5.5.5' ]
[ -z "$MOCK_NORESOLV" ]

setup_case dns-routing-space-separated
DNS_RELOAD_FAIL=0
FAIL_NFT=0
printf '%s\n' '/example.cn/223.5.5.5' '127.0.0.1#5353' > "$DNS_BACKUP/server"
printf '0\n' > "$DNS_BACKUP/stale"
MOCK_UCI_GET_SPACE=1
MOCK_SERVER="$(cat "$DNS_BACKUP/server")"
MOCK_NORESOLV=1
set_proxy_dns
[ "$MOCK_NORESOLV" = 1 ]
restore_dnsmasq
[ "$MOCK_SERVER" = '/example.cn/223.5.5.5
127.0.0.1#5353' ]
[ -z "$MOCK_NORESOLV" ]

setup_case direct-dns-no-mosdns
DNS_RELOAD_FAIL=0
FAIL_NFT=0
TEST_DNSMASQ_DEFAULT='223.5.5.5#53'
TEST_MOSDNS_ENABLED=0
TEST_MOSDNS_DOMAINS='example.com,xn--ngstr-lra8j.com'
export FAIL_NFT TEST_DNSMASQ_DEFAULT TEST_MOSDNS_ENABLED TEST_MOSDNS_DOMAINS
MOCK_SERVER=""
MOCK_NORESOLV=""
set_proxy_dns
[ "$MOCK_SERVER" = '223.5.5.5#53' ]
[ "$MOCK_NORESOLV" = 1 ]
[ ! -e "$MOSDNS_FORWARD_FILE" ]
restore_dnsmasq
[ -z "$MOCK_SERVER" ]
[ -z "$MOCK_NORESOLV" ]

setup_case inherited-lock
mkdir -p "$LOCK_DIR"
printf '%s\n' "$$" > "$LOCK_DIR/pid"
V2RAYB_LOCK_HELD=1
export V2RAYB_LOCK_HELD
acquire_lock
[ "$LOCK_INHERITED" = 1 ]
release_lock
[ -d "$LOCK_DIR" ]
[ "${V2RAYB_LOCK_HELD:-}" = 1 ]
unset V2RAYB_LOCK_HELD
rm -rf "$LOCK_DIR"

setup_case legacy-procd
stop_instances
[ -e "$RUNTIME/legacy-cleaned" ]

if grep -q '"$CTL" test-dns' "$ROOT/files/etc/init.d/v2rayB"; then
	echo "external DNS probe must not gate service startup" >&2
	exit 1
fi
if grep -q '"$CTL" test-dnsmasq' "$ROOT/files/etc/init.d/v2rayB"; then
	echo "external dnsmasq probe must not gate service startup" >&2
	exit 1
fi
grep -q '"$CTL" get-setting service_enabled' "$ROOT/files/etc/init.d/v2rayB"
grep -q 'service_enabled' "$ROOT/files/etc/v2rayB/schema.sql"
grep -q 'cmd_get_setting()' "$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
grep -q 'get-setting) \[ "$#" -eq 1 \]' "$ROOT/files/usr/libexec/v2rayB/v2rayBctl"

echo "lifecycle tests: ok"
