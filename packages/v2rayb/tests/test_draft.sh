#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-draft-test-$$
mkdir -p "$TEST_DIR"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

export V2RAYB_DB="$TEST_DIR/db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_RULE_DIR="$TEST_DIR/rules"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"

ctl="$ROOT/files/usr/libexec/v2rayB/v2rayBctl"
sqlite="$ROOT/tests/sqlite3-wrapper.py"

"$ctl" init-db
"$ctl" add-node original vless original.example.com 443 \
	'{"settings":{"vnext":[{"address":"original.example.com","port":443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
"$ctl" add-profile original-profile 1 >/dev/null
"$ctl" apply-draft

# A saved edit must remain a draft and not affect applied runtime data.
"$ctl" update-node 1 draft-name vless draft.example.com 8443 \
	'{"settings":{"vnext":[{"address":"draft.example.com","port":8443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
"$ctl" status | grep -q '^draft_pending=1$'
"$ctl" list-nodes | grep -q 'draft-name.*draft.example.com.*8443'
"$ctl" render-all
! grep -q 'draft.example.com' "$TEST_DIR/state/active/v2ray.json"
grep -q 'original.example.com' "$TEST_DIR/state/active/v2ray.json"

# Revert restores the applied view.
"$ctl" revert-draft
"$ctl" status | grep -q '^draft_pending=0$'
"$ctl" list-nodes | grep -q 'original.*original.example.com.*443'
if "$ctl" list-nodes | grep -q 'draft-name'; then
	echo "draft node survived revert" >&2
	exit 1
fi

# Apply makes the draft authoritative.
"$ctl" update-node 1 applied-name vless applied.example.com 9443 \
	'{"settings":{"vnext":[{"address":"applied.example.com","port":9443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
"$ctl" apply-draft
"$ctl" status | grep -q '^draft_pending=0$'
"$ctl" render-all
grep -q 'applied.example.com' "$TEST_DIR/state/active/v2ray.json"

# A draft without an enabled active node is rejected.
"$ctl" set-setting active_profile ''
if "$ctl" apply-draft >/dev/null 2>&1; then
	echo "draft without active profile unexpectedly applied" >&2
	exit 1
fi
"$ctl" revert-draft

echo "draft tests: ok"
