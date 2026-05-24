import { getDb } from './index'
import type {
  AddWishlistInput,
  WishlistApi,
  WishlistItem
} from '../../shared/wishlist'
import type { BinderCardSnapshot } from '../../shared/binders'

interface WishlistRow {
  id: number
  card_id: number
  card_data: string
  note: string | null
  added_at: number
}

function mapRow(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    card: JSON.parse(row.card_data) as BinderCardSnapshot,
    note: row.note,
    addedAt: row.added_at
  }
}

export const wishlistApi: WishlistApi = {
  async list(): Promise<WishlistItem[]> {
    const db = getDb()
    const rows = db
      .prepare(`SELECT * FROM wishlist ORDER BY added_at DESC`)
      .all() as WishlistRow[]
    return rows.map(mapRow)
  },

  async add(input: AddWishlistInput): Promise<WishlistItem> {
    const db = getDb()
    const ts = Date.now()
    // ON CONFLICT(card_id): if already there, refresh the note + added_at so
    // re-adding feels like "bumping" the entry rather than a silent no-op.
    const info = db
      .prepare(
        `INSERT INTO wishlist (card_id, card_data, note, added_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(card_id) DO UPDATE SET
           card_data = excluded.card_data,
           note = excluded.note,
           added_at = excluded.added_at`
      )
      .run(input.card.id, JSON.stringify(input.card), input.note ?? null, ts)

    // ON CONFLICT updates don't update lastInsertRowid — re-read by card_id.
    const id =
      info.changes > 0 && info.lastInsertRowid
        ? Number(info.lastInsertRowid)
        : (db.prepare(`SELECT id FROM wishlist WHERE card_id = ?`).get(input.card.id) as {
            id: number
          }).id

    const row = db.prepare(`SELECT * FROM wishlist WHERE id = ?`).get(id) as WishlistRow
    return mapRow(row)
  },

  async remove(id: number): Promise<void> {
    const db = getDb()
    db.prepare(`DELETE FROM wishlist WHERE id = ?`).run(id)
  },

  async updateNote(id: number, note: string | null): Promise<void> {
    const db = getDb()
    db.prepare(`UPDATE wishlist SET note = ? WHERE id = ?`).run(note, id)
  },

  async has(cardId: number): Promise<boolean> {
    const db = getDb()
    const row = db.prepare(`SELECT 1 FROM wishlist WHERE card_id = ?`).get(cardId)
    return row !== undefined
  }
}
