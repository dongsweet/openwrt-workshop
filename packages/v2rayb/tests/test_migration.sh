#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
TEST_DIR=${TMPDIR:-/tmp}/v2rayB-migration-test-$$
mkdir -p "$TEST_DIR"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM

export V2RAYB_DB="$TEST_DIR/db"
export V2RAYB_SCHEMA="$ROOT/files/etc/v2rayB/schema.sql"
export V2RAYB_STATE_DIR="$TEST_DIR/state"
export V2RAYB_RULE_DIR="$TEST_DIR/rules"
export V2RAYB_SQLITE3="$ROOT/tests/sqlite3-wrapper.py"

sqlite="$ROOT/tests/sqlite3-wrapper.py"
"$sqlite" "$V2RAYB_DB" '
CREATE TABLE policies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  dns_policy_json TEXT NOT NULL DEFAULT "{}",
  routing_policy_json TEXT NOT NULL DEFAULT "{}",
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO schema_migrations(version) VALUES (1);
PRAGMA user_version=1;
'

"$ROOT/files/usr/libexec/v2rayB/v2rayBctl" init-db

version=$("$sqlite" "$V2RAYB_DB" 'PRAGMA user_version;')
[ "$version" = 4 ]
columns=$("$sqlite" "$V2RAYB_DB" 'PRAGMA table_info(policies);')
printf '%s\n' "$columns" | grep -q 'direct_dns'
printf '%s\n' "$columns" | grep -q 'transparent_proxy_ports'
printf '%s\n' "$columns" | grep -q 'bypass_china'
printf '%s\n' "$columns" | grep -q 'use_v2ray_dns'
printf '%s\n' "$columns" | grep -q 'mosdns_enabled'
printf '%s\n' "$columns" | grep -q 'mosdns_domains'
printf '%s\n' "$columns" | grep -q 'mosdns_match_rules'
"$sqlite" "$V2RAYB_DB" 'SELECT version FROM schema_migrations ORDER BY version;' | grep -q '^4$'
echo "migration tests: ok"
