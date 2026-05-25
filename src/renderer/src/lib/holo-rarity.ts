/**
 * Map our app's rarity strings (Scarlet & Violet era + legacy) onto the
 * `data-rarity` values used by simeydotme/pokemon-cards-css.
 *
 * The simey CSS targets SWSH-era rarities via selectors like
 * `[data-rarity="rare holo"]`, `[data-rarity="rare ultra"]`, etc. Our cards
 * come from the modern Pokémon TCG API with different vocabulary
 * ("illustration rare", "hyper rare", …), so we translate one → the other.
 *
 * When in doubt we lean toward a visible holo: showing *some* shine on a card
 * that didn't have one in real life is better than a flat image where the
 * user expects sparkle.
 */

/** Output strings recognised by the simey CSS. */
export type HoloDataRarity =
  | 'rare holo'
  | 'rare holo cosmos'
  | 'rare holo v'
  | 'rare holo vmax'
  | 'rare holo vstar'
  | 'rare ultra'
  | 'rare secret'
  | 'rare rainbow'
  | 'rare rainbow alt'
  | 'rare shiny'
  | 'rare shiny v'
  | 'rare shiny vmax'
  | 'amazing rare'
  | 'radiant rare'
  | 'trainer gallery rare holo'
  | 'reverse holo'
  | '' // no effect

const MAP: Record<string, HoloDataRarity> = {
  // Common holos
  'holo rare': 'rare holo',
  'rare holo': 'rare holo',
  'double rare': 'rare holo',
  'mega attack rare': 'rare holo',

  // V-style / Ultra
  'super rare': 'rare holo v',
  'ultra rare': 'rare ultra',

  // Full art / illustration → ultra-grade foil
  'art rare': 'rare ultra',
  'illustration rare': 'rare ultra',
  'special illustration rare': 'rare rainbow alt',

  // Top-tier rainbow / hyper
  'hyper rare': 'rare rainbow',
  'mega hyper rare': 'rare rainbow',
  'crown rare': 'rare rainbow',

  // Secret slot
  'secret rare': 'rare secret',

  // Shiny
  'shiny rare': 'rare shiny',
  'super shiny rare': 'rare shiny v',

  // Cosmos-flavoured promo / immersive
  'immersive rare': 'rare holo cosmos',

  // Legacy / direct passthrough
  'amazing rare': 'amazing rare',
  'radiant rare': 'radiant rare',
  'trainer gallery rare holo': 'trainer gallery rare holo'
}

/**
 * Translate a free-form rarity string to the simey `data-rarity` value.
 * Returns `''` for unknown rarities — the card renders flat (no holo layers).
 */
export function toHoloDataRarity(rarity: string | null | undefined): HoloDataRarity {
  if (!rarity) return ''
  const key = rarity.trim().toLowerCase()
  return MAP[key] ?? ''
}

/**
 * Best-effort guess at the simey `data-subtypes`. The CSS uses this to clip
 * holo masks differently for stage Pokémon vs. trainer cards. We accept
 * either an array (TCG API style) or a free-form string.
 *
 * Returned values are joined and lowercased to match the simey selectors
 * (`[data-subtypes^="stage"]`, `[data-subtypes^="supporter"]`, etc.).
 */
export function toHoloSubtypes(input: string | string[] | null | undefined): string {
  if (!input) return 'basic'
  const joined = Array.isArray(input) ? input.join(' ') : input
  return joined.toLowerCase()
}

/** `pokemon` / `trainer` / `energy` — controls trainer-card clip paths. */
export function toHoloSupertype(input: string | null | undefined): string {
  if (!input) return 'pokémon'
  return input.toLowerCase()
}
