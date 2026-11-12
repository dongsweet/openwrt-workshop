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
"$ctl" status | grep -q '^draft_pending=0$'
applied_version="$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='applied_config_version';")"

# A saved edit must remain a draft and not affect applied runtime data.
"$ctl" update-node 1 draft-name vless draft.example.com 8443 \
	'{"settings":{"vnext":[{"address":"draft.example.com","port":8443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
"$ctl" update-profile 1 draft-profile 1 1.1.1.1:53 '443,8443' 0 0 0 'example.com' \
	'regexp:^draft\\.example\\.com$' >/dev/null
"$ctl" status | grep -q '^draft_pending=1$'
draft_version="$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_config_version';")"
[ "$draft_version" -gt "$applied_version" ]
"$ctl" list-nodes | grep -q 'draft-name.*draft.example.com.*8443'
"$ctl" get-profile 1 | grep -q '^name=draft-profile$'
"$ctl" get-applied-profile | grep -q '^1	original-profile	'
! "$ctl" get-applied-profile | grep -q 'draft-profile'

# A missing draft policy is restored before a profile policy update.
"$sqlite" "$V2RAYB_DB" 'DELETE FROM draft_policies;'
"$ctl" set-profile-policy 1 223.5.5.5:53 '80,443' 1 1 0 'example.com' 'regexp:^cdn\.example\.com$' 1
policy_count="$("$sqlite" -batch -bail "$V2RAYB_DB" 'SELECT COUNT(*) FROM draft_policies;')"
[ "$policy_count" = 1 ]

"$ctl" render-all
! grep -q 'draft.example.com' "$TEST_DIR/state/active/v2ray.json"
grep -q 'original.example.com' "$TEST_DIR/state/active/v2ray.json"
! "$ctl" get-v2ray-config | grep -q 'draft.example.com'
"$ctl" get-v2ray-config | grep -q 'original.example.com'

# Revert restores the applied view.
"$ctl" revert-draft
"$ctl" status | grep -q '^draft_pending=0$'
applied_version_after_revert="$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='applied_config_version';")"
[ "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_config_version';")" = "$applied_version_after_revert" ]
[ "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_active_profile';")" = "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='active_profile';")" ]
[ "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_service_enabled';")" = "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='service_enabled';")" ]
"$ctl" list-nodes | grep -q 'original.*original.example.com.*443'
if "$ctl" list-nodes | grep -q 'draft-name'; then
	echo "draft node survived revert" >&2
	exit 1
fi

# Apply makes the draft authoritative.
"$ctl" update-node 1 applied-name vless applied.example.com 9443 \
	'{"settings":{"vnext":[{"address":"applied.example.com","port":9443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
next_applied_version="$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_config_version';")"
"$ctl" apply-draft
"$ctl" status | grep -q '^draft_pending=0$'
[ "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='applied_config_version';")" = "$next_applied_version" ]
"$ctl" render-all
grep -q 'applied.example.com' "$TEST_DIR/state/active/v2ray.json"

# The global service switch is a draft value, not an immediate action.
applied_version="$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='applied_config_version';")"
"$ctl" set-setting service_enabled 0
"$ctl" status | grep -q '^service_enabled=0$'
[ "$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_service_enabled';")" = 0 ]
service_version="$("$sqlite" "$V2RAYB_DB" "SELECT value FROM settings WHERE key='draft_config_version';")"
[ "$service_version" -eq $((applied_version + 1)) ]
"$ctl" apply-draft
"$ctl" status | grep -q '^service_enabled=0$'
"$ctl" status | grep -q '^draft_pending=0$'
"$ctl" revert-draft
"$ctl" set-setting service_enabled 1
"$ctl" apply-draft

# A failed runtime apply can restore the committed database while retaining
# the draft for correction or explicit discard.
"$ctl" update-node 1 rollback-draft vless rollback.example.com 9443 \
	'{"settings":{"vnext":[{"address":"rollback.example.com","port":9443,"users":[{"id":"00000000-0000-0000-0000-000000000000","encryption":"none"}]}]}}' >/dev/null
"$ctl" apply-draft
"$ctl" rollback-apply
"$ctl" get-applied-profile | grep -q '^1	original-profile	'
"$ctl" status | grep -q '^draft_pending=1$'
[ -s "$V2RAYB_STATE_DIR/db-before-apply" ]
"$ctl" clear-apply-backup

# A draft without an enabled active node is rejected.
"$ctl" set-setting active_profile ''
if "$ctl" apply-draft >/dev/null 2>&1; then
	echo "draft without active profile unexpectedly applied" >&2
	exit 1
fi
"$ctl" revert-draft

# A stale draft_pending flag without draft rows is not a pending draft.
"$ctl" revert-draft
"$sqlite" "$V2RAYB_DB" "INSERT INTO settings(key,value) VALUES('draft_pending','1') ON CONFLICT(key) DO UPDATE SET value='1';"
"$ctl" status | grep -q '^draft_pending=0$'

echo "draft tests: ok"
