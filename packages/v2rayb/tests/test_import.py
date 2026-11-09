#!/usr/bin/env python3

import pathlib
import sqlite3
import subprocess
import sys
import tempfile


ROOT = pathlib.Path(__file__).resolve().parents[1]
IMPORTER = ROOT / "tools" / "import_legacy.py"
FIXTURES = ROOT / "tests" / "fixtures"


def main():
    with tempfile.TemporaryDirectory() as tmp:
        db = pathlib.Path(tmp) / "v2rayB.db"
        configs = [
            ("hk2", FIXTURES / "legacy-vless.json"),
            ("home", FIXTURES / "legacy-vmess.json"),
        ]
        for name, path in configs:
            subprocess.run(
                [sys.executable, str(IMPORTER), "--db", str(db), "--name", name, str(path)],
                check=True,
                stdout=subprocess.DEVNULL,
            )

        # Re-import one profile to verify that updates do not duplicate nodes.
        name, path = configs[0]
        subprocess.run(
            [sys.executable, str(IMPORTER), "--db", str(db), "--name", name, str(path)],
            check=True,
            stdout=subprocess.DEVNULL,
        )

        conn = sqlite3.connect(db)
        assert conn.execute("SELECT COUNT(*) FROM sources").fetchone()[0] == 2
        assert conn.execute("SELECT COUNT(*) FROM nodes").fetchone()[0] == 2
        assert conn.execute("SELECT COUNT(*) FROM profiles").fetchone()[0] == 2
        assert conn.execute("SELECT COUNT(*) FROM profile_nodes").fetchone()[0] == 2
        assert conn.execute(
            "SELECT COUNT(*) FROM sqlite_master WHERE name = 'raw_profiles'"
        ).fetchone()[0] == 0
        conn.close()
    print("legacy import tests: ok")


if __name__ == "__main__":
    main()
