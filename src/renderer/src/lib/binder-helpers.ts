import type { Binder } from '@shared/binders'

/**
 * Find the first unfilled slot across the binder's pages, scanning page-by-page
 * and slot-by-slot in index order. Returns null if every slot is occupied.
 */
export function findFirstEmptySlot(
  binder: Binder
): { pageId: number; slotIndex: number } | null {
  const slotsPerPage = binder.rows * binder.cols
  for (const page of binder.pages) {
    const filled = new Set(page.slots.map((s) => s.slotIndex))
    for (let i = 0; i < slotsPerPage; i++) {
      if (!filled.has(i)) return { pageId: page.id, slotIndex: i }
    }
  }
  return null
}
