<template>
  <PkmContainer>
    <div class="mx-auto max-w-5xl px-4 py-6">
      <!-- Back link -->
      <RouterLink
        to="/pokedex"
        class="mb-6 inline-flex items-center gap-1 text-sm text-white/60 transition hover:text-white"
      >
        {{ t('pokemonDetail.back') }}
      </RouterLink>

      <div v-if="isLoading" class="py-20 text-center text-white/50">{{ t('common.loading') }}</div>

      <div v-else-if="error" class="py-20 text-center text-red-400">
        {{ t('pokemonDetail.couldNotLoad') }}
      </div>

      <div v-else-if="data" class="space-y-6">
        <!-- HERO -->
        <div
          class="relative overflow-hidden rounded-3xl border border-white/10 p-8 shadow-2xl"
          :class="heroGradient"
        >
          <div class="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div class="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

          <div class="relative flex flex-col gap-6 md:flex-row md:items-center">
            <div class="flex h-64 w-full items-center justify-center md:w-64">
              <img
                :src="spriteUrl"
                :alt="data.identifier"
                class="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
                @error="onImageError"
              />
            </div>

            <div class="flex-1 space-y-3 text-white">
              <div class="font-mono text-sm opacity-70">#{{ paddedNumber }}</div>
              <h1 class="text-4xl font-bold capitalize tracking-tight md:text-5xl">
                {{ displayName }}
              </h1>
              <div class="flex flex-wrap gap-2 pt-1">
                <TypeBadge :type="data.type1" />
                <TypeBadge v-if="data.type2" :type="data.type2" />
              </div>
              <div class="flex flex-wrap gap-2 pt-2 text-xs">
                <Tag v-if="data.is_legendary">{{ t('pokemonDetail.tags.legendary') }}</Tag>
                <Tag v-if="data.is_mythical">{{ t('pokemonDetail.tags.mythical') }}</Tag>
                <Tag v-if="data.is_sublegendary">{{ t('pokemonDetail.tags.sublegendary') }}</Tag>
                <Tag v-if="data.is_baby">{{ t('pokemonDetail.tags.baby') }}</Tag>
                <Tag v-if="data.is_paradox">{{ t('pokemonDetail.tags.paradox') }}</Tag>
                <Tag v-if="data.is_ub">{{ t('pokemonDetail.tags.ub') }}</Tag>
                <Tag>{{ t('pokemonDetail.tags.gen', { n: data.gen }) }}</Tag>
              </div>
            </div>
          </div>
        </div>

        <!-- DESCRIPTION -->
        <section v-if="data.description" class="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
          <h2 class="mb-2 text-sm font-semibold uppercase tracking-wider text-white/50">
            {{ t('pokemonDetail.description') }}
          </h2>
          <p class="text-sm leading-relaxed text-white/80">{{ data.description }}</p>
        </section>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- STATS -->
          <section class="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
              {{ t('pokemonDetail.baseStats') }}
            </h2>
            <div class="space-y-3">
              <StatBar v-for="s in stats" :key="s.label" :label="s.label" :value="s.value" />
              <div
                class="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-sm"
              >
                <span class="font-semibold uppercase tracking-wider text-white/60">
                  {{ t('pokemonDetail.total') }}
                </span>
                <span class="font-mono font-bold text-white">{{ statsTotal }}</span>
              </div>
            </div>
          </section>

          <!-- INFO -->
          <section class="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
              {{ t('pokemonDetail.profile') }}
            </h2>
            <dl class="grid grid-cols-2 gap-y-3 text-sm">
              <InfoRow :label="t('pokemonDetail.height')" :value="`${(data.height / 10).toFixed(1)} m`" />
              <InfoRow :label="t('pokemonDetail.weight')" :value="`${(data.weight / 10).toFixed(1)} kg`" />
              <InfoRow :label="t('pokemonDetail.captureRate')" :value="`${data.capture_rate} / 255`" />
              <InfoRow :label="t('pokemonDetail.hatchCounter')" :value="String(data.hatch_counter)" />
              <InfoRow :label="t('pokemonDetail.gender')" :value="genderLabel" />
              <InfoRow :label="t('pokemonDetail.generation')" :value="`${data.gen}`" />
            </dl>
          </section>
        </div>

        <!-- TCG CARDS -->
        <section class="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
          <div class="mb-4 flex items-baseline justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-white/50">
              {{ t('pokemonDetail.tcgCards') }}
            </h2>
            <span v-if="tcgCards && tcgCards.length > 0" class="text-xs text-white/40">
              {{ t('pokemonDetail.showingOf', { visible: visibleTcgCards.length, total: tcgCards.length }) }}
            </span>
          </div>

          <div v-if="tcgLoading" class="py-8 text-center text-sm text-white/50">
            {{ t('pokemonDetail.loadingCards') }}
          </div>
          <div v-else-if="tcgError" class="py-8 text-center text-sm text-red-400">
            {{ t('pokemonDetail.cardsLoadError') }}
          </div>
          <div
            v-else-if="tcgCards && tcgCards.length > 0"
            class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
          >
            <TcgCard
              v-for="card in visibleTcgCards"
              :key="card.id"
              :card="card"
              addable
              @add-to-binder="openAddDialog"
            />
          </div>
          <div v-else class="py-8 text-center text-sm text-white/40">
            {{ t('pokemonDetail.noTcgCards') }}
          </div>

          <!-- Infinite scroll sentinel -->
          <div ref="tcgSentinel" class="h-10" />
          <div v-if="tcgHasMore" class="py-4 text-center text-xs text-white/40">
            {{ t('pokemonDetail.loadingMore') }}
          </div>
        </section>
      </div>
    </div>

    <AddToBinderDialog
      :open="addOpen"
      :card="pendingCard"
      @close="addOpen = false"
      @added="onAdded"
    />

    <!-- Tiny toast — mirrors the pattern in PokedexPage. -->
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
import { computed, ref, watch, h } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import TypeBadge from '@/components/custom/PokemonCard/TypeBadge.vue'
import TcgCard from '@/components/custom/TcgCard/TcgCard.vue'
import AddToBinderDialog from '@/components/custom/Binder/AddToBinderDialog.vue'
import type { BinderSummary } from '@shared/binders'
import type { TcgCard as TcgCardType } from '@/api/tcg'
import { usePokemonDetail } from '@/composables/usePokemonDetail'
import { useTcgCards } from '@/composables/useTcgCards'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { TYPE_COLORS } from '@/lib/pokemon-types'

const { t } = useI18n()
const route = useRoute()
const id = computed(() => Number(route.params.id))

const { data, isLoading, error } = usePokemonDetail(id)

// Search TCG cards by the base species name (strip form suffixes like "-Mega-X").
const tcgSearchName = computed(() => data.value?.identifier?.split('-')[0])
const {
  data: tcgCards,
  isLoading: tcgLoading,
  error: tcgError
} = useTcgCards(tcgSearchName, 200)

// Render only a slice at a time; grow the window as the sentinel enters the viewport.
const tcgList = computed(() => tcgCards.value ?? [])
const {
  visibleItems: visibleTcgCards,
  sentinel: tcgSentinel,
  hasMore: tcgHasMore
} = useInfiniteScroll(tcgList, { pageSize: 8, increment: 8, rootMargin: '600px' })

const fallbackTriggered = ref(false)
watch(id, () => (fallbackTriggered.value = false))

const spriteUrl = computed(() => {
  if (!data.value) return ''
  const sid = data.value.species_id ?? data.value.id
  return fallbackTriggered.value
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${sid}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${sid}.png`
})

function onImageError() {
  fallbackTriggered.value = true
}

const displayName = computed(() => data.value?.identifier?.replace(/-/g, ' ') ?? '')
const paddedNumber = computed(() => String(data.value?.number ?? 0).padStart(3, '0'))

const heroGradient = computed(() => {
  if (!data.value) return 'bg-zinc-800'
  const t1 = TYPE_COLORS[data.value.type1]?.bg ?? 'bg-zinc-700'
  const t2 = data.value.type2 ? TYPE_COLORS[data.value.type2]?.bg : t1
  return `bg-gradient-to-br ${t1.replace('bg-', 'from-')} ${t2!.replace('bg-', 'to-')}`
})

const stats = computed(() => {
  if (!data.value) return []
  return [
    { label: t('pokemonDetail.stats.hp'), value: data.value.HP },
    { label: t('pokemonDetail.stats.atk'), value: data.value.Atk },
    { label: t('pokemonDetail.stats.def'), value: data.value.Def },
    { label: t('pokemonDetail.stats.spa'), value: data.value.SpA },
    { label: t('pokemonDetail.stats.spd'), value: data.value.SpD },
    { label: t('pokemonDetail.stats.spe'), value: data.value.Spe }
  ]
})

const statsTotal = computed(() => stats.value.reduce((acc, s) => acc + s.value, 0))

const genderLabel = computed(() => {
  if (!data.value) return ''
  const r = data.value.gender_rate
  if (r === -1) return t('pokemonDetail.genderless')
  // gender_rate: chance of female out of 8
  const female = (r / 8) * 100
  return `♀ ${female}% / ♂ ${100 - female}%`
})

// Tiny inline subcomponents — kept here to avoid noise in /components.
const Tag = (_: unknown, { slots }: { slots: { default?: () => unknown } }) =>
  h(
    'span',
    {
      class:
        'rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur'
    },
    slots.default?.()
  )

const StatBar = (props: { label: string; value: number }) => {
  const pct = Math.min(100, (props.value / 200) * 100)
  return h('div', { class: 'space-y-1' }, [
    h('div', { class: 'flex items-baseline justify-between text-xs' }, [
      h('span', { class: 'font-semibold uppercase tracking-wider text-white/60' }, props.label),
      h('span', { class: 'font-mono text-white' }, props.value)
    ]),
    h('div', { class: 'h-2 overflow-hidden rounded-full bg-white/5' }, [
      h('div', {
        class: 'h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all',
        style: { width: `${pct}%` }
      })
    ])
  ])
}

// --- Add-to-binder flow (mirrors PokedexPage) ------------------------------
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

const InfoRow = (props: { label: string; value: string }) =>
  h('div', { class: 'col-span-1 flex flex-col' }, [
    h('dt', { class: 'text-xs uppercase tracking-wider text-white/40' }, props.label),
    h('dd', { class: 'font-medium text-white' }, props.value)
  ])
</script>
