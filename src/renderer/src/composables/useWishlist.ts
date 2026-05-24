import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { AddWishlistInput, WishlistItem } from '@shared/wishlist'

const api = () => window.api.wishlist

const KEY_LIST = ['wishlist'] as const
const keyHas = (cardId: number) => ['wishlist', 'has', cardId] as const

/** Full wishlist, newest first. */
export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: KEY_LIST,
    queryFn: () => api().list(),
    staleTime: 1000 * 30,
    // Renderer-wide default is `refetchOnMount: false`; this is a view page,
    // so it must show fresh data after add/remove mutations elsewhere.
    refetchOnMount: true
  })
}

/** Cheap presence check used by binder/picker UIs to show a "★ in wishlist" mark. */
export function useIsInWishlist(cardId: number) {
  return useQuery<boolean>({
    queryKey: keyHas(cardId),
    queryFn: () => api().has(cardId),
    staleTime: 1000 * 30
  })
}

export function useAddWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AddWishlistInput) => api().add(input),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: KEY_LIST })
      qc.setQueryData(keyHas(item.card.id), true)
    }
  })
}

export function useRemoveWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api().remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY_LIST })
      // We don't know the cardId here without extra plumbing; invalidate broadly.
      qc.invalidateQueries({ queryKey: ['wishlist', 'has'] })
    }
  })
}

export function useUpdateWishlistNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string | null }) =>
      api().updateNote(id, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY_LIST })
  })
}
