#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-probe-test-$$
BIN="$TEST_DIR/bin"
mkdir -p "$BIN" "$TEST_DIR/dnsmasq.d"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

export V2RAYB_DB="$TEST_DIR/db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_RULE_DIR="$TEST_DIR/rules"
export V2RAYB_DNSMASQ_DIR="$TEST_DIR/dnsmasq.d"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"
export PROBE_MOCK_CURL_ARGS="$TEST_DIR/curl.args"
export PATH="$BIN:$PATH"

cat >"$BIN/dig" <<'EOF'
#!/bin/sh
if [ "${PROBE_DNS_FAIL:-0}" = 1 ]; then
	printf '%s\n' ';; ->>HEADER<<- opcode: QUERY, status: SERVFAIL, id: 1' ';; Query time: 3 msec'
	exit 0
fi
for arg do type="$arg"; done
if [ "$type" = A ]; then
	printf '%s\n' \
		';; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 1' \
		';; ANSWER SECTION:' \
		'www.example.com. 60 IN A 198.51.100.10' \
		'www.example.com. 60 IN A 198.51.100.11' \
		';; Query time: 4 msec'
else
	printf '%s\n' \
		';; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 2' \
		';; ANSWER SECTION:' \
		'www.example.com. 60 IN AAAA 2001:db8::10' \
		';; Query time: 5 msec'
fi
EOF
cat >"$BIN/curl" <<'EOF'
#!/bin/sh
printf '%s\n' "$@" >"$PROBE_MOCK_CURL_ARGS"
printf '%s' '200|198.51.100.10|443|192.0.2.2|51000|0.020|0.040|0.080|0.100|0|2'
EOF
cat >"$BIN/ip" <<'EOF'
#!/bin/sh
if [ "$1" = route ] && [ "$2" = get ]; then
	printf '%s\n' "$4 via 192.0.2.1 dev eth0 src 192.0.2.2 uid 0"
	exit 0
fi
exit 1
EOF
cat >"$BIN/uci" <<'EOF'
#!/bin/sh
[ "$1" = -q ] || exit 2
[ "$2" = get ] || exit 2
case "$3" in
	dhcp.@dnsmasq\[0\].server) printf '%s\n' '/example.com/223.5.5.5#53' ;;
	*) exit 1 ;;
esac
EOF
chmod +x "$BIN/dig" "$BIN/curl" "$BIN/ip" "$BIN/uci"
printf '%s\n' \
	'# A less-specific rule must lose to the longest matching suffix.' \
	'server=/com/1.1.1.1#53' \
	'  server=/www.example.com/9.9.9.9#53 # the specific branch' \
	'server=/not-example.com/192.0.2.1#53' >"$TEST_DIR/dnsmasq.d/pass.conf"

ctl="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
"$ctl" init-db
job="$("$ctl" network-probe-start 'https://www.example.com/path?q=1')"
case "$job" in
	[0-9]*-[0-9]*) ;;
	*) echo "invalid probe job id: $job" >&2; exit 1 ;;
esac
status=running
output=''
i=0
while [ "$i" -lt 50 ] && [ "$status" = running ]; do
	output="$("$ctl" network-probe-status "$job")"
	status="$(printf '%s\n' "$output" | sed -n 's/^status=//p' | sed -n '1p')"
	[ "$status" = running ] || break
	i=$((i + 1))
	sleep 0.1
done
[ "$status" = done ]
printf '%s\n' "$output" | grep -q '^dns_result=success$'
printf '%s\n' "$output" | grep -q '^dns_a=198.51.100.10,198.51.100.11$'
printf '%s\n' "$output" | grep -q '^dns_aaaa=2001:db8::10$'
! printf '%s\n' "$output" | grep -q '^dns_matched_rule='
printf '%s\n' "$output" | grep -q '^https_result=success$'
printf '%s\n' "$output" | grep -q '^https_remote=198.51.100.10:443$'
printf '%s\n' "$output" | grep -q '^route_device=eth0$'
grep -q -- '--resolve' "$PROBE_MOCK_CURL_ARGS"
grep -q -- 'www.example.com:443:198.51.100.10,198.51.100.11,\[2001:db8::10\]' "$PROBE_MOCK_CURL_ARGS"

rm -f "$PROBE_MOCK_CURL_ARGS"
failed_job="$(PROBE_DNS_FAIL=1 "$ctl" network-probe-start 'https://www.example.com/')"
failed_status=running
failed_output=''
i=0
while [ "$i" -lt 50 ] && [ "$failed_status" = running ]; do
	failed_output="$(PROBE_DNS_FAIL=1 "$ctl" network-probe-status "$failed_job")"
	failed_status="$(printf '%s\n' "$failed_output" | sed -n 's/^status=//p' | sed -n '1p')"
	[ "$failed_status" = running ] || break
	i=$((i + 1))
	sleep 0.1
done
[ "$failed_status" = done ]
printf '%s\n' "$failed_output" | grep -q '^dns_result=failed$'
[ ! -e "$PROBE_MOCK_CURL_ARGS" ]

if "$ctl" network-probe-start 'ftp://www.example.com/' 2>/dev/null; then
	echo "unsupported scheme unexpectedly passed validation" >&2
	exit 1
fi

echo "network probe tests: ok"
