#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=$(printenv TMPDIR 2>/dev/null || printf /tmp)/v2rayB-node-probe-test-$$
mkdir -p "$TEST_DIR/bin"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

export V2RAYB_DB="$TEST_DIR/db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_RULE_DIR="$TEST_DIR/rules"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"
ctl="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
sqlite="$ROOT/tests/sqlite3-wrapper.py"

cat > "$TEST_DIR/bin/curl" <<'EOF'
#!/bin/sh
printf '0.123000|0.180000|200'
EOF
chmod +x "$TEST_DIR/bin/curl"
export PATH="$TEST_DIR/bin:$PATH"

"$ctl" init-db
"$sqlite" "$V2RAYB_DB" "INSERT INTO sources(type,name) VALUES('manual','manual'); INSERT INTO nodes(source_id,name,protocol,server,port,data_json) VALUES(1,'probe-node','vless','probe.example.com',443,'{}');"
job_id="$("$ctl" node-probe-start manual)"
status=""
for attempt in $(seq 1 30); do
	status="$("$ctl" node-probe-status "$job_id")"
	if printf '%s\n' "$status" | grep -q '^status=done$'; then
		break
	fi
	if printf '%s\n' "$status" | grep -q '^status=failed$'; then
		echo "$status" >&2
		exit 1
	fi
	sleep 0.1
done
printf '%s\n' "$status" | grep -q '^status=done$'
printf '%s\n' "$status" | grep -q '^1[[:space:]]*123[[:space:]]*ok[[:space:]]*'
[ "$("$sqlite" "$V2RAYB_DB" 'SELECT last_latency_ms FROM nodes WHERE id=1;')" = 123 ]

echo "node probe tests: ok"
