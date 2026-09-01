# db/init/ — MySQL Initialization Scripts

This directory contains database initialization scripts executed automatically in alphabetical order by the MySQL 8.0 container on first startup (when `/var/lib/mysql` volume is empty).

## File Manifest

| File | Type | Description |
| :--- | :--- | :--- |
| `01-schema.sql` | DDL | Creates all 15 tables with `InnoDB`, `utf8mb4`, `utf8mb4_unicode_ci`, PKs, FKs, Unique Keys, Indexes, and Constraints. |
| `02-seed.sql` | DML | Seeds initial Master Data: Roles (3), Permissions (36), Role-Permission mappings (78), Default Users (Admin, Librarian, Member), Categories (10), Settings (9), and Sample Books (5 books, 14 copies). |

## Reset Database Instructions

To re-run initialization from scratch:
```bash
docker compose down -v
docker compose up -d
```
