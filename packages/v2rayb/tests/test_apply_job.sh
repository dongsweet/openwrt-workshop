#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-apply-job-test-$$
BIN="$TEST_DIR/bin"
mkdir -p "$BIN" "$TEST_DIR/rules" "$TEST_DIR/runtime"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

export V2RAYB_DB="$TEST_DIR/db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_RULE_DIR="$TEST_DIR/rules"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"
export PATH="$BIN:$PATH"

cat >"$BIN/init" <<'EOF'
#!/bin/sh
printf '%s\n' "$1" >>"$V2RAYB_TEST_DIR/init.calls"
if [ -f "$V2RAYB_TEST_DIR/init.fail.$1" ]; then
	rm -f "$V2RAYB_TEST_DIR/init.fail.$1"
	exit 1
fi
if [ "$1" = start ] || [ "$1" = restart ]; then
	printf 'proxy\n' >"$V2RAYB_TEST_DIR/state/state"
elif [ "$1" = stop ]; then
	printf 'normal\n' >"$V2RAYB_TEST_DIR/state/state"
fi
exit 0
EOF
chmod +x "$BIN/init"
export V2RAYB_TEST_DIR="$TEST_DIR"
export V2RAYB_INIT_SCRIPT="$BIN/init"

ctl="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
"$ctl" init-db
"$ctl" add-node old vless old.example.com 443 \
	'{"settings":{"vnext":[{"address":"old.example.com","port":443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
"$ctl" add-profile old-profile 1 >/dev/null
"$ctl" apply-draft
printf 'proxy\n' > "$TEST_DIR/state/state"

"$ctl" update-node 1 new vless new.example.com 443 \
	'{"settings":{"vnext":[{"address":"new.example.com","port":443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
job="$("$ctl" apply-draft-start)"
case "$job" in [0-9]*-[0-9]*) ;; *) echo "invalid apply job id: $job" >&2; exit 1 ;; esac
status=''
i=0
while [ "$i" -lt 100 ]; do
	status="$("$ctl" apply-draft-status "$job")"
	if printf '%s\n' "$status" | grep -Eq '^status=(done|failed)$'; then
		break
	fi
	i=$((i + 1))
	sleep 0.1
done
if ! printf '%s\n' "$status" | grep -q '^status=done$'; then
	printf '%s\n' "$status" >&2
	find "$TEST_DIR/state/apply-jobs" -maxdepth 3 -type f -print -exec sh -c 'echo ---; cat "$1"' _ {} \; >&2
	exit 1
fi
printf '%s\n' "$status" | grep -q '^stage=complete$'
printf '%s\n' "$status" | grep -q '^rc=0$'
"$ctl" status | grep -q '^draft_pending=0$'
"$ctl" list-nodes | grep -q 'new.example.com'
[ ! -e "$TEST_DIR/state/db-before-apply" ]
[ ! -e "$TEST_DIR/state/apply-jobs/active" ]

# A second apply is rejected while a job is active.
"$ctl" update-node 1 newer vless newer.example.com 443 \
	'{"settings":{"vnext":[{"address":"newer.example.com","port":443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
mkdir -p "$TEST_DIR/state/apply-jobs/active"
printf '%s\n' '999999999-1' > "$TEST_DIR/state/apply-jobs/active/job_id"
printf '%s\n' "$$" > "$TEST_DIR/state/apply-jobs/active/pid"
mkdir -p "$TEST_DIR/state/apply-jobs/999999999-1"
printf '%s\n' running > "$TEST_DIR/state/apply-jobs/999999999-1/status"
if "$ctl" apply-draft-start >/dev/null 2>&1; then
	echo "concurrent apply unexpectedly started" >&2
	exit 1
fi
rm -rf "$TEST_DIR/state/apply-jobs/active" "$TEST_DIR/state/apply-jobs/999999999-1"

# Completed job metadata is durable and exposes all polling fields.
printf '%s\n' "$status" | grep -q '^started_at=.'
printf '%s\n' "$status" | grep -q '^finished_at=.'
printf '%s\n' "$status" | grep -q '^--output--$'
printf '%s\n' "$status" | grep -q '^--error--$'

# A service failure rolls the database back and reports the failed stage.
printf 'normal\n' > "$TEST_DIR/state/state"
: > "$TEST_DIR/init.fail.stop"
job="$("$ctl" apply-draft-start)"
status=''
i=0
while [ "$i" -lt 100 ]; do
	status="$("$ctl" apply-draft-status "$job")"
	if printf '%s\n' "$status" | grep -Eq '^status=(done|failed)$'; then
		break
	fi
	i=$((i + 1))
	sleep 0.1
done
if ! printf '%s\n' "$status" | grep -q '^status=failed$'; then
	printf '%s\n' "$status" >&2
	find "$TEST_DIR" -maxdepth 4 -type f -print -exec sh -c 'echo ---; cat "$1"' _ {} \; >&2
	exit 1
fi
printf '%s\n' "$status" | grep -q '^stage=restoring-service$'
printf '%s\n' "$status" | grep -q 'service stop failed'
[ ! -e "$TEST_DIR/init.fail.stop" ]
"$ctl" status | grep -q '^draft_pending=1$'
"$ctl" list-nodes | grep -q 'newer.example.com'
[ ! -e "$TEST_DIR/state/db-before-apply" ]

# Clean up the failed draft and return to the original applied image.
rm -f "$TEST_DIR/init.fail.stop"
"$ctl" revert-draft
"$ctl" status | grep -q '^draft_pending=0$'
"$ctl" list-nodes | grep -q 'new.example.com'
! "$ctl" list-nodes | grep -q 'newer.example.com'

echo "apply job tests: ok"
