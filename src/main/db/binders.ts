import { getDb } from './index'
import type {
  Binder,
  BinderApi,
  BinderCardSnapshot,
  BinderPage,
  BinderSlot,
  BinderSummary,
  CreateBinderInput,
  MoveCardInput,
  PlaceCardInput,
  TradeStatus,
  UpdateBinderInput
} from '../../shared/binders'

const now = (): number => Date.now()

interface BinderRow {
  id: number
  name: string
  description: string | null
  rows: number
  cols: number
  cover_card_data: string | null
  created_at: number
  updated_at: number
}

interface PageRow {
  id: number
  binder_id: number
  page_index: number
}

interface SlotRow {
  id: number
  page_id: number
  slot_index: number
  card_id: number
  card_data: string
  added_at: number
  trade_status: TradeStatus
}

const TRADE_STATUSES: ReadonlySet<TradeStatus> = new Set(['keep', 'for_trade', 'dupe'])

function normalizeTradeStatus(value: unknown): TradeStatus {
  return typeof value === 'string' && TRADE_STATUSES.has(value as TradeStatus)
    ? (value as TradeStatus)
    : 'keep'
}

function parseSnapshot(json: string | null): BinderCardSnapshot | null {
  if (!json) return null
  try {
    return JSON.parse(json) as BinderCardSnapshot
  } catch {
    return null
  }
}

function mapSlot(row: SlotRow): BinderSlot {
  return {
    id: row.id,
    slotIndex: row.slot_index,
    cardId: row.card_id,
    card: JSON.parse(row.card_data) as BinderCardSnapshot,
    tradeStatus: normalizeTradeStatus(row.trade_status),
    addedAt: row.added_at
  }
}

function mapPage(row: PageRow, slots: BinderSlot[]): BinderPage {
  return { id: row.id, pageIndex: row.page_index, slots }
}

function mapBinder(row: BinderRow, pages: BinderPage[]): Binder {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    rows: row.rows,
    cols: row.cols,
    coverCard: parseSnapshot(row.cover_card_data),
    pages,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export const bindersApi: BinderApi = {
  async list(): Promise<BinderSummary[]> {
    const db = getDb()
    const rows = db
      .prepare(
        `SELECT b.*,
                (SELECT COUNT(*) FROM binder_pages WHERE binder_id = b.id) AS page_count,
                (SELECT COUNT(*) FROM binder_slots s
                   JOIN binder_pages p ON p.id = s.page_id
                   WHERE p.binder_id = b.id) AS card_count
         FROM binders b
         ORDER BY b.updated_at DESC`
      )
      .all() as (BinderRow & { page_count: number; card_count: number })[]

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      rows: r.rows,
      cols: r.cols,
      coverCard: parseSnapshot(r.cover_card_data),
      pageCount: r.page_count,
      cardCount: r.card_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }))
  },

  async get(id: number): Promise<Binder | null> {
    const db = getDb()
    const binderRow = db.prepare(`SELECT * FROM binders WHERE id = ?`).get(id) as BinderRow | undefined
    if (!binderRow) return null

    const pageRows = db
      .prepare(`SELECT * FROM binder_pages WHERE binder_id = ? ORDER BY page_index`)
      .all(id) as PageRow[]

    const slotsByPage = new Map<number, BinderSlot[]>()
    if (pageRows.length > 0) {
      const placeholders = pageRows.map(() => '?').join(',')
      const slotRows = db
        .prepare(
          `SELECT * FROM binder_slots WHERE page_id IN (${placeholders}) ORDER BY slot_index`
        )
        .all(...pageRows.map((p) => p.id)) as SlotRow[]
      for (const s of slotRows) {
        const list = slotsByPage.get(s.page_id) ?? []
        list.push(mapSlot(s))
        slotsByPage.set(s.page_id, list)
      }
    }

    const pages = pageRows.map((p) => mapPage(p, slotsByPage.get(p.id) ?? []))
    return mapBinder(binderRow, pages)
  },

  async create(input: CreateBinderInput): Promise<Binder> {
    const db = getDb()
    const ts = now()
    const rows = input.rows ?? 3
    const cols = input.cols ?? 3
    const initialPages = Math.max(1, input.initialPages ?? 1)

    const tx = db.transaction(() => {
      const info = db
        .prepare(
          `INSERT INTO binders (name, description, rows, cols, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
        .run(input.name, input.description ?? null, rows, cols, ts, ts)
      const binderId = Number(info.lastInsertRowid)

      const insertPage = db.prepare(
        `INSERT INTO binder_pages (binder_id, page_index) VALUES (?, ?)`
      )
      for (let i = 0; i < initialPages; i++) insertPage.run(binderId, i)

      return binderId
    })

    const binderId = tx()
    const binder = await this.get(binderId)
    if (!binder) throw new Error('Failed to create binder')
    return binder
  },

  async update(input: UpdateBinderInput): Promise<Binder> {
    const db = getDb()
    const ts = now()

    // Build dynamic UPDATE — only touch fields the caller actually passed.
    const sets: string[] = []
    const values: unknown[] = []
    if (input.name !== undefined) {
      sets.push('name = ?')
      values.push(input.name)
    }
    if (input.description !== undefined) {
      sets.push('description = ?')
      values.push(input.description)
    }
    if (input.rows !== undefined) {
      sets.push('rows = ?')
      values.push(input.rows)
    }
    if (input.cols !== undefined) {
      sets.push('cols = ?')
      values.push(input.cols)
    }
    if (input.coverCard !== undefined) {
      sets.push('cover_card_data = ?')
      values.push(input.coverCard ? JSON.stringify(input.coverCard) : null)
    }
    sets.push('updated_at = ?')
    values.push(ts)
    values.push(input.id)

    db.prepare(`UPDATE binders SET ${sets.join(', ')} WHERE id = ?`).run(...values)
    const binder = await this.get(input.id)
    if (!binder) throw new Error('Binder not found after update')
    return binder
  },

  async remove(id: number): Promise<void> {
    const db = getDb()
    db.prepare(`DELETE FROM binders WHERE id = ?`).run(id)
  },

  async addPage(binderId: number): Promise<BinderPage> {
    const db = getDb()
    const next = (
      db
        .prepare(`SELECT COALESCE(MAX(page_index), -1) + 1 AS next FROM binder_pages WHERE binder_id = ?`)
        .get(binderId) as { next: number }
    ).next
    const info = db
      .prepare(`INSERT INTO binder_pages (binder_id, page_index) VALUES (?, ?)`)
      .run(binderId, next)
    db.prepare(`UPDATE binders SET updated_at = ? WHERE id = ?`).run(now(), binderId)
    return { id: Number(info.lastInsertRowid), pageIndex: next, slots: [] }
  },

  async removePage(pageId: number): Promise<void> {
    const db = getDb()
    // Find binder + index so we can compact remaining pages.
    const page = db
      .prepare(`SELECT binder_id, page_index FROM binder_pages WHERE id = ?`)
      .get(pageId) as { binder_id: number; page_index: number } | undefined
    if (!page) return

    const tx = db.transaction(() => {
      db.prepare(`DELETE FROM binder_pages WHERE id = ?`).run(pageId)
      // Shift subsequent pages up by one so page_index stays contiguous.
      db.prepare(
        `UPDATE binder_pages SET page_index = page_index - 1
         WHERE binder_id = ? AND page_index > ?`
      ).run(page.binder_id, page.page_index)
      db.prepare(`UPDATE binders SET updated_at = ? WHERE id = ?`).run(now(), page.binder_id)
    })
    tx()
  },

  async placeCard(input: PlaceCardInput): Promise<BinderSlot> {
    const db = getDb()
    const ts = now()
    const cardJson = JSON.stringify(input.card)
    const tradeStatus = normalizeTradeStatus(input.tradeStatus)

    // INSERT OR REPLACE on the unique (page_id, slot_index) constraint, then re-read.
    const tx = db.transaction(() => {
      db.prepare(`DELETE FROM binder_slots WHERE page_id = ? AND slot_index = ?`).run(
        input.pageId,
        input.slotIndex
      )
      db.prepare(
        `INSERT INTO binder_slots (page_id, slot_index, card_id, card_data, added_at, trade_status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(input.pageId, input.slotIndex, input.card.id, cardJson, ts, tradeStatus)

      // Bump binder.updated_at via join.
      db.prepare(
        `UPDATE binders SET updated_at = ?
         WHERE id = (SELECT binder_id FROM binder_pages WHERE id = ?)`
      ).run(ts, input.pageId)
    })
    tx()

    const slotRow = db
      .prepare(`SELECT * FROM binder_slots WHERE page_id = ? AND slot_index = ?`)
      .get(input.pageId, input.slotIndex) as SlotRow
    return mapSlot(slotRow)
  },

  async moveCard(input: MoveCardInput): Promise<void> {
    const db = getDb()
    const ts = now()

    const tx = db.transaction(() => {
      const fromSlot = db
        .prepare(`SELECT * FROM binder_slots WHERE page_id = ? AND slot_index = ?`)
        .get(input.fromPageId, input.fromSlotIndex) as SlotRow | undefined
      const toSlot = db
        .prepare(`SELECT * FROM binder_slots WHERE page_id = ? AND slot_index = ?`)
        .get(input.toPageId, input.toSlotIndex) as SlotRow | undefined

      // Nothing to move from.
      if (!fromSlot) return

      // Two-step swap: park the source on a sentinel slot_index to avoid the unique constraint,
      // then write both destinations.
      db.prepare(`DELETE FROM binder_slots WHERE id = ?`).run(fromSlot.id)
      if (toSlot) db.prepare(`DELETE FROM binder_slots WHERE id = ?`).run(toSlot.id)

      // Place the moved card in the destination, preserving its trade_status.
      db.prepare(
        `INSERT INTO binder_slots (page_id, slot_index, card_id, card_data, added_at, trade_status)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        input.toPageId,
        input.toSlotIndex,
        fromSlot.card_id,
        fromSlot.card_data,
        fromSlot.added_at,
        normalizeTradeStatus(fromSlot.trade_status)
      )

      // If the destination had a card, swap it back to the origin.
      if (toSlot) {
        db.prepare(
          `INSERT INTO binder_slots (page_id, slot_index, card_id, card_data, added_at, trade_status)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(
          input.fromPageId,
          input.fromSlotIndex,
          toSlot.card_id,
          toSlot.card_data,
          toSlot.added_at,
          normalizeTradeStatus(toSlot.trade_status)
        )
      }

      // Bump updated_at on the affected binder(s).
      db.prepare(
        `UPDATE binders SET updated_at = ?
         WHERE id IN (
           SELECT binder_id FROM binder_pages WHERE id IN (?, ?)
         )`
      ).run(ts, input.fromPageId, input.toPageId)
    })
    tx()
  },

  async removeCard(pageId: number, slotIndex: number): Promise<void> {
    const db = getDb()
    db.prepare(`DELETE FROM binder_slots WHERE page_id = ? AND slot_index = ?`).run(
      pageId,
      slotIndex
    )
    db.prepare(
      `UPDATE binders SET updated_at = ?
       WHERE id = (SELECT binder_id FROM binder_pages WHERE id = ?)`
    ).run(now(), pageId)
  },

  async setTradeStatus(slotId: number, status: TradeStatus): Promise<void> {
    const db = getDb()
    const ts = now()
    // Bump the parent binder's updated_at so list sorting reflects the change.
    const tx = db.transaction(() => {
      db.prepare(`UPDATE binder_slots SET trade_status = ? WHERE id = ?`).run(
        normalizeTradeStatus(status),
        slotId
      )
      db.prepare(
        `UPDATE binders SET updated_at = ?
         WHERE id = (
           SELECT bp.binder_id FROM binder_pages bp
             JOIN binder_slots bs ON bs.page_id = bp.id
            WHERE bs.id = ?
         )`
      ).run(ts, slotId)
    })
    tx()
  }
}
