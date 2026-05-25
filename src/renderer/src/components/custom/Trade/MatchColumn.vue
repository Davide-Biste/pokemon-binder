<template>
  <div class="rounded-2xl border border-white/10 bg-zinc-900/40 p-4">
    <header class="mb-3 flex items-baseline justify-between">
      <h2 :class="['text-sm font-semibold uppercase tracking-wider', titleClass]">
        {{ title }}
      </h2>
      <span class="text-xs text-white/40">{{ entries.length }} {{ t('trades.cards') }}</span>
    </header>

    <div
      v-if="entries.length === 0"
      class="rounded-xl border-2 border-dashed border-white/5 py-10 text-center text-sm text-white/30"
    >
      {{ emptyText }}
    </div>

    <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <li
        v-for="entry in entries"
        :key="entry.card.id"
        class="overflow-hidden rounded-xl bg-zinc-900/60 p-2 ring-1 ring-white/5 transition hover:ring-white/15"
      >
        <div class="relative aspect-[5/7] w-full overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-white/5">
          <img
            :src="imageUrl(entry.card)"
            :alt="entry.card.card_name"
            loading="lazy"
            class="absolute inset-0 h-full w-full object-cover"
          />
          <span
            v-if="entry.available > 1"
            class="absolute right-1.5 top-1.5 rounded-full bg-black/80 px-1.5 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/15"
          >
            ×{{ entry.available }}
          </span>
        </div>
        <p class="mt-2 truncate text-xs font-medium text-white">{{ entry.card.card_name }}</p>
        <p class="truncate text-[10px] text-white/40">
          #{{ entry.card.card_number }} ·
          {{ entry.offers[0].binderName }}
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { snapshotToTcgCard } from '@/lib/binder-card'

const { t } = useI18n()
import { getCardImageUrl } from '@/api/tcg'
import { usePreferredLang } from '@/i18n'
import type { BinderCardSnapshot } from '@shared/binders'
import type { TradeMatchEntry } from '@/lib/trade-match'

const props = withDefaults(
  defineProps<{
    title: string
    emptyText: string
    entries: TradeMatchEntry[]
    tint?: 'emerald' | 'violet'
  }>(),
  { tint: 'emerald' }
)

const titleClass = computed(() =>
  props.tint === 'violet' ? 'text-violet-300' : 'text-emerald-300'
)

const preferredLang = usePreferredLang()
function imageUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: preferredLang.value })
}
</script>
