#!/usr/bin/env python3

import sqlite3
import sys


args = [arg for arg in sys.argv[1:] if arg not in {"-batch", "-bail"}]
if not args:
    raise SystemExit("database path is required")
db_path = args[0]
conn = sqlite3.connect(db_path)
conn.execute("PRAGMA foreign_keys=ON")

if len(args) == 1:
    conn.executescript(sys.stdin.read())
else:
    statements = [part.strip() for part in args[1].split(";") if part.strip()]
    for statement in statements:
        cursor = conn.execute(statement)
        if statement.lstrip().upper().startswith(("SELECT", "PRAGMA")):
            for row in cursor:
                sys.stdout.write("\t".join("" if value is None else str(value) for value in row) + "\n")
    conn.commit()

conn.close()
