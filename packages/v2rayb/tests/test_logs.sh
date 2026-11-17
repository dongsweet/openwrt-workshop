#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-logs-test-$$
mkdir -p "$TEST_DIR/state"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_LOGREAD="$TEST_DIR/logread"
ctl="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"

cat > "$V2RAYB_LOGREAD" <<'EOF'
#!/bin/sh
printf '%s\n' \
	'daemon.notice v2rayB: proxy mode started' \
	'user.notice v2rayB-watchdog: DNS probe failed (1/3)' \
	'daemon.info dnsmasq[1]: query[A] example.com from 127.0.0.1' \
	'daemon.info netifd: Interface wan is up'
EOF
chmod +x "$V2RAYB_LOGREAD"

i=1
while [ "$i" -le 60 ]; do
	printf 'v2ray-line-%s\n' "$i"
	i=$((i + 1))
done > "$V2RAYB_STATE_DIR/v2ray.log"
printf '%s\n' 'v2ray-error-line' > "$V2RAYB_STATE_DIR/v2ray-error.log"
printf '%s\n' 'mosdns-line' > "$V2RAYB_STATE_DIR/mosdns.log"

"$ctl" logs v2ray 50 | grep -q 'v2ray-error-line'
[ "$("$ctl" logs v2ray 50 | grep -c '^v2ray-line-')" = 50 ]
"$ctl" logs mosdns | grep -q 'mosdns-line'
"$ctl" logs v2rayb | grep -q 'proxy mode started'
"$ctl" logs watchdog | grep -q 'DNS probe failed'
"$ctl" logs dnsmasq | grep -q 'query\[A\]'
"$ctl" logs system | grep -q 'Interface wan is up'
"$ctl" logs all | grep -q 'v2ray-error-line'

if "$ctl" logs dnsmasq 500 >/dev/null 2>&1; then
	echo "unsupported log line count unexpectedly accepted" >&2
	exit 1
fi
if "$ctl" logs '$(touch /tmp/v2rayB-log-injection)' >/dev/null 2>&1; then
	echo "unsupported log component unexpectedly accepted" >&2
	exit 1
fi

echo "log tests: ok"
