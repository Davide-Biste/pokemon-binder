import type { TcgCard } from '@/api/tcg'
import type { BinderCardSnapshot } from '@shared/binders'

/** Project a full TcgCard down to the minimal snapshot we persist in the binder DB. */
export function toBinderSnapshot(card: TcgCard): BinderCardSnapshot {
  return {
    id: card.id,
    set_id: card.set_id,
    card_number: card.card_number,
    card_name: card.card_name,
    card_rarity: card.card_rarity,
    card_type: card.card_type,
    artist: card.artist,
    lang: card.lang,
    date_created: card.date_created,
    tcgl_set_code: card.tcgl_set_code,
    set_name_lang_8: card.set_name_lang_8,
    set_name_lang_9: card.set_name_lang_9,
    set_n_cards: card.set_n_cards
  }
}

/** Inflate a snapshot back into a TcgCard-compatible shape for renderers. */
export function snapshotToTcgCard(s: BinderCardSnapshot): TcgCard {
  return {
    id: s.id,
    set_id: s.set_id,
    card_order: 0,
    card_number: s.card_number,
    card_name: s.card_name,
    card_type: s.card_type,
    card_rarity: s.card_rarity,
    artist: s.artist,
    no_holo: '1',
    holo: '0',
    reverse_holo: '0',
    variants: '',
    date_created: s.date_created,
    description: null,
    lang: s.lang,
    set_name_lang_1: null,
    set_name_lang_5: null,
    set_name_lang_6: null,
    set_name_lang_7: null,
    set_name_lang_8: s.set_name_lang_8 ?? null,
    set_name_lang_9: s.set_name_lang_9 ?? null,
    set_n_cards: s.set_n_cards,
    set_group: null,
    set_code: null,
    tcgl_set_code: s.tcgl_set_code,
    tcgp_can_trade: 0
  }
}
