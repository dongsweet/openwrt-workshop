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
CREATE TABLE nodes (
  id INTEGER PRIMARY KEY,
  source_id INTEGER,
  name TEXT NOT NULL,
  protocol TEXT NOT NULL,
  server TEXT NOT NULL,
  port INTEGER NOT NULL,
  data_json TEXT NOT NULL DEFAULT "{}",
  enabled INTEGER NOT NULL DEFAULT 1,
  last_latency_ms INTEGER,
  last_checked_at TEXT,
  last_error TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE profiles (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  engine TEXT NOT NULL,
  policy_id INTEGER,
  engine_options_json TEXT NOT NULL DEFAULT "{}",
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE profile_nodes (
  profile_id INTEGER NOT NULL,
  node_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT "primary",
  priority INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(profile_id, node_id)
);
INSERT INTO schema_migrations(version) VALUES (1);
PRAGMA user_version=1;
'

"$ROOT/files/usr/libexec/v2rayB/v2rayBctl" init-db

version=$("$sqlite" "$V2RAYB_DB" 'PRAGMA user_version;')
[ "$version" = 5 ]
columns=$("$sqlite" "$V2RAYB_DB" 'PRAGMA table_info(policies);')
printf '%s\n' "$columns" | grep -q 'direct_dns'
printf '%s\n' "$columns" | grep -q 'transparent_proxy_ports'
printf '%s\n' "$columns" | grep -q 'bypass_china'
printf '%s\n' "$columns" | grep -q 'use_v2ray_dns'
printf '%s\n' "$columns" | grep -q 'mosdns_enabled'
printf '%s\n' "$columns" | grep -q 'mosdns_domains'
printf '%s\n' "$columns" | grep -q 'mosdns_match_rules'
printf '%s\n' "$columns" | grep -q 'proxy_router_traffic'
"$sqlite" "$V2RAYB_DB" 'SELECT version FROM schema_migrations ORDER BY version;' | grep -q '^5$'

# Old databases append new policy columns at the end, unlike freshly created
# tables. Draft copies and apply-back must address columns explicitly.
"$sqlite" "$V2RAYB_DB" '
INSERT INTO policies(name,direct_dns,transparent_proxy_ports,bypass_china,use_v2ray_dns,mosdns_enabled,mosdns_domains,mosdns_match_rules)
VALUES("profile-1","223.5.5.5:53","80,443",1,1,1,"example.com","domain:example.com");
INSERT INTO nodes(id,name,protocol,server,port,data_json) VALUES(1,"node-1","vless","example.com",443,"{}");
INSERT INTO profiles(id,name,engine,policy_id) VALUES(1,"profile one","v2ray",1);
INSERT INTO profile_nodes(profile_id,node_id) VALUES(1,1);
'
"$ROOT/files/usr/libexec/v2rayB/v2rayBctl" set-node-enabled 1 1
"$sqlite" "$V2RAYB_DB" 'SELECT bypass_china || "|" || use_v2ray_dns || "|" || mosdns_enabled FROM draft_policies WHERE id=1;' | grep -q '^1|1|1$'
"$ROOT/files/usr/libexec/v2rayB/v2rayBctl" set-setting active_profile 1
"$ROOT/files/usr/libexec/v2rayB/v2rayBctl" apply-draft
"$sqlite" "$V2RAYB_DB" 'SELECT bypass_china || "|" || use_v2ray_dns || "|" || mosdns_enabled FROM policies WHERE id=1;' | grep -q '^1|1|1$'

# Legacy global DNS/port defaults are removed from the database.
"$sqlite" "$V2RAYB_DB" '
INSERT INTO settings(key,value) VALUES("direct_dns","1.1.1.1:53")
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
INSERT INTO settings(key,value) VALUES("transparent_proxy_ports","443")
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
'
"$ROOT/files/usr/libexec/v2rayB/v2rayBctl" init-db
count=$("$sqlite" "$V2RAYB_DB" '
SELECT COUNT(*) FROM settings
WHERE key IN ("direct_dns","transparent_proxy_ports",
              "draft_direct_dns","draft_transparent_proxy_ports");
')
[ "$count" = 0 ]
[ "$("$sqlite" "$V2RAYB_DB" 'SELECT value FROM settings WHERE key="dns_fallback";')" = 1 ]
echo "migration tests: ok"
