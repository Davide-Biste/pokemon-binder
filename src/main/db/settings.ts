/**
 * Tiny key/value store backed by the `settings` table.
 * Used for owner name and any other singleton preference; not exposed over
 * IPC directly — callers use the dedicated handlers in main/ipc/profile.ts.
 */
import { getDb } from './index'

export function getSetting(key: string): string | null {
  const db = getDb()
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as
    | { value: string }
    | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  const db = getDb()
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).run(key, value)
}

/** Owner display name used in exported `.pkbinder.json` files. */
export const OWNER_NAME_KEY = 'owner_name'

/** UI locale (e.g. 'en', 'it'). Resolved by the i18n bootstrap in the renderer. */
export const LOCALE_KEY = 'locale'
