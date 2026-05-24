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
