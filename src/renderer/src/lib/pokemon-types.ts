import type { PokemonType } from '@/api/pokemon'

/** Background gradient classes per type — used for type chips and hero accents. */
export const TYPE_COLORS: Record<PokemonType, { bg: string; ring: string; text: string }> = {
  Normal: { bg: 'bg-stone-400', ring: 'ring-stone-300', text: 'text-stone-50' },
  Fire: { bg: 'bg-orange-500', ring: 'ring-orange-400', text: 'text-orange-50' },
  Water: { bg: 'bg-blue-500', ring: 'ring-blue-400', text: 'text-blue-50' },
  Electric: { bg: 'bg-yellow-400', ring: 'ring-yellow-300', text: 'text-yellow-900' },
  Grass: { bg: 'bg-green-500', ring: 'ring-green-400', text: 'text-green-50' },
  Ice: { bg: 'bg-cyan-300', ring: 'ring-cyan-200', text: 'text-cyan-900' },
  Fighting: { bg: 'bg-red-700', ring: 'ring-red-600', text: 'text-red-50' },
  Poison: { bg: 'bg-purple-500', ring: 'ring-purple-400', text: 'text-purple-50' },
  Ground: { bg: 'bg-amber-600', ring: 'ring-amber-500', text: 'text-amber-50' },
  Flying: { bg: 'bg-indigo-400', ring: 'ring-indigo-300', text: 'text-indigo-50' },
  Psychic: { bg: 'bg-pink-500', ring: 'ring-pink-400', text: 'text-pink-50' },
  Bug: { bg: 'bg-lime-500', ring: 'ring-lime-400', text: 'text-lime-50' },
  Rock: { bg: 'bg-yellow-700', ring: 'ring-yellow-600', text: 'text-yellow-50' },
  Ghost: { bg: 'bg-violet-700', ring: 'ring-violet-600', text: 'text-violet-50' },
  Dragon: { bg: 'bg-indigo-700', ring: 'ring-indigo-600', text: 'text-indigo-50' },
  Dark: { bg: 'bg-zinc-700', ring: 'ring-zinc-600', text: 'text-zinc-50' },
  Steel: { bg: 'bg-slate-400', ring: 'ring-slate-300', text: 'text-slate-50' },
  Fairy: { bg: 'bg-pink-300', ring: 'ring-pink-200', text: 'text-pink-900' }
}
