/**
 * Export / Import file format for sharing a collector profile with friends.
 *
 * The file is plain JSON written to disk via Electron's save dialog. Friends
 * import it through the open dialog; the snapshot is stored read-only in
 * `friend_snapshots` and surfaced in the Trade Matcher.
 *
 * The `format` field is mandatory and versioned (`pkbinder/v<N>`). When we
 * change the schema in a breaking way, bump the version and add a migration
 * inside the import handler — never silently accept the old shape.
 */
import type { Binder } from './binders'
import type { WishlistItem } from './wishlist'

export const EXPORT_FORMAT = 'pkbinder/v1' as const
export type ExportFormat = typeof EXPORT_FORMAT

export interface ExportOwner {
  name: string
}

export interface ExportPayload {
  format: ExportFormat
  exportedAt: number
  owner: ExportOwner
  binders: Binder[]
  wishlist: WishlistItem[]
}

export interface ExportResult {
  /** Absolute path on disk where the file was saved. */
  path: string
  /** Size of the payload in bytes, for UI feedback. */
  byteSize: number
}

export interface ExportApi {
  /**
   * Open the save dialog and write the current profile to a `.pkbinder.json`
   * file. Resolves to `null` if the user cancelled.
   */
  exportProfile(ownerName: string): Promise<ExportResult | null>
}
