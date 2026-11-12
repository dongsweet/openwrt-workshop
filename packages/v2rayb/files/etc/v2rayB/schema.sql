PRAGMA foreign_keys = ON;

BEGIN;

CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sources (
    id           INTEGER PRIMARY KEY,
    type         TEXT NOT NULL CHECK (type IN ('manual', 'subscription', 'imported')),
    name         TEXT NOT NULL,
    url          TEXT,
    format       TEXT,
    enabled      INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    etag         TEXT,
    last_error   TEXT,
    last_updated TEXT,
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (type, name)
);

CREATE TABLE IF NOT EXISTS nodes (
    id              INTEGER PRIMARY KEY,
    source_id       INTEGER REFERENCES sources(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    protocol        TEXT NOT NULL,
    server          TEXT NOT NULL,
    port            INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    data_json       TEXT NOT NULL DEFAULT '{}',
    enabled         INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    last_latency_ms INTEGER,
    last_checked_at TEXT,
    last_error      TEXT,
    created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_id, name)
);

CREATE TABLE IF NOT EXISTS policies (
    id                      INTEGER PRIMARY KEY,
    name                    TEXT NOT NULL UNIQUE,
    dns_policy_json         TEXT NOT NULL DEFAULT '{}',
    routing_policy_json     TEXT NOT NULL DEFAULT '{}',
    direct_dns              TEXT,
    transparent_proxy_ports TEXT,
    bypass_china            INTEGER NOT NULL DEFAULT 1 CHECK (bypass_china IN (0, 1)),
    use_v2ray_dns           INTEGER NOT NULL DEFAULT 1 CHECK (use_v2ray_dns IN (0, 1)),
    mosdns_enabled          INTEGER NOT NULL DEFAULT 1 CHECK (mosdns_enabled IN (0, 1)),
    mosdns_domains          TEXT,
    mosdns_match_rules      TEXT,
    proxy_router_traffic     INTEGER NOT NULL DEFAULT 0 CHECK (proxy_router_traffic IN (0, 1)),
    created_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id                  INTEGER PRIMARY KEY,
    name                TEXT NOT NULL UNIQUE,
    engine              TEXT NOT NULL,
    policy_id           INTEGER REFERENCES policies(id) ON DELETE SET NULL,
    engine_options_json TEXT NOT NULL DEFAULT '{}',
    enabled             INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_nodes (
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    node_id    INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    role       TEXT NOT NULL DEFAULT 'primary',
    priority   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (profile_id, node_id)
);

CREATE TABLE IF NOT EXISTS rulesets (
    id           INTEGER PRIMARY KEY,
    name         TEXT NOT NULL UNIQUE,
    type         TEXT NOT NULL,
    path         TEXT NOT NULL,
    checksum     TEXT,
    enabled      INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    last_updated TEXT,
    created_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS draft_nodes (
    id              INTEGER PRIMARY KEY,
    source_id       INTEGER,
    name            TEXT NOT NULL,
    protocol        TEXT NOT NULL,
    server          TEXT NOT NULL,
    port            INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    data_json       TEXT NOT NULL DEFAULT '{}',
    enabled         INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    last_latency_ms INTEGER,
    last_checked_at TEXT,
    last_error      TEXT,
    created_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source_id, name)
);

CREATE TABLE IF NOT EXISTS draft_policies (
    id                      INTEGER PRIMARY KEY,
    name                    TEXT NOT NULL UNIQUE,
    dns_policy_json         TEXT NOT NULL DEFAULT '{}',
    routing_policy_json     TEXT NOT NULL DEFAULT '{}',
    direct_dns              TEXT,
    transparent_proxy_ports TEXT,
    bypass_china            INTEGER NOT NULL DEFAULT 1 CHECK (bypass_china IN (0, 1)),
    use_v2ray_dns           INTEGER NOT NULL DEFAULT 1 CHECK (use_v2ray_dns IN (0, 1)),
    mosdns_enabled          INTEGER NOT NULL DEFAULT 1 CHECK (mosdns_enabled IN (0, 1)),
    mosdns_domains          TEXT,
    mosdns_match_rules      TEXT,
    proxy_router_traffic     INTEGER NOT NULL DEFAULT 0 CHECK (proxy_router_traffic IN (0, 1)),
    created_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS draft_profiles (
    id                  INTEGER PRIMARY KEY,
    name                TEXT NOT NULL UNIQUE,
    engine              TEXT NOT NULL,
    policy_id           INTEGER,
    engine_options_json TEXT NOT NULL DEFAULT '{}',
    enabled             INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
    created_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS draft_profile_nodes (
    profile_id INTEGER NOT NULL,
    node_id    INTEGER NOT NULL,
    role       TEXT NOT NULL DEFAULT 'primary',
    priority   INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (profile_id, node_id)
);

CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sources_enabled ON sources(enabled);
CREATE INDEX IF NOT EXISTS idx_nodes_source_enabled ON nodes(source_id, enabled);
CREATE INDEX IF NOT EXISTS idx_profile_nodes_priority ON profile_nodes(profile_id, priority);

INSERT OR IGNORE INTO settings(key, value) VALUES
    ('active_engine', 'v2ray'),
    ('active_profile', ''),
    ('service_enabled', '0'),
    ('draft_service_enabled', '0'),
    ('applied_config_version', '1'),
    ('draft_config_version', '1'),
    ('draft_pending', '0'),
    ('draft_active_profile', ''),
    ('proxy_mode', 'normal'),
    ('watchdog_enabled', '1'),
    ('fallback_on_failure', '1'),
    ('mosdns_listen', '127.0.0.1#5354'),
    ('v2ray_dns_listen', '127.0.0.1#5353'),
    ('transparent_proxy_port', '12345'),
    ('force_proxy_port', '12346');

INSERT OR IGNORE INTO schema_migrations(version) VALUES (1);
INSERT OR IGNORE INTO schema_migrations(version) VALUES (2);
INSERT OR IGNORE INTO schema_migrations(version) VALUES (3);
INSERT OR IGNORE INTO schema_migrations(version) VALUES (4);
INSERT OR IGNORE INTO schema_migrations(version) VALUES (5);
PRAGMA user_version = 5;

COMMIT;
