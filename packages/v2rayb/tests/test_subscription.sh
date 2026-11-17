#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-subscription-test-$$
mkdir -p "$TEST_DIR/bin"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

PARSER="$ROOT/files/usr/libexec/v2rayB/v2rayB-subscription"
CTL="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
export V2RAYB_DB="$TEST_DIR/db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_RULE_DIR="$TEST_DIR/rules"
export V2RAYB_SUBSCRIPTION_DIR="$TEST_DIR/subscriptions"
export V2RAYB_SUBSCRIPTION_PARSER="$PARSER"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"

raw="$TEST_DIR/raw"
printf '%s\n' \
  'vless://00000000-0000-0000-0000-000000000000@example.com:443?security=tls&type=ws&path=%2Ffoo&host=cdn.example.com&alpn=h2%2Chttp%2F1.1&mux=1&muxConcurrency=16#HK-Test' \
  'trojan://password@example.net:443?security=tls&sni=example.net&mux=0#Home-Test' \
  'ss://YWVzLTI1Ni1nY206cGFzcw==@ss.example.net:8388#SS-Test' > "$raw"
parsed="$TEST_DIR/parsed"
sh "$PARSER" "$raw" uri demo > "$parsed"
[ "$(wc -l < "$parsed" | tr -d '[:space:]')" = 3 ]
grep -q 'HK-Test.*vless.*example.com.*443' "$parsed"
grep -q 'Home-Test.*trojan.*example.net.*443' "$parsed"
grep -q 'SS-Test.*shadowsocks.*ss.example.net.*8388' "$parsed"
grep -q '"alpn":\["h2","http/1.1"\]' "$parsed"
python3 - "$parsed" <<'PY'
import json
import sys
rows = [line.rstrip('\n').split('\t') for line in open(sys.argv[1], encoding='utf-8')]
assert len(rows) == 3
vless = json.loads(rows[0][4])['mux']
assert vless == {'enabled': True, 'concurrency': 16}
assert json.loads(rows[1][4])['mux']['enabled'] is False
assert json.loads(rows[2][4])['mux']['enabled'] is False
PY

vmess="$(printf '%s' '{"v":"2","ps":"VMess-Test","add":"vmess.example.com","port":"8443","id":"11111111-1111-1111-1111-111111111111","aid":"0","net":"ws","type":"none","host":"cdn.example.com","path":"/vmess","tls":"tls","sni":"vmess.example.com","scy":"auto"}' | base64 -w0)"
printf 'vmess://%s\n' "$vmess" > "$TEST_DIR/vmess"
sh "$PARSER" "$TEST_DIR/vmess" uri demo > "$TEST_DIR/vmess.nodes" 2> "$TEST_DIR/vmess.err"
[ ! -s "$TEST_DIR/vmess.err" ]
grep -q 'VMess-Test.*vmess.*vmess.example.com.*8443' "$TEST_DIR/vmess.nodes"
cut -f5 "$TEST_DIR/vmess.nodes" | python3 -c 'import json,sys; assert json.load(sys.stdin)["mux"]["enabled"] is False'
vmess_mux="$(printf '%s' '{"v":"2","ps":"VMess-Mux","add":"vmess.example.com","port":"8443","id":"11111111-1111-1111-1111-111111111111","aid":"0","net":"ws","host":"cdn.example.com","path":"/vmess","tls":"tls","sni":"vmess.example.com","scy":"auto","mux":"1","muxConcurrency":"12"}' | base64 -w0)"
printf 'vmess://%s\n' "$vmess_mux" > "$TEST_DIR/vmess-mux"
sh "$PARSER" "$TEST_DIR/vmess-mux" uri demo > "$TEST_DIR/vmess-mux.nodes"
cut -f5 "$TEST_DIR/vmess-mux.nodes" | python3 -c 'import json,sys; assert json.load(sys.stdin)["mux"] == {"enabled": True, "concurrency": 12}'

printf '%s\n' 'vless://00000000-0000-0000-0000-000000000000@example.com:443?security=tls#Unpadded-Test' \
	| base64 -w0 | tr -d '=' > "$TEST_DIR/unpadded"
sh "$PARSER" "$TEST_DIR/unpadded" auto demo > "$TEST_DIR/unpadded.nodes"
grep -q 'Unpadded-Test.*vless.*example.com.*443' "$TEST_DIR/unpadded.nodes"
cut -f5 "$TEST_DIR/unpadded.nodes" | python3 -c 'import json,sys; json.load(sys.stdin)'
printf '===' >> "$TEST_DIR/unpadded"
sh "$PARSER" "$TEST_DIR/unpadded" auto demo > "$TEST_DIR/excess-padding.nodes"
grep -q 'Unpadded-Test.*vless.*example.com.*443' "$TEST_DIR/excess-padding.nodes"

printf '%s\n' 'vless://00000000-0000-0000-0000-000000000000@example.com:443?security=tls#香港__AWS|01' > "$TEST_DIR/unicode-name"
sh "$PARSER" "$TEST_DIR/unicode-name" uri demo > "$TEST_DIR/unicode-name.nodes"
grep -q '香港_AWS_01.*vless.*example.com.*443' "$TEST_DIR/unicode-name.nodes"

"$ROOT/tests/sqlite3-wrapper.py" "$V2RAYB_DB" 'PRAGMA user_version;' >/dev/null
"$CTL" init-db
"$CTL" add-source subscription demo http://example.test/sub uri
"$CTL" add-source subscription '跨境订阅' http://example.test/cn uri
"$ROOT/tests/sqlite3-wrapper.py" "$V2RAYB_DB" "SELECT name FROM sources WHERE type='subscription' AND name='跨境订阅';" | grep -Fx '跨境订阅' >/dev/null
cat > "$TEST_DIR/bin/curl" <<'EOF'
#!/bin/sh
if [ "${FAKE_CURL_FAIL:-0}" = 1 ]; then
	exit 22
fi
output=''
while [ "$#" -gt 0 ]; do
	case "$1" in
		--output) output="$2"; shift 2 ;;
		*) shift ;;
	esac
done
printf '%s\n' 'vless://00000000-0000-0000-0000-000000000000@example.com:443?security=tls#HK-Test' > "$output"
EOF
chmod +x "$TEST_DIR/bin/curl"
export PATH="$TEST_DIR/bin:$PATH"

"$CTL" update-subscription 1 | grep -q '^nodes=1$'
"$ROOT/tests/sqlite3-wrapper.py" "$V2RAYB_DB" 'SELECT COUNT(*) FROM nodes WHERE source_id=1;' | grep -q '^1$'
job_id="$("$CTL" subscription-update-start 1)"
job_status=""
for attempt in $(seq 1 50); do
	job_status="$("$CTL" subscription-update-status "$job_id")"
	if echo "$job_status" | grep -q '^status=done$'; then
		break
	fi
	if echo "$job_status" | grep -q '^status=failed$'; then
		echo "background subscription update failed: $job_status" >&2
		exit 1
	fi
	sleep 0.1
done
echo "$job_status" | grep -q '^status=done$'

if FAKE_CURL_FAIL=1 "$CTL" update-subscription 1 >/dev/null 2>&1; then
	echo "failed subscription download unexpectedly succeeded" >&2
	exit 1
fi
"$ROOT/tests/sqlite3-wrapper.py" "$V2RAYB_DB" 'SELECT COUNT(*) FROM nodes WHERE source_id=1;' | grep -q '^1$'

"$CTL" add-node manual-node vless manual.example.com 443 '{"settings":{}}' >/dev/null
"$CTL" list-nodes | grep -q 'subscription.*demo'
"$CTL" list-nodes | grep -q 'manual'

echo "subscription tests: ok"

