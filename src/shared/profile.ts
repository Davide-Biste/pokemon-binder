/**
 * Profile API — owner identity + the export entry point.
 * Kept separate from ExportApi to leave room for future profile fields
 * (avatar, preferred language…) without bloating the shared types.
 */
import type { ExportPayload, ExportResult } from './export'

export interface ProfileApi {
  getOwnerName(): Promise<string>
  setOwnerName(name: string): Promise<void>
  /** Triggers the save dialog and writes the `.pkbinder.json`. */
  export(ownerName: string): Promise<ExportResult | null>
  /**
   * Build the owner payload in memory (no file I/O). Used by the Trade
   * Matcher to diff "me" against imported friend snapshots.
   */
  getProfile(): Promise<ExportPayload>
  /** Persisted UI locale code ('en', 'it', ...) — null if never set. */
  getLocale(): Promise<string | null>
  setLocale(locale: string): Promise<void>
}
