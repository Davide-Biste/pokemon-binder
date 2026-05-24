/**
 * Shared type definitions used by both the Electron main process (DB layer)
 * and the renderer (UI). Keeping the contract here avoids drift between sides.
 */

// Stored snapshot of a TCG card inside a binder slot — kept minimal so it
// can be persisted as JSON without ballooning.
export interface BinderCardSnapshot {
  id: number
  set_id: number
  card_number: string
  card_name: string
  card_rarity: string | null
  card_type: string | null
  artist: string | null
  lang: string
  date_created: string
  tcgl_set_code: string | null
  set_name_lang_8?: string | null
  set_name_lang_9?: string | null
  set_n_cards: number
}

export interface BinderSummary {
  id: number
  name: string
  description: string | null
  rows: number
  cols: number
  coverCard: BinderCardSnapshot | null
  pageCount: number
  cardCount: number
  createdAt: number
  updatedAt: number
}

/**
 * Trade intent on a card the user owns:
 * - `keep`      — part of the collection, not for trade (default).
 * - `for_trade` — explicitly offered for trade.
 * - `dupe`      — a duplicate; implicitly available, kept separate from keepers.
 *
 * `for_trade` and `dupe` are both surfaced to the Trade Matcher; the distinction
 * is editorial (the user's mental model) rather than functional.
 */
export type TradeStatus = 'keep' | 'for_trade' | 'dupe'

export interface BinderSlot {
  id: number
  slotIndex: number
  cardId: number
  card: BinderCardSnapshot
  tradeStatus: TradeStatus
  addedAt: number
}

export interface BinderPage {
  id: number
  pageIndex: number
  slots: BinderSlot[]
}

export interface Binder {
  id: number
  name: string
  description: string | null
  rows: number
  cols: number
  coverCard: BinderCardSnapshot | null
  pages: BinderPage[]
  createdAt: number
  updatedAt: number
}

export interface CreateBinderInput {
  name: string
  description?: string
  rows?: number
  cols?: number
  initialPages?: number
}

export interface UpdateBinderInput {
  id: number
  name?: string
  description?: string
  rows?: number
  cols?: number
  coverCard?: BinderCardSnapshot | null
}

export interface PlaceCardInput {
  pageId: number
  slotIndex: number
  card: BinderCardSnapshot
  /** Optional. Defaults to 'keep' on the DB side when omitted. */
  tradeStatus?: TradeStatus
}

export interface MoveCardInput {
  fromPageId: number
  fromSlotIndex: number
  toPageId: number
  toSlotIndex: number
}

export interface BinderApi {
  list(): Promise<BinderSummary[]>
  get(id: number): Promise<Binder | null>
  create(input: CreateBinderInput): Promise<Binder>
  update(input: UpdateBinderInput): Promise<Binder>
  remove(id: number): Promise<void>
  addPage(binderId: number): Promise<BinderPage>
  removePage(pageId: number): Promise<void>
  placeCard(input: PlaceCardInput): Promise<BinderSlot>
  moveCard(input: MoveCardInput): Promise<void>
  removeCard(pageId: number, slotIndex: number): Promise<void>
  setTradeStatus(slotId: number, status: TradeStatus): Promise<void>
}
