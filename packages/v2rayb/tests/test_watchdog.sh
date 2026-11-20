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
			fallback_on_failure|watchdog_auto_recover|watchdog_restart_engine) printf '1\n' ;;
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
		: > "$WATCHDOG_RUNTIME/suspend-pending"
		suspend_count=0
		[ ! -f "$WATCHDOG_INIT_CALLS.suspend-count" ] || suspend_count="$(cat "$WATCHDOG_INIT_CALLS.suspend-count")"
		suspend_count=$((suspend_count + 1))
		printf '%s\n' "$suspend_count" > "$WATCHDOG_INIT_CALLS.suspend-count"
		if [ "$suspend_count" -le "${WATCHDOG_SUSPEND_FAILS:-0}" ]; then
			printf 'degraded\n' > "$WATCHDOG_RUNTIME/state"
			exit 1
		fi
		printf 'suspended\n' > "$WATCHDOG_RUNTIME/state"
		rm -f "$WATCHDOG_RUNTIME/suspend-pending"
		;;
	recover)
		[ "${WATCHDOG_RECOVER_FAIL:-0}" = 0 ] || exit 1
		printf 'restart\n' > "$WATCHDOG_RESTART_MARKER"
		printf 'ok\n' > "$WATCHDOG_CURL_MODE"
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
export WATCHDOG_RESTART_MARKER="$TEST_DIR/restart.marker"
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
grep -q 'suspended proxy is still unreachable; restarting the selected engine after the retry interval' "$WATCHDOG_TEST_LOG"
grep -q 'suspended engine restarted; takeover restored after successful probe' "$WATCHDOG_TEST_LOG"
grep -qx restart "$WATCHDOG_RESTART_MARKER"
! grep -Eq '^(start|restart|resume)$' "$WATCHDOG_INIT_CALLS"
[ ! -e "$RUNTIME/suspend-pending" ]

# A transient positive probe must not cause repeated engine restarts when
# the recovery health check itself continues to fail.
RECOVERY_RUNTIME="$TEST_DIR/recovery-runtime"
mkdir -p "$RECOVERY_RUNTIME"
printf 'suspended\n' > "$RECOVERY_RUNTIME/state"
printf 'ok\n' > "$TEST_DIR/recovery-curl-mode"
: > "$TEST_DIR/recovery-init.calls"
export WATCHDOG_RUNTIME="$RECOVERY_RUNTIME"
export V2RAYB_RUNTIME_DIR="$RECOVERY_RUNTIME"
export WATCHDOG_CURL_MODE="$TEST_DIR/recovery-curl-mode"
export WATCHDOG_INIT_CALLS="$TEST_DIR/recovery-init.calls"
export WATCHDOG_RECOVER_FAIL=1
export V2RAYB_WATCHDOG_MAX_CYCLES=6
"$ROOT/files/usr/bin/v2rayB-watchdog"
[ "$(grep -c '^recover$' "$WATCHDOG_INIT_CALLS")" -eq 1 ]
grep -q 'automatic recovery is waiting for its retry interval' "$WATCHDOG_TEST_LOG"

# If fail-open cleanup enters degraded, the watchdog keeps probing and retries
# the cleanup until the suspended state is complete.
PENDING_RUNTIME="$TEST_DIR/pending-runtime"
mkdir -p "$PENDING_RUNTIME"
: > "$PENDING_RUNTIME/suspend-pending"
printf 'degraded\n' > "$PENDING_RUNTIME/state"
: > "$TEST_DIR/pending-init.calls"
export WATCHDOG_RUNTIME="$PENDING_RUNTIME"
export V2RAYB_RUNTIME_DIR="$PENDING_RUNTIME"
export WATCHDOG_CURL_MODE="$TEST_DIR/curl-mode"
export WATCHDOG_INIT_CALLS="$TEST_DIR/pending-init.calls"
export WATCHDOG_SUSPEND_FAILS=2
export V2RAYB_WATCHDOG_MAX_CYCLES=5
"$ROOT/files/usr/bin/v2rayB-watchdog"
[ "$(grep -c '^suspend$' "$WATCHDOG_INIT_CALLS")" -eq 3 ]
[ "$(sed -n '1p' "$PENDING_RUNTIME/state")" = suspended ]
[ ! -e "$PENDING_RUNTIME/suspend-pending" ]
grep -q 'fail-open cleanup remains incomplete; watchdog will probe and retry' "$WATCHDOG_TEST_LOG"
grep -q 'fail-open suspension completed after retry' "$WATCHDOG_TEST_LOG"

echo "watchdog tests: ok"
