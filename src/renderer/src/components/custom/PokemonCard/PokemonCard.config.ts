export interface PokemonCardProps {
  /** Pokeos internal id (used for navigation to the detail page). */
  id: number
  /** PokeAPI canonical id (used for sprite URLs). */
  speciesId: number
  number: number
  name: string
}
