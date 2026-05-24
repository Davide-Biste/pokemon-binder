import { useQuery } from '@tanstack/vue-query'
import { computed, unref, type MaybeRef } from 'vue'
import { searchTcgCards } from '@/api/tcg'

export function useTcgCards(name: MaybeRef<string | undefined>, limit = 50) {
  return useQuery({
    queryKey: ['tcg-cards', name, limit],
    queryFn: () => searchTcgCards({ search: unref(name) as string, limit }),
    enabled: computed(() => !!unref(name)),
    staleTime: 1000 * 60 * 10
  })
}
