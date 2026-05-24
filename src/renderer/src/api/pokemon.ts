import { api } from '@/lib/axios'

export interface Pokemon {
  /** Internal pokeos id, unique per form (e.g. Mega Venusaur = 10133). Used for detail API. */
  id: number
  /** Canonical PokeAPI id (e.g. Mega Venusaur = 10033). Used for sprite URLs. */
  species_id: number
  number: number
  name: string
}

interface RawPokemon {
  id: number
  species_id: number
  number: number
  identifier: string
}

export const getPokemonData = async (): Promise<Pokemon[]> => {
  const response = await api.get<{ data: RawPokemon[] }>('/general/data/pokemon_data')

  // Drop the first entry (MissingNO, id 0) and keep only what the UI needs.
  return response.data.data.slice(1).map((p) => ({
    id: p.id,
    species_id: p.species_id,
    number: p.number,
    name: p.identifier
  }))
}

export type PokemonType =
  | 'Normal'
  | 'Fire'
  | 'Water'
  | 'Electric'
  | 'Grass'
  | 'Ice'
  | 'Fighting'
  | 'Poison'
  | 'Ground'
  | 'Flying'
  | 'Psychic'
  | 'Bug'
  | 'Rock'
  | 'Ghost'
  | 'Dragon'
  | 'Dark'
  | 'Steel'
  | 'Fairy'

export interface PokemonDetail {
  id: number
  identifier: string
  number: number
  species_id: number
  HP: number
  Atk: number
  Def: number
  SpA: number
  SpD: number
  Spe: number
  type1: PokemonType
  type2: PokemonType | null
  gen: number
  height: number // decimeters
  weight: number // hectograms
  capture_rate: number
  hatch_counter: number
  evolution_chain_id: number
  evolves_from: number
  is_legendary: 0 | 1
  is_mythical: 0 | 1
  is_sublegendary: 0 | 1
  is_baby: 0 | 1
  is_paradox: 0 | 1
  is_ub: 0 | 1
  is_shiny_locked: 0 | 1
  has_gender_differences: 0 | 1
  gender_rate: number
  description: string
}

export const getPokemonById = async (id: number, lang = 8): Promise<PokemonDetail> => {
  const response = await api.get<PokemonDetail>('/poke/pokemon', {
    params: { id, lang }
  })
  return response.data
}
