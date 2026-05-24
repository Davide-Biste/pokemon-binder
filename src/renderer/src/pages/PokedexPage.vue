<template>
  <PkmContainer>
    <div class="mx-auto max-w-7xl px-4 py-6">
      <!-- Header + tabs + search -->
      <header class="mb-6 space-y-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white">{{ t('pokedex.title') }}</h1>
            <p class="text-sm text-white/50">{{ t('pokedex.subtitle') }}</p>
          </div>

          <!-- Tab toggle -->
          <div class="inline-flex shrink-0 rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
            <button
              v-for="t in tabs"
              :key="t.value"
              type="button"
              class="cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium transition"
              :class="
                tab === t.value
                  ? 'bg-white text-zinc-900 shadow'
                  : 'text-white/60 hover:text-white'
              "
              @click="tab = t.value"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Search bar -->
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
          </svg>
          <Input
            v-model="search"
            type="text"
            :placeholder="tab === 'pokemon' ? t('pokedex.searchPokemonPlaceholder') : t('pokedex.searchCardsPlaceholder')"
            class="pl-9"
          />
          <button
            v-if="search"
            type="button"
            class="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
            :aria-label="t('pokedex.clearSearch')"
            @click="search = ''"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <!-- Pokémon-only filters -->
        <div v-if="tab === 'pokemon'" class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-[11px] font-medium uppercase tracking-wider text-white/40">
            {{ t('pokedex.gen') }}
          </span>
          <button
            v-for="g in GENERATIONS"
            :key="g.id"
            type="button"
            class="cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition ring-1"
            :class="
              activeGens.has(g.id)
                ? 'bg-red-500/90 text-white ring-red-400/60'
                : 'bg-white/5 text-white/60 ring-white/10 hover:bg-white/10 hover:text-white'
            "
            @click="toggleGen(g.id)"
          >
            {{ g.label }}
          </button>
          <button
            v-if="activeGens.size > 0"
            type="button"
            class="ml-1 cursor-pointer text-xs text-white/40 underline-offset-4 transition hover:text-white hover:underline"
            @click="activeGens = new Set()"
          >
            {{ t('pokedex.reset') }}
          </button>

          <span class="ml-auto text-xs text-white/40">
            {{
              filteredPokemon.length === 1
                ? t('pokedex.resultsOne', { n: filteredPokemon.length })
                : t('pokedex.resultsMany', { n: filteredPokemon.length })
            }}
          </span>
        </div>
      </header>

      <!-- POKÉMON TAB -->
      <section v-if="tab === 'pokemon'">
        <div v-if="pokemonLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

        <div
          v-else-if="filteredPokemon.length > 0"
          class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <PokemonCard
            v-for="pokemon in visibleItems"
            :key="pokemon.id"
            :id="pokemon.id"
            :species-id="pokemon.species_id"
            :number="pokemon.number"
            :name="pokemon.name"
          />
        </div>

        <div v-else class="py-20 text-center text-sm text-white/40">
          {{ t('pokedex.noMatch') }}
        </div>

        <!-- Sentinel: triggers loading more when scrolled into view -->
        <div ref="sentinel" class="h-10" />

        <div v-if="hasMore" class="py-4 text-center text-sm text-white/50">
          {{ t('pokedex.loadingMore') }}
        </div>
      </section>

      <!-- TCG CARDS TAB -->
      <section v-else>
        <div v-if="!canSearchCards" class="py-20 text-center text-sm text-white/40">
          {{ t('pokedex.typeAtLeast') }}
        </div>
        <div v-else-if="tcgLoading" class="py-20 text-center text-sm text-white/40">
          {{ t('pokedex.searching') }}
        </div>
        <div
          v-else-if="tcgCards && tcgCards.length > 0"
          class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
        >
          <TcgCard
            v-for="card in tcgCards"
            :key="card.id"
            :card="card"
            addable
            @add-to-binder="openAddDialog"
          />
        </div>
        <div v-else class="py-20 text-center text-sm text-white/40">
          {{ t('pokedex.noCardsFor', { query: debouncedSearch }) }}
        </div>
      </section>
    </div>

    <AddToBinderDialog
      :open="addOpen"
      :card="pendingCard"
      @close="addOpen = false"
      @added="onAdded"
    />

    <!-- Tiny toast for "added!" feedback -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="toast"
        class="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-zinc-900/95 px-4 py-2 text-xs text-white shadow-2xl ring-1 ring-white/10"
      >
        {{ toast }}
      </div>
    </Transition>
  </PkmContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import PokemonCard from '@/components/custom/PokemonCard/PokemonCard.vue'
import TcgCard from '@/components/custom/TcgCard/TcgCard.vue'
import AddToBinderDialog from '@/components/custom/Binder/AddToBinderDialog.vue'
import { Input } from '@/components/ui/input'
import { usePokemonData } from '@/composables/usePokemonData'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { searchTcgCards, type TcgCard as TcgCardType } from '@/api/tcg'
import type { BinderSummary } from '@shared/binders'

const { t } = useI18n()

// --- Tab + search state -----------------------------------------------------
type Tab = 'pokemon' | 'cards'
// Labels are resolved at render time via computed so they react to locale.
const tabs = computed<{ value: Tab; label: string }[]>(() => [
  { value: 'pokemon', label: t('pokedex.tabPokemon') },
  { value: 'cards', label: t('pokedex.tabCards') }
])
const tab = ref<Tab>('pokemon')
const search = ref('')
const debouncedSearch = ref('')

// Debounce search input to avoid running filters / API calls on every keystroke.
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(search, (v) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = v.trim()
  }, 250)
})

// Reset debounced value immediately on tab switch so we don't show stale results.
watch(tab, () => {
  debouncedSearch.value = search.value.trim()
})

// --- Pokémon tab ------------------------------------------------------------

// Generation cutoffs by National Dex number. Forms (megas/regionals) live above 10000
// and still carry the base species `number`, so the same bucket lookup works for them.
const GENERATIONS = [
  { id: 1, label: 'I', max: 151 },
  { id: 2, label: 'II', max: 251 },
  { id: 3, label: 'III', max: 386 },
  { id: 4, label: 'IV', max: 493 },
  { id: 5, label: 'V', max: 649 },
  { id: 6, label: 'VI', max: 721 },
  { id: 7, label: 'VII', max: 809 },
  { id: 8, label: 'VIII', max: 905 },
  { id: 9, label: 'IX', max: 1025 }
] as const
const GEN_MINS = GENERATIONS.map((_, i) => (i === 0 ? 1 : GENERATIONS[i - 1].max + 1))

function genOf(number: number): number {
  for (let i = 0; i < GENERATIONS.length; i++) {
    if (number >= GEN_MINS[i] && number <= GENERATIONS[i].max) return GENERATIONS[i].id
  }
  return 0
}

const activeGens = ref<Set<number>>(new Set())
function toggleGen(id: number) {
  const next = new Set(activeGens.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  activeGens.value = next
}

const { data: pokemonData, isLoading: pokemonLoading } = usePokemonData()

const filteredPokemon = computed(() => {
  const list = pokemonData.value ?? []
  const q = debouncedSearch.value.toLowerCase()
  const gens = activeGens.value
  if (!q && gens.size === 0) return list
  return list.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q)) return false
    if (gens.size > 0 && !gens.has(genOf(p.number))) return false
    return true
  })
})

const { visibleItems, sentinel, hasMore } = useInfiniteScroll(filteredPokemon, {
  pageSize: 60,
  increment: 60
})

// --- TCG cards tab ----------------------------------------------------------

const canSearchCards = computed(
  () => tab.value === 'cards' && debouncedSearch.value.length >= 2
)

const { data: tcgCards, isLoading: tcgLoading } = useQuery({
  queryKey: ['pokedex-tcg-search', debouncedSearch],
  queryFn: () => searchTcgCards({ search: debouncedSearch.value, limit: 120 }),
  enabled: canSearchCards,
  staleTime: 1000 * 60 * 5
})

// --- Add-to-binder flow -----------------------------------------------------

const addOpen = ref(false)
const pendingCard = ref<TcgCardType | null>(null)
const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function openAddDialog(card: TcgCardType) {
  pendingCard.value = card
  addOpen.value = true
}

function onAdded(payload: { binder: BinderSummary; pageId: number; slotIndex: number }) {
  toast.value = `Added to "${payload.binder.name}"`
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = null), 2200)
}
</script>
