import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRef, unref } from 'vue'
import type {
  Binder,
  BinderSummary,
  CreateBinderInput,
  MoveCardInput,
  PlaceCardInput,
  TradeStatus,
  UpdateBinderInput
} from '@shared/binders'

const api = () => window.api.binders

/** List all binders, ordered by most recently updated. */
export function useBinders() {
  return useQuery<BinderSummary[]>({
    queryKey: ['binders'],
    queryFn: () => api().list(),
    staleTime: 1000 * 30,
    // Override renderer-wide `refetchOnMount: false` — see useBinder for the
    // reasoning. The gallery must reflect renames/cover changes on return.
    refetchOnMount: true
  })
}

/** Full binder with all pages and slots. */
export function useBinder(id: MaybeRef<number | undefined>) {
  return useQuery<Binder | null>({
    queryKey: ['binder', id],
    queryFn: async () => {
      const v = unref(id)
      return typeof v === 'number' ? api().get(v) : null
    },
    enabled: computed(() => typeof unref(id) === 'number'),
    staleTime: 1000 * 10,
    // The renderer-wide default is `refetchOnMount: false`, which means a
    // BinderDetailPage remounted right after an Edit mutation would keep
    // serving the pre-mutation cache. For a "view" page we always want the
    // latest, so we opt back into the normal stale-driven refetch behavior.
    refetchOnMount: true
  })
}

export function useCreateBinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBinderInput) => api().create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binders'] })
  })
}

export function useUpdateBinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateBinderInput) => api().update(input),
    onSuccess: (binder) => {
      qc.invalidateQueries({ queryKey: ['binders'] })
      // Update the in-memory cache for an instant UI refresh in the currently
      // mounted page, AND invalidate so a re-mounted observer (e.g. navigating
      // back to BinderDetailPage) refetches from the DB. setQueryData alone is
      // unreliable when the query was registered with a reactive key.
      qc.setQueryData(['binder', binder.id], binder)
      qc.invalidateQueries({ queryKey: ['binder', binder.id] })
    }
  })
}

export function useRemoveBinder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api().remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binders'] })
  })
}

export function useAddPage(binderId: MaybeRef<number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api().addPage(unref(binderId)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binder', binderId] })
  })
}

export function useRemovePage(binderId: MaybeRef<number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pageId: number) => api().removePage(pageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binder', binderId] })
  })
}

export function usePlaceCard(binderId: MaybeRef<number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: PlaceCardInput) => api().placeCard(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binder', binderId] })
  })
}

export function useMoveCard(binderId: MaybeRef<number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: MoveCardInput) => api().moveCard(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binder', binderId] })
  })
}

export function useRemoveCard(binderId: MaybeRef<number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pageId, slotIndex }: { pageId: number; slotIndex: number }) =>
      api().removeCard(pageId, slotIndex),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binder', binderId] })
  })
}

export function useSetTradeStatus(binderId: MaybeRef<number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slotId, status }: { slotId: number; status: TradeStatus }) =>
      api().setTradeStatus(slotId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['binder', binderId] })
  })
}
