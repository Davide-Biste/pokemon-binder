import { api } from '@/lib/axios'

export interface TcgCard {
  id: number
  set_id: number
  card_order: number
  card_number: string
  card_name: string
  card_type: string | null
  card_rarity: string | null
  artist: string | null
  no_holo: string
  holo: string
  reverse_holo: string
  variants: string
  date_created: string
  description: string | null
  /** Language code of the card / set (e.g. "eng", "chn", "jap", "pocket"). */
  lang: string
  set_name_lang_1: string | null
  set_name_lang_5: string | null
  set_name_lang_6: string | null
  set_name_lang_7: string | null
  set_name_lang_8: string | null
  set_name_lang_9: string | null
  set_n_cards: number
  set_group: string | null
  set_code: string | null
  tcgl_set_code: string | null
  tcgp_can_trade: number
}

export interface TcgSearchParams {
  search: string
  artist?: string
  lang?: number
  include_prices?: boolean
  limit?: number
}

export const searchTcgCards = async ({
  search,
  artist = '',
  lang = 8,
  include_prices = false,
  limit = 50
}: TcgSearchParams): Promise<TcgCard[]> => {
  const response = await api.get<TcgCard[]>('/tcg/search', {
    params: { search, artist, lang, include_prices, limit }
  })
  return response.data
}

const S3_BASE = 'https://s3.pokeos.com/pokeos-uploads'

/** Maps the pokeos numeric language id to the 2-letter code used in S3 file names. */
const LANG_CODES: Record<number, string> = {
  9: 'en',
  8: 'it',
  7: 'es',
  6: 'de',
  5: 'fr',
  10: 'ptbr',
  1: 'ja',
  3: 'ko',
  4: 'zh',
  11: 'latam'
}

export interface CardImageOptions {
  /** Preferred display language. Falls back to English on missing assets. */
  preferredLang?: number
}

/**
 * Build the S3 image URL for a card. Reverse-engineered from the pokeos web bundle:
 * different card sources live in different folders, so we branch on `lang` and `tcgl_set_code`.
 *
 * We always request the full-res asset — the `_t.png` thumbnail variant is never used.
 */
export function getCardImageUrl(card: TcgCard, opts: CardImageOptions = {}): string {
  return getCardImageUrls(card, opts)[0]
}

/**
 * Returns all candidate image URLs for a card, ordered by preference.
 * The UI walks the list on image-error so we degrade gracefully across languages
 * (preferred language → English). Thumbnail (`_t.png`) variants are never emitted.
 */
export function getCardImageUrls(card: TcgCard, opts: CardImageOptions = {}): string[] {
  const { preferredLang = 8 } = opts
  const v = encodeURIComponent(card.date_created)
  // Try the user-preferred language first, then English as a safety net.
  const langs = Array.from(new Set([preferredLang, 9]))
  const urls: string[] = []

  for (const lang of langs) {
    const langCode = LANG_CODES[lang] ?? 'en'

    if (card.lang === 'pocket') {
      urls.push(
        `${S3_BASE}/tcg/pocket/${card.set_id}/src/${card.card_number}_${langCode}.png?v=${v}`
      )
      continue
    }

    if (card.tcgl_set_code) {
      const padded = String(card.card_number).padStart(3, '0')
      urls.push(`${S3_BASE}/tcg/eng/src/${card.tcgl_set_code}_${langCode}_${padded}.png?v=${v}`)
      continue
    }

    // The default webp set is language-agnostic per `card.lang` — no need for lang fallbacks.
    urls.push(`${S3_BASE}/tcg/${card.lang}/${card.set_id}/${card.card_number}.webp?v=${v}`)
    break
  }

  return urls
}

/** Pick the best available localized set name, falling back through known langs. */
export function getSetName(card: TcgCard, preferredLang = 8): string | null {
  const order = [preferredLang, 9, 7, 5, 6, 8, 1]
  for (const l of order) {
    const v = card[`set_name_lang_${l}` as keyof TcgCard] as string | null | undefined
    if (v) return v
  }
  return card.set_code
}

/**
 * Mapping numero-lingua → codice ISO breve + bandiera emoji, ordinato come
 * lo presentiamo in UI. I numeri vengono dall'API pokeos (vedi `LANG_CODES`).
 * Tengo `en` per primo (è la lingua "universale" del TCG) poi `it` come
 * default dell'app, le altre a seguire.
 *
 * Note sulle bandiere:
 *  - EN → 🇬🇧 (UK) anziché US: il TCG inglese europeo è la stampa più diffusa.
 *  - LATAM → 🌎 (regionale, non c'è una bandiera nazionale).
 *  - ZH → 🇨🇳 (Cinese Semplificato; il backend non distingue Traditional).
 */
const LANG_DISPLAY: ReadonlyArray<{ id: number; code: string; flag: string }> = [
  { id: 9, code: 'EN', flag: '🇬🇧' },
  { id: 8, code: 'IT', flag: '🇮🇹' },
  { id: 7, code: 'ES', flag: '🇪🇸' },
  { id: 5, code: 'FR', flag: '🇫🇷' },
  { id: 6, code: 'DE', flag: '🇩🇪' },
  { id: 10, code: 'PT-BR', flag: '🇧🇷' },
  { id: 11, code: 'LATAM', flag: '🌎' },
  { id: 1, code: 'JA', flag: '🇯🇵' },
  { id: 3, code: 'KO', flag: '🇰🇷' },
  { id: 4, code: 'ZH', flag: '🇨🇳' }
]

export interface LanguageBadge {
  /** Codice breve mostrato in UI (`EN`, `IT`, `PT-BR`, …). */
  code: string
  /** Bandiera emoji corrispondente (`🇬🇧`, `🇮🇹`, …). */
  flag: string
}

/**
 * Returns all language badges (codice + bandiera) in which the card has been
 * printed. We infer "printed in language N" from the presence of
 * `set_name_lang_N`: pokeos populates that field only when the set has an
 * official release in that language.
 *
 * Fallback: se nessuno dei `set_name_lang_*` è valorizzato (set sconosciuto
 * o record corrotto), ritorniamo almeno la lingua sorgente della carta
 * (`card.lang`, normalizzato) — meglio mostrare qualcosa che vuoto.
 */
export function getAvailableLanguages(card: TcgCard): LanguageBadge[] {
  const out: LanguageBadge[] = []
  for (const { id, code, flag } of LANG_DISPLAY) {
    const v = card[`set_name_lang_${id}` as keyof TcgCard] as string | null | undefined
    if (v) out.push({ code, flag })
  }
  if (out.length > 0) return out

  // Niente set_name_* valorizzato → fallback sul `lang` del record.
  // Mappo le sigle 3-char pokeos al `LANG_DISPLAY` per recuperare la bandiera.
  const fallback = (card.lang ?? '').toLowerCase()
  const fallbackToCode: Record<string, string> = {
    eng: 'EN',
    ita: 'IT',
    spa: 'ES',
    fre: 'FR',
    fra: 'FR',
    ger: 'DE',
    deu: 'DE',
    ptbr: 'PT-BR',
    jpn: 'JA',
    jap: 'JA',
    kor: 'KO',
    chn: 'ZH'
  }
  const guessed = fallbackToCode[fallback] ?? fallback.toUpperCase()
  if (!guessed) return []
  const match = LANG_DISPLAY.find((l) => l.code === guessed)
  return match
    ? [{ code: match.code, flag: match.flag }]
    : [{ code: guessed, flag: '🏳️' }]
}
