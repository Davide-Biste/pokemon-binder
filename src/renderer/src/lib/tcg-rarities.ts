/**
 * Visual styling per TCG rarity tier.
 * - `badge`: Tailwind classes for the rarity chip (background + text).
 * - `ring`: hover/active ring color on the card container.
 * - `glow`: shadow glow color used on hover.
 * - `dropShadow`: hover drop-shadow filter — follows the card's actual silhouette
 *   (transparent PNG corners), unlike `box-shadow` which wraps a rectangle.
 * - `icon`: small glyph rendered before the rarity name.
 */
export interface RarityStyle {
  badge: string
  ring: string
  glow: string
  dropShadow: string
  icon: string
}

const FALLBACK: RarityStyle = {
  badge: 'bg-zinc-700/90 text-zinc-100',
  ring: 'group-hover:ring-white/20',
  glow: 'group-hover:shadow-white/10',
  dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(255,255,255,0.18)]',
  icon: '●'
}

// Keys are lowercased rarity strings for case-insensitive lookup.
const STYLES: Record<string, RarityStyle> = {
  common: {
    badge: 'bg-zinc-600/90 text-zinc-100',
    ring: 'group-hover:ring-zinc-400/40',
    glow: 'group-hover:shadow-zinc-400/20',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(161,161,170,0.30)]',
    icon: '●'
  },
  uncommon: {
    badge: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
    ring: 'group-hover:ring-emerald-400/60',
    glow: 'group-hover:shadow-emerald-500/30',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(16,185,129,0.50)]',
    icon: '◆'
  },
  rare: {
    badge: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white',
    ring: 'group-hover:ring-sky-400/60',
    glow: 'group-hover:shadow-sky-500/40',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(14,165,233,0.55)]',
    icon: '★'
  },
  'holo rare': {
    badge: 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 text-white',
    ring: 'group-hover:ring-cyan-400/70',
    glow: 'group-hover:shadow-cyan-500/40',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(34,211,238,0.60)]',
    icon: '★'
  },
  'double rare': {
    badge: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 text-white',
    ring: 'group-hover:ring-indigo-400/70',
    glow: 'group-hover:shadow-indigo-500/45',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(99,102,241,0.60)]',
    icon: '★★'
  },
  'super rare': {
    badge: 'bg-gradient-to-r from-slate-200 via-white to-slate-200 text-slate-900',
    ring: 'group-hover:ring-slate-200/80',
    glow: 'group-hover:shadow-slate-200/40',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(255,255,255,0.45)]',
    icon: '✦'
  },
  'ultra rare': {
    badge: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white',
    ring: 'group-hover:ring-violet-400/70',
    glow: 'group-hover:shadow-violet-500/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(139,92,246,0.65)]',
    icon: '✦'
  },
  'mega attack rare': {
    badge: 'bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white',
    ring: 'group-hover:ring-orange-400/80',
    glow: 'group-hover:shadow-orange-500/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(249,115,22,0.65)]',
    icon: '⚡'
  },
  'immersive rare': {
    badge:
      'bg-gradient-to-r from-violet-800 via-fuchsia-700 to-indigo-800 text-white ring-fuchsia-300/40',
    ring: 'group-hover:ring-fuchsia-400/70',
    glow: 'group-hover:shadow-fuchsia-600/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(217,70,239,0.65)]',
    icon: '◉'
  },
  'illustration rare': {
    badge: 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 text-white',
    ring: 'group-hover:ring-fuchsia-400/70',
    glow: 'group-hover:shadow-fuchsia-500/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(232,121,249,0.65)]',
    icon: '✦'
  },
  'special illustration rare': {
    badge:
      'bg-[linear-gradient(110deg,#f472b6,#a78bfa,#60a5fa,#34d399,#facc15,#f472b6)] bg-[length:200%_100%] animate-[gradient_4s_linear_infinite] text-white',
    ring: 'group-hover:ring-pink-400/80',
    glow: 'group-hover:shadow-pink-500/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(236,72,153,0.65)]',
    icon: '✧'
  },
  'art rare': {
    badge: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
    ring: 'group-hover:ring-pink-400/70',
    glow: 'group-hover:shadow-pink-500/40',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(236,72,153,0.60)]',
    icon: '✦'
  },
  'hyper rare': {
    badge:
      'bg-[linear-gradient(110deg,#fbbf24,#f472b6,#60a5fa,#34d399,#fbbf24)] bg-[length:200%_100%] animate-[gradient_4s_linear_infinite] text-white',
    ring: 'group-hover:ring-amber-300/80',
    glow: 'group-hover:shadow-amber-400/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(251,191,36,0.65)]',
    icon: '✧'
  },
  'mega hyper rare': {
    badge:
      'bg-[linear-gradient(110deg,#fde047,#fbbf24,#f59e0b,#fde047)] bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] text-amber-950 ring-amber-200/50',
    ring: 'group-hover:ring-amber-300/90',
    glow: 'group-hover:shadow-amber-400/60',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(250,204,21,0.70)]',
    icon: '♛'
  },
  'super shiny rare': {
    badge:
      'bg-[linear-gradient(110deg,#fef9c3,#fbcfe8,#c7d2fe,#a5f3fc,#fef9c3)] bg-[length:200%_100%] animate-[gradient_3s_linear_infinite] text-zinc-900 ring-white/60',
    ring: 'group-hover:ring-pink-200/80',
    glow: 'group-hover:shadow-pink-300/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(244,114,182,0.55)]',
    icon: '✧'
  },
  'secret rare': {
    badge: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950',
    ring: 'group-hover:ring-amber-400/80',
    glow: 'group-hover:shadow-amber-500/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(245,158,11,0.65)]',
    icon: '✧'
  },
  'crown rare': {
    badge: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-amber-950',
    ring: 'group-hover:ring-yellow-400/80',
    glow: 'group-hover:shadow-yellow-500/50',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(234,179,8,0.70)]',
    icon: '♛'
  },
  'shiny rare': {
    badge: 'bg-gradient-to-r from-cyan-300 via-pink-300 to-yellow-300 text-zinc-900',
    ring: 'group-hover:ring-pink-300/70',
    glow: 'group-hover:shadow-pink-400/40',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(244,114,182,0.55)]',
    icon: '✦'
  },
  promo: {
    badge: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    ring: 'group-hover:ring-orange-400/70',
    glow: 'group-hover:shadow-orange-500/40',
    dropShadow: 'group-hover:drop-shadow-[0_14px_30px_rgba(249,115,22,0.60)]',
    icon: '◈'
  }
}

export function getRarityStyle(rarity: string | null | undefined): RarityStyle {
  if (!rarity) return FALLBACK
  return STYLES[rarity.toLowerCase()] ?? FALLBACK
}
