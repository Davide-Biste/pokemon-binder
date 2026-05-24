import { computed, type MaybeRef, unref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { FriendSnapshot, FriendSummary } from '@shared/friends'

const api = () => window.api.friends

const KEY_LIST = ['friends'] as const

export function useFriends() {
  return useQuery<FriendSummary[]>({
    queryKey: KEY_LIST,
    queryFn: () => api().list(),
    staleTime: 1000 * 30,
    // Override renderer-wide `refetchOnMount: false` — see useBinder.
    // An import triggered from the sidebar must show up on this page on return.
    refetchOnMount: true
  })
}

/** Full payloads of every friend — for the Dashboard trade radar. */
export function useFriendsFull() {
  return useQuery<FriendSnapshot[]>({
    queryKey: ['friends', 'full'],
    queryFn: () => api().listFull(),
    staleTime: 1000 * 10,
    refetchOnMount: true
  })
}

export function useFriend(id: MaybeRef<number | undefined>) {
  return useQuery<FriendSnapshot | null>({
    queryKey: ['friend', id],
    queryFn: async () => {
      const v = unref(id)
      return typeof v === 'number' ? api().get(v) : null
    },
    enabled: computed(() => typeof unref(id) === 'number'),
    staleTime: 1000 * 10,
    refetchOnMount: true
  })
}

/**
 * Opens the file dialog and imports a `.pkbinder.json`.
 * Returns the new snapshot or `null` if the user cancelled. Rejects on parse errors.
 */
export function useImportFriend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api().importFromFile(),
    onSuccess: (snap) => {
      if (snap) qc.invalidateQueries({ queryKey: KEY_LIST })
    }
  })
}

export function useRemoveFriend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api().remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY_LIST })
  })
}
