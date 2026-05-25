import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { SCHEMA } from './schema'

let db: Database.Database | null = null

/** Lazily open (and initialize) the SQLite database in the user's app-data folder. */
export function getDb(): Database.Database {
  if (db) return db

  const dbPath = join(app.getPath('userData'), 'pokemon-holo-binder.db')
  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  runMigrations(db)
  return db
}

/**
 * Apply incremental, idempotent migrations that the base SCHEMA can't express
 * (ALTER TABLE ADD COLUMN has no IF NOT EXISTS variant).
 *
 * Each step inspects current state via PRAGMA, so re-running is a no-op.
 */
function runMigrations(d: Database.Database): void {
  // 001 — binder_slots.trade_status
  const slotCols = d.prepare(`PRAGMA table_info(binder_slots)`).all() as { name: string }[]
  if (!slotCols.some((c) => c.name === 'trade_status')) {
    d.exec(`ALTER TABLE binder_slots ADD COLUMN trade_status TEXT NOT NULL DEFAULT 'keep'`)
  }
}

export function closeDb(): void {
  if (db) {
    db.close()
    db = null
  }
}
