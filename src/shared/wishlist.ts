/**
 * Wishlist — flat list of cards the user wants to acquire.
 * Independent from binders: a wishlist entry is a *want*, not a placement.
 */
import type { BinderCardSnapshot } from './binders'

export interface WishlistItem {
  id: number
  card: BinderCardSnapshot
  note: string | null
  addedAt: number
}

export interface AddWishlistInput {
  card: BinderCardSnapshot
  note?: string | null
}

export interface WishlistApi {
  list(): Promise<WishlistItem[]>
  add(input: AddWishlistInput): Promise<WishlistItem>
  remove(id: number): Promise<void>
  updateNote(id: number, note: string | null): Promise<void>
  /** Convenience: true if `cardId` is already on the wishlist. */
  has(cardId: number): Promise<boolean>
}
