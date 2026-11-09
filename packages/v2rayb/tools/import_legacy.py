#!/usr/bin/env python3

"""Import legacy complete V2Ray JSON files into the normalized database.

The importer intentionally does not create a raw-profile record. It extracts
one proxy outbound into a node, routing into a policy, and engine-level fields
into profile options. The original file remains available to the caller as a
backup, but it is not selected by the new runtime.
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sqlite3
import sys
from typing import Any


ROOT = pathlib.Path(__file__).resolve().parents[1]
SCHEMA = ROOT / "files" / "etc" / "v2rayB" / "schema.sql"


def json_text(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def choose_outbound(config: dict[str, Any]) -> dict[str, Any]:
    supported = {"vless", "vmess", "trojan", "shadowsocks"}
    candidates = [
        item
        for item in config.get("outbounds", [])
        if isinstance(item, dict) and item.get("protocol") in supported
    ]
    if len(candidates) != 1:
        raise ValueError(
            f"expected exactly one supported proxy outbound, found {len(candidates)}"
        )
    return candidates[0]


def source_id(conn: sqlite3.Connection, name: str) -> int:
    conn.execute(
        """
        INSERT INTO sources(type, name, format, updated_at)
        VALUES ('imported', ?, 'legacy-v2ray-json', CURRENT_TIMESTAMP)
        ON CONFLICT(type, name) DO UPDATE SET
          format = excluded.format,
          updated_at = CURRENT_TIMESTAMP
        """,
        (name,),
    )
    return conn.execute(
        "SELECT id FROM sources WHERE type = 'imported' AND name = ?", (name,)
    ).fetchone()[0]


def import_one(conn: sqlite3.Connection, path: pathlib.Path, name: str) -> None:
    config = json.loads(path.read_text(encoding="utf-8"))
    outbound = choose_outbound(config)
    protocol = outbound["protocol"]
    settings = outbound.get("settings") or {}
    stream = outbound.get("streamSettings") or {}
    server = ""
    port = None

    vnext = settings.get("vnext") or []
    if vnext:
        server = str(vnext[0].get("address", ""))
        port = vnext[0].get("port")
    if not server or port is None:
        servers = settings.get("servers") or []
        if servers:
            server = str(servers[0].get("address", ""))
            port = servers[0].get("port")

    if not server or not isinstance(port, int) or not 1 <= port <= 65535:
        raise ValueError(f"cannot locate a valid server and port in {path.name}")

    source_name = f"legacy-{name}"
    sid = source_id(conn, source_name)
    node_name = f"{name}-node"
    node_data = {
        "settings": settings,
        "streamSettings": stream,
        "mux": outbound.get("mux"),
        "tag": outbound.get("tag"),
    }
    conn.execute(
        """
        INSERT INTO nodes(source_id, name, protocol, server, port, data_json,
                          updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(source_id, name) DO UPDATE SET
          protocol = excluded.protocol,
          server = excluded.server,
          port = excluded.port,
          data_json = excluded.data_json,
          updated_at = CURRENT_TIMESTAMP
        """,
        (sid, node_name, protocol, server, port, json_text(node_data)),
    )
    node_row = conn.execute(
        """
        SELECT id FROM nodes
        WHERE source_id = ? AND name = ?
        ORDER BY id DESC LIMIT 1
        """,
        (sid, node_name),
    ).fetchone()
    if node_row is None:
        raise RuntimeError("node upsert did not return a row")
    node_id = node_row[0]

    policy_name = f"{name}-routing"
    conn.execute(
        """
        INSERT INTO policies(name, dns_policy_json, routing_policy_json,
                             updated_at)
        VALUES (?, '{}', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(name) DO UPDATE SET
          routing_policy_json = excluded.routing_policy_json,
          updated_at = CURRENT_TIMESTAMP
        """,
        (policy_name, json_text(config.get("routing") or {})),
    )
    policy_id = conn.execute(
        "SELECT id FROM policies WHERE name = ?", (policy_name,)
    ).fetchone()[0]

    options = {
        "inbounds": config.get("inbounds") or [],
        "log": config.get("log") or {},
    }
    conn.execute(
        """
        INSERT INTO profiles(name, engine, policy_id, engine_options_json,
                             updated_at)
        VALUES (?, 'v2ray', ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(name) DO UPDATE SET
          engine = excluded.engine,
          policy_id = excluded.policy_id,
          engine_options_json = excluded.engine_options_json,
          updated_at = CURRENT_TIMESTAMP
        """,
        (name, policy_id, json_text(options)),
    )
    profile_id = conn.execute(
        "SELECT id FROM profiles WHERE name = ?", (name,)
    ).fetchone()[0]
    conn.execute("DELETE FROM profile_nodes WHERE profile_id = ?", (profile_id,))
    conn.execute(
        "INSERT INTO profile_nodes(profile_id, node_id) VALUES (?, ?)",
        (profile_id, node_id),
    )

    print(f"imported {path.name}: profile={name} protocol={protocol} server={server}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=pathlib.Path, required=True)
    parser.add_argument("--schema", type=pathlib.Path, default=SCHEMA)
    parser.add_argument("--name", required=True)
    parser.add_argument("config", type=pathlib.Path)
    args = parser.parse_args()

    if not args.config.is_file():
        parser.error(f"config not found: {args.config}")
    args.db.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(args.db)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(args.schema.read_text(encoding="utf-8"))
    try:
        with conn:
            import_one(conn, args.config, args.name)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"import failed: {exc}", file=sys.stderr)
        return 1
    finally:
        conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
