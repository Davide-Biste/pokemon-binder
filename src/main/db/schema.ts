/**
 * SQL schema for the local binders database.
 * Schema changes should be additive (CREATE IF NOT EXISTS / ALTER) so existing
 * users don't lose data when we add new fields.
 *
 * Non-trivial migrations (e.g. ALTER TABLE ADD COLUMN) live in db/index.ts
 * inside `runMigrations()` because they need conditional logic.
 */
export const SCHEMA = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS binders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  rows INTEGER NOT NULL DEFAULT 3,
  cols INTEGER NOT NULL DEFAULT 3,
  cover_card_data TEXT,           -- JSON snapshot of the card used as cover thumbnail
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS binder_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  binder_id INTEGER NOT NULL REFERENCES binders(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  UNIQUE(binder_id, page_index)
);

CREATE TABLE IF NOT EXISTS binder_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES binder_pages(id) ON DELETE CASCADE,
  slot_index INTEGER NOT NULL,    -- 0-based within the page (row-major)
  card_id INTEGER NOT NULL,
  card_data TEXT NOT NULL,        -- JSON snapshot of the TcgCard (so binder renders offline)
  added_at INTEGER NOT NULL,
  -- trade_status is added by a migration on first run (see runMigrations).
  -- Values: 'keep' | 'for_trade' | 'dupe'.
  UNIQUE(page_id, slot_index)
);

CREATE INDEX IF NOT EXISTS idx_binder_pages_binder ON binder_pages(binder_id, page_index);
CREATE INDEX IF NOT EXISTS idx_binder_slots_page ON binder_slots(page_id, slot_index);

-- Wishlist: cards the user wants to acquire. Flat list, one entry per card_id.
CREATE TABLE IF NOT EXISTS wishlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_id INTEGER NOT NULL UNIQUE,
  card_data TEXT NOT NULL,        -- JSON snapshot of the TcgCard
  note TEXT,
  added_at INTEGER NOT NULL
);

-- Imported snapshots of friends' profiles. The full export payload is stored as
-- a JSON blob; we keep a few denormalised columns for cheap listing/filtering.
CREATE TABLE IF NOT EXISTS friend_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name TEXT NOT NULL,
  source_path TEXT,               -- original file path on disk (informational)
  exported_at INTEGER NOT NULL,   -- timestamp embedded in the file
  imported_at INTEGER NOT NULL,
  payload TEXT NOT NULL           -- the full ExportPayload JSON
);

CREATE INDEX IF NOT EXISTS idx_friend_snapshots_owner ON friend_snapshots(owner_name);

-- Single-row key/value store for app-wide preferences (owner name, etc.).
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`
