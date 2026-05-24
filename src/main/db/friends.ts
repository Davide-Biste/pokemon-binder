import { getDb } from './index'
import type { FriendSnapshot, FriendSummary } from '../../shared/friends'
import type { ExportPayload } from '../../shared/export'

interface FriendRow {
  id: number
  owner_name: string
  source_path: string | null
  exported_at: number
  imported_at: number
  payload: string
}

function summarisePayload(payload: ExportPayload): {
  binderCount: number
  cardCount: number
  tradablesCount: number
  wishlistCount: number
} {
  let cardCount = 0
  let tradablesCount = 0
  for (const binder of payload.binders) {
    for (const page of binder.pages) {
      cardCount += page.slots.length
      for (const slot of page.slots) {
        if (slot.tradeStatus === 'for_trade' || slot.tradeStatus === 'dupe') {
          tradablesCount += 1
        }
      }
    }
  }
  return {
    binderCount: payload.binders.length,
    cardCount,
    tradablesCount,
    wishlistCount: payload.wishlist.length
  }
}

function rowToSummary(row: FriendRow): FriendSummary {
  const payload = JSON.parse(row.payload) as ExportPayload
  const counts = summarisePayload(payload)
  return {
    id: row.id,
    ownerName: row.owner_name,
    exportedAt: row.exported_at,
    importedAt: row.imported_at,
    ...counts
  }
}

function rowToSnapshot(row: FriendRow): FriendSnapshot {
  return {
    id: row.id,
    ownerName: row.owner_name,
    sourcePath: row.source_path,
    exportedAt: row.exported_at,
    importedAt: row.imported_at,
    payload: JSON.parse(row.payload) as ExportPayload
  }
}

/**
 * Lower-level DB operations on friend snapshots. File I/O (dialog + JSON read)
 * is handled in `main/io/exportImport.ts`, which then calls `insert()` here.
 */
export const friendsRepo = {
  list(): FriendSummary[] {
    const db = getDb()
    const rows = db
      .prepare(`SELECT * FROM friend_snapshots ORDER BY imported_at DESC`)
      .all() as FriendRow[]
    return rows.map(rowToSummary)
  },

  /**
   * Hydrated list of every friend snapshot. Used by the Dashboard's trade
   * radar — running N round-trips would be wasteful when the matcher
   * needs all payloads anyway.
   */
  listFull(): FriendSnapshot[] {
    const db = getDb()
    const rows = db
      .prepare(`SELECT * FROM friend_snapshots ORDER BY imported_at DESC`)
      .all() as FriendRow[]
    return rows.map(rowToSnapshot)
  },

  get(id: number): FriendSnapshot | null {
    const db = getDb()
    const row = db.prepare(`SELECT * FROM friend_snapshots WHERE id = ?`).get(id) as
      | FriendRow
      | undefined
    return row ? rowToSnapshot(row) : null
  },

  insert(payload: ExportPayload, sourcePath: string | null): FriendSnapshot {
    const db = getDb()
    const importedAt = Date.now()
    const info = db
      .prepare(
        `INSERT INTO friend_snapshots (owner_name, source_path, exported_at, imported_at, payload)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        payload.owner.name,
        sourcePath,
        payload.exportedAt,
        importedAt,
        JSON.stringify(payload)
      )
    const id = Number(info.lastInsertRowid)
    return {
      id,
      ownerName: payload.owner.name,
      sourcePath,
      exportedAt: payload.exportedAt,
      importedAt,
      payload
    }
  },

  remove(id: number): void {
    const db = getDb()
    db.prepare(`DELETE FROM friend_snapshots WHERE id = ?`).run(id)
  }
}
