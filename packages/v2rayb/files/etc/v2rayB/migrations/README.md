# Database Migrations

The initial schema is `../schema.sql` and sets SQLite `user_version` to `1`.

Future migrations must:

1. Be numbered sequentially.
2. Run inside a transaction.
3. Update `PRAGMA user_version`.
4. Insert their version into `schema_migrations`.
5. Preserve the previous schema when possible.

The backend must refuse to run against a database with a newer schema version.
