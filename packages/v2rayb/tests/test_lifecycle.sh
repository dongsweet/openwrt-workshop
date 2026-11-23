#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-lifecycle-test-$$
mkdir -p "$TEST_DIR"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

. "$ROOT/files/etc/init.d/v2rayB"

log() { :; }
uci() {
	[ "$1" = -q ] && shift
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
		commit)
			[ "${UCI_COMMIT_FAIL:-0}" = 0 ] && printf 'commit\n' >> "$UCI_CALL_LOG"
			;;
		*) return 2 ;;
	esac
}
cleanup_legacy_procd() {
	touch "$RUNTIME/legacy-cleaned"
	[ "${FAIL_LEGACY:-0}" = 0 ]
}
dnsmasq_reload() { [ "${DNS_RELOAD_FAIL:-0}" = 0 ]; }
dnsmasq_restart_config() {
	printf 'restart\n' >> "$UCI_CALL_LOG"
	[ "${DNS_RELOAD_FAIL:-0}" = 0 ]
}
dnsmasq_ready() { return 0; }

spawn_managed() {
	mkdir -p "$PID_DIR"
	sleep 60 &
	printf '%s\n' "$!" > "$PID_DIR/$1.pid"
}

setup_case() {
	RUNTIME="$TEST_DIR/$1"
	PID_DIR="$RUNTIME/pids"
	DNS_BACKUP="$RUNTIME/dnsmasq-before"
	SUSPEND_PENDING="$RUNTIME/suspend-pending"
	LOCK_DIR="$RUNTIME/lock"
	DNSMASQ_DIR="$RUNTIME/dnsmasq.d"
	MOSDNS_FORWARD_FILE="$DNSMASQ_DIR/90-v2rayB-mosdns.conf"
	MOSDNS_FORWARD_EXPECTED="$RUNTIME/dnsmasq-mosdns-expected"
	BOOTSTRAP_DNS_FILE="$DNSMASQ_DIR/90-v2rayB-bootstrap.conf"
	BOOTSTRAP_DNS_EXPECTED="$RUNTIME/dnsmasq-bootstrap-expected"
	SUBSCRIPTION_DNS_FILE="$DNSMASQ_DIR/89-v2rayB-subscriptions.conf"
	SUBSCRIPTION_DNS_EXPECTED="$RUNTIME/dnsmasq-subscriptions-expected"
	FORCE_PROXY_DNS_FILE="$DNSMASQ_DIR/88-v2rayB-force-proxy.conf"
	FORCE_PROXY_DNS_EXPECTED="$RUNTIME/dnsmasq-force-proxy-expected"
	LEGACY_FORCE_PROXY_FILE="$DNSMASQ_DIR/v2rayB-force-proxy.conf"
	CTL="$TEST_DIR/ctl"
	MOCK_SERVER=""
	MOCK_NORESOLV=""
	MOCK_UCI_GET_SPACE=0
	TEST_DNSMASQ_DEFAULT='127.0.0.1#5353'
	TEST_MOSDNS_ENABLED=1
	TEST_MOSDNS_DOMAINS='xn--ngstr-lra8j.com'
	TEST_BOOTSTRAP_DOMAIN='bootstrap.example.com'
	TEST_SUBSCRIPTION_DOMAINS='sub.example.com,alternate.example.net'
	TEST_FORCE_PROXY_DOMAINS=''
	TEST_TRANSPARENT_PROXY_PORT='12345'
	TEST_PROBE_ENABLED='1'
	TEST_PROBE_PORT='12346'
	TEST_DIRECT_DNS_UPSTREAMS='223.5.5.5:53'
	TEST_ENGINE='v2ray'
	UCI_CALL_LOG="$RUNTIME/uci.calls"
	UCI_COMMIT_FAIL=0
	export RUNTIME PID_DIR FAIL_NFT DNSMASQ_DIR UCI_CALL_LOG UCI_COMMIT_FAIL MOSDNS_FORWARD_FILE MOSDNS_FORWARD_EXPECTED \
		BOOTSTRAP_DNS_FILE BOOTSTRAP_DNS_EXPECTED SUBSCRIPTION_DNS_FILE SUBSCRIPTION_DNS_EXPECTED FORCE_PROXY_DNS_FILE FORCE_PROXY_DNS_EXPECTED LEGACY_FORCE_PROXY_FILE \
		MOCK_SERVER MOCK_NORESOLV MOCK_UCI_GET_SPACE TEST_DNSMASQ_DEFAULT TEST_MOSDNS_ENABLED TEST_MOSDNS_DOMAINS TEST_BOOTSTRAP_DOMAIN TEST_SUBSCRIPTION_DOMAINS TEST_FORCE_PROXY_DOMAINS TEST_TRANSPARENT_PROXY_PORT TEST_PROBE_ENABLED TEST_PROBE_PORT TEST_DIRECT_DNS_UPSTREAMS TEST_ENGINE
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
	status) printf 'state=%s\n' "$(sed -n '1p' "$RUNTIME/state")" ;;
	get-setting)
		case "$2" in
			service_enabled) printf '1\n' ;;
			watchdog_enabled)
				if [ "$(sed -n '1p' "$RUNTIME/state")" = watchdog-disabled-state ]; then
					printf '0\n'
				else
					printf '1\n'
				fi
				;;
			fallback_on_failure|watchdog_auto_recover|watchdog_restart_engine) printf '1\n' ;;
			force_proxy_domains) printf '%s\n' "$TEST_FORCE_PROXY_DOMAINS" ;;
			*) return 1 ;;
		esac
		;;
	set-setting) exit 0 ;;
	get-active-engine) printf '%s\n' "${TEST_ENGINE:-v2ray}" ;;
	init-db|render-all|test-v2ray) exit 0 ;;
	apply-nft)
		[ -z "${APPLY_NFT_LOG:-}" ] || printf 'called\n' >> "$APPLY_NFT_LOG"
		[ -z "${LIFECYCLE_EVENT_LOG:-}" ] || printf 'nft\n' >> "$LIFECYCLE_EVENT_LOG"
		exit 0
		;;
	delete-nft)
		[ -z "${DELETE_NFT_LOG:-}" ] || printf 'called\n' >> "$DELETE_NFT_LOG"
		[ "${FAIL_NFT:-0}" = 0 ]
		;;
	dns-settings)
		printf '%s\n' 'runtime_state=starting' \
			"dnsmasq_default=$TEST_DNSMASQ_DEFAULT" \
			'direct_dns=223.5.5.5:53' "direct_dns_upstreams=$TEST_DIRECT_DNS_UPSTREAMS" \
			"bootstrap_domain=$TEST_BOOTSTRAP_DOMAIN" 'use_v2ray_dns=1' \
			"mosdns_enabled=$TEST_MOSDNS_ENABLED" \
			"mosdns_domains=$TEST_MOSDNS_DOMAINS" \
			'mosdns_listen=127.0.0.1#5354' 'v2ray_dns_listen=127.0.0.1#5353' \
			"transparent_proxy_port=$TEST_TRANSPARENT_PROXY_PORT" \
			"probe_enabled=$TEST_PROBE_ENABLED" "probe_port=$TEST_PROBE_PORT" \
			"subscription_domains=$TEST_SUBSCRIPTION_DOMAINS" \
			"force_proxy_domains=$TEST_FORCE_PROXY_DOMAINS"
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
	'server=/bootstrap.example.com/223.5.5.5#53' \
	'nftset=/bootstrap.example.com/4#inet#v2rayB#pass' \
	'nftset=/bootstrap.example.com/6#inet#v2rayB#pass6' > "$BOOTSTRAP_DNS_EXPECTED"
cp "$BOOTSTRAP_DNS_EXPECTED" "$BOOTSTRAP_DNS_FILE"
printf '%s\n' '# Managed by v2rayB; removed when proxy mode stops.' \
	'server=/sub.example.com/223.5.5.5#53' \
	'nftset=/sub.example.com/4#inet#v2rayB#pass' \
	'nftset=/sub.example.com/6#inet#v2rayB#pass6' \
	'server=/alternate.example.net/223.5.5.5#53' \
	'nftset=/alternate.example.net/4#inet#v2rayB#pass' \
	'nftset=/alternate.example.net/6#inet#v2rayB#pass6' > "$SUBSCRIPTION_DNS_EXPECTED"
cp "$SUBSCRIPTION_DNS_EXPECTED" "$SUBSCRIPTION_DNS_FILE"
printf '%s\n' '# Managed by v2rayB; removed when proxy mode stops.' \
	'nftset=/services.googleapis.cn/4#inet#v2rayB#force_proxy4' \
	'nftset=/services.googleapis.cn/6#inet#v2rayB#force_proxy6' > "$FORCE_PROXY_DNS_EXPECTED"
cp "$FORCE_PROXY_DNS_EXPECTED" "$FORCE_PROXY_DNS_FILE"
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
[ ! -e "$FORCE_PROXY_DNS_FILE" ]
[ ! -e "$FORCE_PROXY_DNS_EXPECTED" ]
[ "$(sed -n '1p' "$RUNTIME/state")" = normal ]

setup_case legacy-subscription-rule
printf '%s\n' '# Managed by v2rayB; removed when proxy mode stops.' \
	'server=/old.example.com/61.139.2.69' > "$SUBSCRIPTION_DNS_FILE"
restore_dnsmasq
[ ! -e "$SUBSCRIPTION_DNS_FILE" ]

setup_case modified-subscription-rule
printf '%s\n' '# User-owned rule' \
	'server=/keep.example.com/9.9.9.9' > "$SUBSCRIPTION_DNS_FILE"
if restore_dnsmasq; then
	echo "modified subscription rule was unexpectedly removed" >&2
	exit 1
fi
grep -q 'server=/keep.example.com/9.9.9.9' "$SUBSCRIPTION_DNS_FILE"

setup_case legacy-force-proxy
printf '%s\n' \
	"# Google Play's China-market control endpoint must use the proxy even though" \
	'# its DNS answer belongs to a China IP range.' \
	'nftset=/services.googleapis.cn/4#inet#v2rayB#force_proxy' \
	'' \
	'# Do not add xn--ngstr-lra8j.com here. Its mainland GGC download answers must' \
	'# remain direct and are already covered by the normal cn address set.' > "$LEGACY_FORCE_PROXY_FILE"
remove_legacy_force_proxy_rule
[ ! -e "$LEGACY_FORCE_PROXY_FILE" ]

setup_case modified-legacy-force-proxy
printf '%s\n' '# User-owned rule' > "$LEGACY_FORCE_PROXY_FILE"
remove_legacy_force_proxy_rule
grep -q '^# User-owned rule$' "$LEGACY_FORCE_PROXY_FILE"

setup_case multi-direct-dns
TEST_DIRECT_DNS_UPSTREAMS='223.5.5.5:53,119.29.29.29:53'
export TEST_DIRECT_DNS_UPSTREAMS
load_dns_policy
write_bootstrap_dns_expected
write_subscription_dns_expected
grep -q 'server=/bootstrap.example.com/223.5.5.5#53' "$BOOTSTRAP_DNS_EXPECTED"
grep -q 'server=/bootstrap.example.com/119.29.29.29#53' "$BOOTSTRAP_DNS_EXPECTED"
[ "$(grep -c '^server=/bootstrap.example.com/' "$BOOTSTRAP_DNS_EXPECTED")" = 2 ]
grep -q 'server=/sub.example.com/223.5.5.5#53' "$SUBSCRIPTION_DNS_EXPECTED"
grep -q 'server=/sub.example.com/119.29.29.29#53' "$SUBSCRIPTION_DNS_EXPECTED"
[ "$(grep -c '^server=/sub.example.com/' "$SUBSCRIPTION_DNS_EXPECTED")" = 2 ]
[ "$(grep -c '^nftset=/sub.example.com/4' "$SUBSCRIPTION_DNS_EXPECTED")" = 1 ]

setup_case dns-commit-failure
printf '%s\n' '223.5.5.5' > "$DNS_BACKUP/server"
printf '1\n' > "$DNS_BACKUP/noresolv"
printf '0\n' > "$DNS_BACKUP/stale"
UCI_COMMIT_FAIL=1
export UCI_COMMIT_FAIL
if set_proxy_dns; then
	echo "DNS switch unexpectedly succeeded when UCI commit failed" >&2
	exit 1
fi

setup_case dns-routing
DNS_RELOAD_FAIL=0
FAIL_NFT=0
TEST_FORCE_PROXY_DOMAINS='services.googleapis.cn'
export FAIL_NFT
printf '%s\n' '/example.cn/223.5.5.5' '127.0.0.1#5353' > "$DNS_BACKUP/server"
printf '1\n' > "$DNS_BACKUP/noresolv"
printf '1\n' > "$DNS_BACKUP/stale"
MOCK_SERVER="$(cat "$DNS_BACKUP/server")"
MOCK_NORESOLV=1
set_proxy_dns
cmp -s "$MOSDNS_FORWARD_FILE" "$MOSDNS_FORWARD_EXPECTED"
grep -q '^nftset=/services.googleapis.cn/4#inet#v2rayB#force_proxy4$' "$FORCE_PROXY_DNS_FILE"
grep -q '^nftset=/services.googleapis.cn/6#inet#v2rayB#force_proxy6$' "$FORCE_PROXY_DNS_FILE"
cmp -s "$BOOTSTRAP_DNS_FILE" "$BOOTSTRAP_DNS_EXPECTED"
grep -q 'server=/sub.example.com/223.5.5.5#53' "$SUBSCRIPTION_DNS_FILE"
grep -q 'nftset=/sub.example.com/4#inet#v2rayB#pass' "$SUBSCRIPTION_DNS_FILE"
grep -q 'nftset=/sub.example.com/6#inet#v2rayB#pass6' "$SUBSCRIPTION_DNS_FILE"
grep -q 'server=/alternate.example.net/223.5.5.5#53' "$SUBSCRIPTION_DNS_FILE"
grep -q 'nftset=/alternate.example.net/4#inet#v2rayB#pass' "$SUBSCRIPTION_DNS_FILE"
grep -q 'nftset=/alternate.example.net/6#inet#v2rayB#pass6' "$SUBSCRIPTION_DNS_FILE"
grep -q 'nftset=/bootstrap.example.com/4#inet#v2rayB#pass' "$BOOTSTRAP_DNS_FILE"
grep -q 'nftset=/bootstrap.example.com/6#inet#v2rayB#pass6' "$BOOTSTRAP_DNS_FILE"
[ "$MOCK_SERVER" = '/example.cn/223.5.5.5
127.0.0.1#5353' ]
[ "$MOCK_NORESOLV" = 1 ]
restore_dnsmasq
[ ! -e "$FORCE_PROXY_DNS_FILE" ]
[ ! -e "$MOSDNS_FORWARD_FILE" ]
[ ! -e "$BOOTSTRAP_DNS_FILE" ]
[ ! -e "$BOOTSTRAP_DNS_EXPECTED" ]
[ ! -e "$SUBSCRIPTION_DNS_FILE" ]
[ ! -e "$SUBSCRIPTION_DNS_EXPECTED" ]
[ "$MOCK_SERVER" = '/example.cn/223.5.5.5' ]
[ -z "$MOCK_NORESOLV" ]
[ "$(grep -c '^commit$' "$UCI_CALL_LOG")" = 2 ]

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

setup_case proxy-health
curl() { [ "${PROXY_HEALTH_OK:-0}" = 1 ]; }
PROXY_HEALTH_OK=1 proxy_connected 12346
if PROXY_HEALTH_OK=0 proxy_connected 12346; then
	echo "failed proxy health probe unexpectedly succeeded" >&2
	exit 1
fi
unset -f curl

setup_case suspend
DNS_RELOAD_FAIL=0
FAIL_NFT=0
export FAIL_NFT
printf '%s\n' '/example.cn/223.5.5.5' '127.0.0.1#5353' > "$DNS_BACKUP/server"
printf '1\n' > "$DNS_BACKUP/noresolv"
printf '1\n' > "$DNS_BACKUP/stale"
set_proxy_dns
grep -qx commit "$UCI_CALL_LOG"
grep -qx restart "$UCI_CALL_LOG"
spawn_managed v2ray
spawn_managed mosdns
spawn_managed watchdog
engine_pid="$(cat "$PID_DIR/v2ray.pid")"
watchdog_pid="$(cat "$PID_DIR/watchdog.pid")"
suspend_service
[ "$(sed -n '1p' "$RUNTIME/state")" = suspended ]
kill -0 "$engine_pid"
kill -0 "$watchdog_pid"
[ -e "$PID_DIR/v2ray.pid" ]
[ -e "$PID_DIR/watchdog.pid" ]
[ ! -e "$PID_DIR/mosdns.pid" ]
[ ! -e "$DNS_BACKUP" ]
[ ! -e "$BOOTSTRAP_DNS_FILE" ]
[ ! -e "$SUBSCRIPTION_DNS_FILE" ]
[ "$MOCK_SERVER" = '/example.cn/223.5.5.5' ]
[ -z "$MOCK_NORESOLV" ]
grep -qx commit "$UCI_CALL_LOG"
[ ! -e "$SUSPEND_PENDING" ]

setup_case suspend-degraded-retry
DNS_RELOAD_FAIL=0
FAIL_NFT=1
export FAIL_NFT
spawn_managed mosdns
mosdns_pid="$(cat "$PID_DIR/mosdns.pid")"
if suspend_service; then
	echo "suspend unexpectedly succeeded after nft cleanup failure" >&2
	exit 1
fi
[ "$(sed -n '1p' "$RUNTIME/state")" = degraded ]
[ -f "$SUSPEND_PENDING" ]
kill -0 "$mosdns_pid"
FAIL_NFT=0
export FAIL_NFT
suspend_service
[ "$(sed -n '1p' "$RUNTIME/state")" = suspended ]
[ ! -e "$SUSPEND_PENDING" ]
[ ! -e "$PID_DIR/mosdns.pid" ]

setup_case proxy-restart-engine-only
TEST_MOSDNS_ENABLED=0
export TEST_MOSDNS_ENABLED
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf '/example.cn/223.5.5.5\n' > "$DNS_BACKUP/server"
printf '0\n' > "$DNS_BACKUP/noresolv"
LIFECYCLE_EVENT_LOG="$RUNTIME/events"
DELETE_NFT_LOG="$RUNTIME/delete-nft.calls"
export LIFECYCLE_EVENT_LOG DELETE_NFT_LOG
prepare_engine_config_access() { return 0; }
restart_engine() { printf 'engine\n' >> "$LIFECYCLE_EVENT_LOG"; }
port_ready() { printf 'port:%s\n' "$1" >> "$LIFECYCLE_EVENT_LOG"; }
proxy_connected() { printf 'health\n' >> "$LIFECYCLE_EVENT_LOG"; }
set_proxy_dns() { printf 'dns\n' >> "$LIFECYCLE_EVENT_LOG"; }
restore_dnsmasq() { printf 'called\n' > "$RUNTIME/restore-dns.called"; }
restart
printf '%s\n' engine port:5353 port:12346 health > "$RUNTIME/events.expected"
cmp -s "$LIFECYCLE_EVENT_LOG" "$RUNTIME/events.expected"
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
[ -d "$DNS_BACKUP" ]
[ ! -e "$RUNTIME/restore-dns.called" ]
[ ! -e "$DELETE_NFT_LOG" ]
[ ! -d "$LOCK_DIR" ]

setup_case proxy-restart-in-place
TEST_MOSDNS_ENABLED=0
export TEST_MOSDNS_ENABLED
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf '/example.cn/223.5.5.5\n' > "$DNS_BACKUP/server"
printf '0\n' > "$DNS_BACKUP/noresolv"
LIFECYCLE_EVENT_LOG="$RUNTIME/events"
DELETE_NFT_LOG="$RUNTIME/delete-nft.calls"
export LIFECYCLE_EVENT_LOG DELETE_NFT_LOG
prepare_engine_config_access() { return 0; }
restart_engine() { printf 'engine\n' >> "$LIFECYCLE_EVENT_LOG"; }
port_ready() { printf 'port:%s\n' "$1" >> "$LIFECYCLE_EVENT_LOG"; }
proxy_connected() { printf 'health\n' >> "$LIFECYCLE_EVENT_LOG"; }
set_proxy_dns() { printf 'dns\n' >> "$LIFECYCLE_EVENT_LOG"; }
restore_dnsmasq() { printf 'called\n' > "$RUNTIME/restore-dns.called"; }
restart refresh
printf '%s\n' engine port:5353 port:12346 health nft dns > "$RUNTIME/events.expected"
cmp -s "$LIFECYCLE_EVENT_LOG" "$RUNTIME/events.expected"
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
[ -d "$DNS_BACKUP" ]
[ ! -e "$RUNTIME/restore-dns.called" ]
[ ! -e "$DELETE_NFT_LOG" ]
[ ! -d "$LOCK_DIR" ]

setup_case proxy-restart-failure
TEST_MOSDNS_ENABLED=0
export TEST_MOSDNS_ENABLED
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf 'baseline\n' > "$DNS_BACKUP/server"
printf '0\n' > "$DNS_BACKUP/noresolv"
DELETE_NFT_LOG="$RUNTIME/delete-nft.calls"
export DELETE_NFT_LOG
prepare_engine_config_access() { return 0; }
restart_engine() { return 1; }
restore_dnsmasq() { rm -rf "$DNS_BACKUP"; }
if restart_proxy_service; then
	echo "failed proxy restart unexpectedly succeeded" >&2
	exit 1
fi
[ "$(sed -n '1p' "$RUNTIME/state")" = suspended ]
[ ! -d "$DNS_BACKUP" ]
[ -e "$DELETE_NFT_LOG" ]
[ ! -d "$LOCK_DIR" ]

setup_case suspended-reload
printf 'suspended\n' > "$RUNTIME/state"
(
	recover_service() { printf 'recover\n' >> "$RUNTIME/reload.calls"; }
	reload_service
	restart
)
[ "$(sed -n '1p' "$RUNTIME/reload.calls")" = recover ]
[ "$(sed -n '2p' "$RUNTIME/reload.calls")" = recover ]

setup_case recover-preserves-engine
spawn_managed v2ray
spawn_managed watchdog
engine_pid="$(cat "$PID_DIR/v2ray.pid")"
watchdog_pid="$(cat "$PID_DIR/watchdog.pid")"
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf 'suspended\n' > "$RUNTIME/state"
start_mosdns() { spawn_managed mosdns; }
port_ready() { return 0; }
proxy_connected() { return 0; }
set_proxy_dns() { return 0; }
prepare_engine_config_access() { return 0; }
restart_engine() { printf 'called\n' > "$RUNTIME/restart-engine.called"; }
recover_service
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
[ -e "$RUNTIME/restart-engine.called" ]
kill -0 "$engine_pid"
kill -0 "$watchdog_pid"
[ -e "$PID_DIR/mosdns.pid" ]

setup_case recover-failure-preserves-engine
spawn_managed v2ray
spawn_managed watchdog
engine_pid="$(cat "$PID_DIR/v2ray.pid")"
watchdog_pid="$(cat "$PID_DIR/watchdog.pid")"
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf 'suspended\n' > "$RUNTIME/state"
port_ready() { return 0; }
proxy_connected() { return 1; }
prepare_engine_config_access() { return 0; }
restart_engine() { printf 'called\n' > "$RUNTIME/restart-engine.called"; }
if recover_service; then
	echo "failed automatic recovery unexpectedly restored imports" >&2
	exit 1
fi
[ "$(sed -n '1p' "$RUNTIME/state")" = suspended ]
[ -e "$RUNTIME/restart-engine.called" ]
kill -0 "$engine_pid"
kill -0 "$watchdog_pid"
[ ! -e "$PID_DIR/mosdns.pid" ]

setup_case recover-restart-hung-engine
spawn_managed v2ray
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf 'suspended\n' > "$RUNTIME/state"
port_ready() { return 0; }
restart_engine_called="$RUNTIME/restart-engine.called"
restart_engine() {
	printf 'called\n' > "$restart_engine_called"
	return 0
}
proxy_connected() {
	[ -e "$restart_engine_called" ]
}
set_proxy_dns() { return 0; }
test_engine_ok() { return 0; }
prepare_engine_config_access() { return 0; }
start_mosdns() { spawn_managed mosdns; }
recover_service
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
[ -e "$restart_engine_called" ]

setup_case recover-restart-hung-engine-after-manual-suspend
spawn_managed v2ray
mkdir -p "$RUNTIME/active"
printf '%s\n' '{}' > "$RUNTIME/active/v2ray.json"
printf 'suspended\n' > "$RUNTIME/state"
restart_engine_called="$RUNTIME/restart-engine.called"
restart_engine() {
	printf 'called\n' > "$restart_engine_called"
	return 0
}
proxy_connected() { [ -e "$restart_engine_called" ]; }
set_proxy_dns() { return 0; }
prepare_engine_config_access() { return 0; }
start_mosdns() { spawn_managed mosdns; }
recover_service
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
[ -e "$restart_engine_called" ]

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

setup_case watchdog-disabled
printf 'watchdog-disabled-state\n' > "$RUNTIME/state"
start_watchdog
[ ! -e "$PID_DIR/watchdog.pid" ]

setup_case engine-selection
TEST_ENGINE=v2ray
selected_engine | grep -qx v2ray
TEST_ENGINE=xray
selected_engine | grep -qx xray
TEST_ENGINE=invalid
selected_engine | grep -qx v2ray

setup_case legacy-procd
stop_instances
[ -e "$RUNTIME/legacy-cleaned" ]

setup_case probe-disabled-start
TEST_PROBE_ENABLED=0
export TEST_PROBE_ENABLED
printf 'normal\n' > "$RUNTIME/state"
rm -rf "$DNS_BACKUP"
prepare_engine_config_access() { return 0; }
capture_dnsmasq_baseline() { return 0; }
start_engine() { return 0; }
port_ready() { return 0; }
start_mosdns() { return 0; }
set_proxy_dns() { return 0; }
start_watchdog() { return 0; }
proxy_connected() {
	printf 'called\n' > "$RUNTIME/proxy-connected"
	return 1
}
set_bootstrap_dns() { return 0; }
start_service
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
[ ! -e "$RUNTIME/proxy-connected" ]

setup_case probe-enabled-start-failure
TEST_PROBE_ENABLED=1
APPLY_NFT_LOG="$RUNTIME/apply-nft.called"
export TEST_PROBE_ENABLED APPLY_NFT_LOG
printf 'normal\n' > "$RUNTIME/state"
rm -rf "$DNS_BACKUP"
if start_service; then
	echo "failed connectivity probe unexpectedly imported traffic" >&2
	exit 1
fi
[ "$(sed -n '1p' "$RUNTIME/state")" = suspended ]
[ -e "$RUNTIME/proxy-connected" ]
[ ! -e "$APPLY_NFT_LOG" ]

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
