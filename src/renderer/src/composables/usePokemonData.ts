import { useQuery } from '@tanstack/vue-query'
import { getPokemonData } from '@/api/pokemon'

export function usePokemonData() {
  return useQuery({
    queryKey: ['pokemon-data'],
    queryFn: getPokemonData
  })
}
