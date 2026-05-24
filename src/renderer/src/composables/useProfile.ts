import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { ExportPayload } from '@shared/export'

const api = () => window.api.profile

const KEY_OWNER = ['profile', 'ownerName'] as const

export function useOwnerName() {
  return useQuery<string>({
    queryKey: KEY_OWNER,
    queryFn: () => api().getOwnerName(),
    staleTime: Infinity
  })
}

export function useSetOwnerName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => api().setOwnerName(name),
    onSuccess: (_v, name) => qc.setQueryData(KEY_OWNER, name)
  })
}

/**
 * Triggers the export flow. Resolves with the saved file info, or `null` if the
 * user cancelled the save dialog.
 */
export function useExportProfile() {
  return useMutation({
    mutationFn: (ownerName: string) => api().export(ownerName)
  })
}

/**
 * Live snapshot of the owner's data in the same ExportPayload shape as friends'
 * snapshots, so the Trade Matcher can diff them symmetrically.
 *
 * Lower staleTime than friend snapshots (which are frozen on disk): the user
 * may flip trade_status mid-session and expect matches to update.
 */
export function useOwnerProfile() {
  return useQuery<ExportPayload>({
    queryKey: ['profile', 'self'],
    queryFn: () => api().getProfile(),
    staleTime: 1000 * 5,
    // Critical for the Trade Matcher: flipping trade_status on a card in
    // BinderEditPage and navigating to /trades must recompute matches against
    // fresh data, not the snapshot loaded last time the page was visited.
    refetchOnMount: true
  })
}
