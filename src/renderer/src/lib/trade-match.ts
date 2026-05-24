/**
 * Trade matching — pure functions, no Vue/IPC. Diffs two profiles
 * (mine vs a friend's snapshot) to find mutually beneficial swaps.
 *
 * Both inputs are ExportPayload-shaped so "me" and "them" go through the same
 * code path; `computeTradeMatches(me, them)` and `computeTradeMatches(them, me)`
 * are not symmetric because what each side wants differs.
 */
import type { BinderCardSnapshot } from '@shared/binders'
import type { ExportPayload } from '@shared/export'

/**
 * One physical card a side is willing to part with. We keep multiplicity:
 * if I have 3 dupes of Charizard, that's 3 entries (one per slot).
 */
export interface TradableCard {
  /** Stable per-snapshot id (slot.id when available, else synthesised). */
  key: string
  binderId: number
  binderName: string
  pageIndex: number
  slotIndex: number
  card: BinderCardSnapshot
  tradeStatus: 'for_trade' | 'dupe'
}

export interface TradeMatchEntry {
  card: BinderCardSnapshot
  /** How many copies the offering side has available (1+). */
  available: number
  /** Sample of offered slots — useful for showing binder context in UI. */
  offers: TradableCard[]
}

export interface TradeMatchResult {
  /** Cards the friend offers that intersect my wishlist. */
  theyOfferIWant: TradeMatchEntry[]
  /** Cards I offer that intersect their wishlist. */
  iOfferTheyWant: TradeMatchEntry[]
  /**
   * Mutually-beneficial "trade size" hint: the min of the two list lengths.
   * Not a literal trade count — just a quick UI heuristic.
   */
  fairnessScore: number
}

/** Flatten every binder slot whose tradeStatus is 'for_trade' or 'dupe'. */
export function collectTradables(profile: ExportPayload): TradableCard[] {
  const out: TradableCard[] = []
  for (const binder of profile.binders) {
    for (const page of binder.pages) {
      for (const slot of page.slots) {
        if (slot.tradeStatus === 'for_trade' || slot.tradeStatus === 'dupe') {
          out.push({
            key: `${binder.id}-${page.id}-${slot.slotIndex}`,
            binderId: binder.id,
            binderName: binder.name,
            pageIndex: page.pageIndex,
            slotIndex: slot.slotIndex,
            card: slot.card,
            tradeStatus: slot.tradeStatus
          })
        }
      }
    }
  }
  return out
}

/** The set of card_ids the side is hunting. */
export function wishedCardIds(profile: ExportPayload): Set<number> {
  return new Set(profile.wishlist.map((w) => w.card.id))
}

function groupByCardId(tradables: TradableCard[], want: Set<number>): TradeMatchEntry[] {
  const groups = new Map<number, TradableCard[]>()
  for (const t of tradables) {
    if (!want.has(t.card.id)) continue
    const list = groups.get(t.card.id) ?? []
    list.push(t)
    groups.set(t.card.id, list)
  }
  return Array.from(groups.values())
    .map((offers) => ({
      card: offers[0].card,
      available: offers.length,
      offers
    }))
    .sort((a, b) => a.card.card_name.localeCompare(b.card.card_name))
}

export function computeTradeMatches(
  me: ExportPayload,
  them: ExportPayload
): TradeMatchResult {
  const myWants = wishedCardIds(me)
  const theirWants = wishedCardIds(them)

  const theirOffers = collectTradables(them)
  const myOffers = collectTradables(me)

  const theyOfferIWant = groupByCardId(theirOffers, myWants)
  const iOfferTheyWant = groupByCardId(myOffers, theirWants)

  return {
    theyOfferIWant,
    iOfferTheyWant,
    fairnessScore: Math.min(theyOfferIWant.length, iOfferTheyWant.length)
  }
}

/**
 * Lightweight per-friend summary for the Dashboard trade radar: just the two
 * match counts and the fairness score, sorted so the most promising friends
 * surface first.
 */
export interface TradeRadarRow {
  friendId: number
  ownerName: string
  theyOfferIWantCount: number
  iOfferTheyWantCount: number
  fairnessScore: number
}

export function computeTradeRadar(
  me: ExportPayload,
  friends: ReadonlyArray<{ id: number; payload: ExportPayload }>
): TradeRadarRow[] {
  return friends
    .map((f) => {
      const r = computeTradeMatches(me, f.payload)
      return {
        friendId: f.id,
        ownerName: f.payload.owner.name,
        theyOfferIWantCount: r.theyOfferIWant.length,
        iOfferTheyWantCount: r.iOfferTheyWant.length,
        fairnessScore: r.fairnessScore
      }
    })
    .sort((a, b) => {
      // Prioritise mutually-beneficial trades, then total potential volume.
      if (b.fairnessScore !== a.fairnessScore) return b.fairnessScore - a.fairnessScore
      const totalA = a.theyOfferIWantCount + a.iOfferTheyWantCount
      const totalB = b.theyOfferIWantCount + b.iOfferTheyWantCount
      return totalB - totalA
    })
}
