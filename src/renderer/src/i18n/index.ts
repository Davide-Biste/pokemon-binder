/**
 * i18n setup. The renderer owns the list of supported locales — main only
 * persists whatever string the renderer gives it.
 *
 * Initial locale resolution order:
 *   1. value saved in the `settings` table
 *   2. `navigator.language` short code, if it matches a supported locale
 *   3. fallback `en`
 *
 * `bootstrapI18n()` returns the configured plugin and seeds the locale
 * asynchronously after main.ts has installed it — we don't want the whole
 * app boot to wait on an IPC call.
 */
import { computed, type ComputedRef } from 'vue'
import { createI18n } from 'vue-i18n'
import en from './locales/en'
import it from './locales/it'

export const SUPPORTED_LOCALES = ['en', 'it'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  it: 'Italiano'
}

export function isSupportedLocale(code: string | null | undefined): code is SupportedLocale {
  return !!code && (SUPPORTED_LOCALES as readonly string[]).includes(code)
}

// Schema of the translation tree, derived from the English source of truth.
// Keeps Italian honest: if you add a key in en.ts, `it.ts` must mirror it
// (typed via `import type { MessageSchema }` in `it.ts`).
export type MessageSchema = typeof en

// Note: we don't pass the generics to createI18n because vue-i18n's typed
// inference clobbers `locale.value` access. We keep schema typing at the
// `it.ts` definition site instead, where it actually catches missing keys.
export const i18n = createI18n({
  legacy: false,
  locale: 'en' as SupportedLocale,
  fallbackLocale: 'en' as SupportedLocale,
  messages: { en, it }
})

/** Pick a sensible initial locale from the browser, ignoring region. */
function detectBrowserLocale(): SupportedLocale {
  const short = (navigator.language || 'en').slice(0, 2).toLowerCase()
  return isSupportedLocale(short) ? short : 'en'
}

/**
 * Read the persisted locale (or detect from browser) and apply it.
 * Safe to call multiple times — last write wins.
 */
export async function hydrateLocaleFromSettings(): Promise<void> {
  try {
    const saved = await window.api.profile.getLocale()
    const next = isSupportedLocale(saved) ? saved : detectBrowserLocale()
    i18n.global.locale.value = next
  } catch {
    // If the IPC isn't available yet (e.g. test env), keep the default.
    i18n.global.locale.value = detectBrowserLocale()
  }
}

/** Switch locale and persist it. */
export async function setLocale(locale: SupportedLocale): Promise<void> {
  i18n.global.locale.value = locale
  document.documentElement.setAttribute('lang', locale)
  try {
    await window.api.profile.setLocale(locale)
  } catch {
    // Persistence is best-effort; in-memory switch still happened.
  }
}

/**
 * Mapping locale UI → ID lingua pokeos (vedi `LANG_CODES` in `api/tcg.ts`).
 * Esteso facilmente quando aggiungeremo altre lingue (es. 'fr' → 5).
 */
const LOCALE_TO_POKEOS_LANG: Record<SupportedLocale, number> = {
  en: 9,
  it: 8
}

/** Default usato quando la locale corrente non ha un mapping diretto. */
const DEFAULT_POKEOS_LANG = 9 // EN — lingua più diffusa del TCG

/**
 * Reactive `preferredLang` derivata dalla locale UI corrente.
 *
 * Usata da `getCardImageUrl{,s}()` e `getSetName()` per scegliere quale
 * versione localizzata della carta/set mostrare. Quando l'utente cambia
 * lingua dell'app via `setLocale()`, tutti i computed che dipendono da
 * questa ref re-renderizzano automaticamente con le nuove URL/nomi.
 *
 * Es. uso:
 *   const preferredLang = usePreferredLang()
 *   const url = computed(() => getCardImageUrl(card, { preferredLang: preferredLang.value }))
 */
export function usePreferredLang(): ComputedRef<number> {
  return computed(() => {
    const code = i18n.global.locale.value as string
    return LOCALE_TO_POKEOS_LANG[code as SupportedLocale] ?? DEFAULT_POKEOS_LANG
  })
}
