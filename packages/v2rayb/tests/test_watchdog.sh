#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-watchdog-test-$$
BIN="$TEST_DIR/bin"
RUNTIME="$TEST_DIR/runtime"
mkdir -p "$BIN" "$RUNTIME"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

cat > "$BIN/curl" <<'EOF'
#!/bin/sh
[ "$(sed -n '1p' "$WATCHDOG_CURL_MODE")" = ok ]
EOF

cat > "$BIN/logger" <<'EOF'
#!/bin/sh
printf '%s\n' "$*" >> "$WATCHDOG_TEST_LOG"
EOF

cat > "$BIN/ctl" <<'EOF'
#!/bin/sh
case "$1" in
	get-setting)
		case "$2" in
			fallback_on_failure|watchdog_auto_recover) printf '1\n' ;;
			*) exit 2 ;;
		esac
		;;
	*) exit 2 ;;
esac
EOF

cat > "$BIN/init" <<'EOF'
#!/bin/sh
printf '%s\n' "$1" >> "$WATCHDOG_INIT_CALLS"
case "$1" in
	suspend)
		printf 'suspended\n' > "$WATCHDOG_RUNTIME/state"
		printf 'ok\n' > "$WATCHDOG_CURL_MODE"
		;;
	recover)
		printf 'proxy\n' > "$WATCHDOG_RUNTIME/state"
		;;
	*) exit 2 ;;
esac
EOF

chmod +x "$BIN/curl" "$BIN/logger" "$BIN/ctl" "$BIN/init"
printf 'proxy\n' > "$RUNTIME/state"
printf 'fail\n' > "$TEST_DIR/curl-mode"

export PATH="$BIN:$PATH"
export WATCHDOG_TEST_LOG="$TEST_DIR/watchdog.log"
export WATCHDOG_INIT_CALLS="$TEST_DIR/init.calls"
export WATCHDOG_RUNTIME="$RUNTIME"
export WATCHDOG_CURL_MODE="$TEST_DIR/curl-mode"
export V2RAYB_CTL="$BIN/ctl"
export V2RAYB_INIT_SCRIPT="$BIN/init"
export V2RAYB_RUNTIME_DIR="$RUNTIME"
export V2RAYB_WATCHDOG_FAIL_LIMIT=3
export V2RAYB_WATCHDOG_INITIAL_DELAY=0
export V2RAYB_WATCHDOG_PROBE_MIN=0
export V2RAYB_WATCHDOG_PROBE_MAX=0
export V2RAYB_WATCHDOG_MAX_CYCLES=6

"$ROOT/files/usr/bin/v2rayB-watchdog"

grep -q '^suspend$' "$WATCHDOG_INIT_CALLS"
grep -q '^recover$' "$WATCHDOG_INIT_CALLS"
[ "$(sed -n '1p' "$RUNTIME/state")" = proxy ]
grep -q 'proxy connectivity probe failed (1/3)' "$WATCHDOG_TEST_LOG"
grep -q 'proxy connectivity probe failed (3/3)' "$WATCHDOG_TEST_LOG"
grep -q 'withdrawing traffic and DNS imports' "$WATCHDOG_TEST_LOG"
grep -q 'traffic withdrawn; watchdog remains active' "$WATCHDOG_TEST_LOG"
grep -q 'proxy connectivity recovered; attempting automatic takeover' "$WATCHDOG_TEST_LOG"
grep -q 'automatic recovery completed' "$WATCHDOG_TEST_LOG"
! grep -Eq '^(start|restart|resume)$' "$WATCHDOG_INIT_CALLS"

echo "watchdog tests: ok"
