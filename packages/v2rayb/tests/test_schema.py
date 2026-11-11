#!/usr/bin/env python3

import json
import pathlib
import sqlite3
import tempfile


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "files" / "etc" / "v2rayB" / "schema.sql"


def main():
    with tempfile.TemporaryDirectory() as tmp:
        db_path = pathlib.Path(tmp) / "v2rayB.db"
        conn = sqlite3.connect(db_path)
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript(SCHEMA.read_text(encoding="utf-8"))

        tables = {
            row[0]
            for row in conn.execute(
                "SELECT name FROM sqlite_master WHERE type = 'table'"
            )
        }
        expected = {
            "settings",
            "sources",
            "nodes",
            "policies",
            "profiles",
            "profile_nodes",
            "rulesets",
            "schema_migrations",
        }
        assert expected <= tables
        assert conn.execute("PRAGMA user_version").fetchone()[0] == 4
        assert {
            "draft_nodes", "draft_policies", "draft_profiles",
            "draft_profile_nodes",
        } <= tables
        profile_columns = {
            row[1]
            for row in conn.execute("PRAGMA table_info(profiles)")
        }
        assert "engine_options_json" in profile_columns
        policy_columns = {
            row[1]
            for row in conn.execute("PRAGMA table_info(policies)")
        }
        assert {
            "direct_dns", "transparent_proxy_ports", "bypass_china",
            "use_v2ray_dns", "mosdns_enabled", "mosdns_domains",
            "mosdns_match_rules",
        } <= policy_columns

        conn.execute(
            "INSERT INTO sources(type, name) VALUES ('manual', 'local')"
        )
        source_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        node_data = {"tls": {"enabled": True}, "transport": "tcp"}
        conn.execute(
            """
            INSERT INTO nodes(source_id, name, protocol, server, port, data_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (source_id, "manual-node", "vless", "example.invalid", 443,
             json.dumps(node_data)),
        )
        node_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.execute(
            """
            INSERT INTO profiles(name, engine, engine_options_json)
            VALUES ('manual-profile', 'v2ray', ?)
            """,
            (json.dumps({"inbounds": []}),),
        )
        profile_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        conn.execute(
            "INSERT INTO profile_nodes(profile_id, node_id) VALUES (?, ?)",
            (profile_id, node_id),
        )
        conn.commit()

        assert conn.execute(
            "SELECT value FROM settings WHERE key = 'active_engine'"
        ).fetchone()[0] == "v2ray"
        assert conn.execute(
            "SELECT value FROM settings WHERE key = 'force_proxy_port'"
        ).fetchone()[0] == "12346"
        assert conn.execute(
            "SELECT value FROM settings WHERE key = 'service_enabled'"
        ).fetchone()[0] == "0"
        assert conn.execute(
            "SELECT value FROM settings WHERE key = 'draft_service_enabled'"
        ).fetchone()[0] == "0"
        assert conn.execute(
            """
            SELECT COUNT(*) FROM settings
            WHERE key IN ('direct_dns', 'transparent_proxy_ports',
                          'draft_direct_dns', 'draft_transparent_proxy_ports')
            """
        ).fetchone()[0] == 0
        assert conn.execute(
            "SELECT data_json FROM nodes WHERE id = ?", (node_id,)
        ).fetchone()[0] == json.dumps(node_data)
        assert conn.execute(
            "SELECT COUNT(*) FROM profile_nodes WHERE profile_id = ?",
            (profile_id,),
        ).fetchone()[0] == 1

        conn.close()
    print("schema tests: ok")


if __name__ == "__main__":
    main()
