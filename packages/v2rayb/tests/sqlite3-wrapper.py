#!/usr/bin/env python3

import sqlite3
import sys


raw_args = sys.argv[1:]
args = []
timeout = 5.0
i = 0
while i < len(raw_args):
    arg = raw_args[i]
    if arg in {"-batch", "-bail"}:
        i += 1
        continue
    if arg == "-cmd" and i + 1 < len(raw_args):
        command = raw_args[i + 1]
        if command.startswith(".timeout "):
            try:
                timeout = float(command.split(None, 1)[1]) / 1000.0
            except (ValueError, IndexError):
                pass
        i += 2
        continue
    args.append(arg)
    i += 1
if not args:
    raise SystemExit("database path is required")
db_path = args[0]
conn = sqlite3.connect(db_path, timeout=timeout)
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
