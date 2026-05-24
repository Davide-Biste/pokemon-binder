/**
 * Friend snapshots — read-only copies of other people's profiles, imported
 * from `.pkbinder.json` files. Updating a snapshot means re-importing the
 * same friend; we replace by id (manual choice in the UI) rather than auto-
 * deduping by owner name, since two friends could share a name.
 */
import type { ExportPayload } from './export'

export interface FriendSummary {
  id: number
  ownerName: string
  exportedAt: number
  importedAt: number
  /** Total binders the snapshot contains. */
  binderCount: number
  /** Total card placements across all binders. */
  cardCount: number
  /** Cards marked as `for_trade` or `dupe`. */
  tradablesCount: number
  wishlistCount: number
}

export interface FriendSnapshot {
  id: number
  ownerName: string
  sourcePath: string | null
  exportedAt: number
  importedAt: number
  payload: ExportPayload
}

export interface FriendsApi {
  list(): Promise<FriendSummary[]>
  /**
   * Same set as `list()` but with full payloads — for the Dashboard radar,
   * which diffs every friend against the owner profile in one pass.
   */
  listFull(): Promise<FriendSnapshot[]>
  get(id: number): Promise<FriendSnapshot | null>
  /**
   * Open the file picker and import a `.pkbinder.json`. Resolves to the new
   * snapshot, or `null` if the user cancelled.
   * Throws if the file is unreadable or its `format` field is unsupported.
   */
  importFromFile(): Promise<FriendSnapshot | null>
  remove(id: number): Promise<void>
}
