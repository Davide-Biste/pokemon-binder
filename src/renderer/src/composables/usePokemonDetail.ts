import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRef, unref } from 'vue'
import { getPokemonById } from '@/api/pokemon'

export function usePokemonDetail(id: MaybeRef<number | undefined>) {
  return useQuery({
    queryKey: ['pokemon-detail', id],
    queryFn: () => getPokemonById(unref(id) as number),
    enabled: computed(() => typeof unref(id) === 'number' && (unref(id) as number) > 0),
    staleTime: 1000 * 60 * 5
  })
}
