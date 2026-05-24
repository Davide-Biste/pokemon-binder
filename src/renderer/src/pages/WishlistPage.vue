<template>
  <PkmContainer>
    <div class="mx-auto max-w-6xl px-6 py-8">
      <header class="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ t('wishlist.title') }}</h1>
          <p class="text-sm text-white/50">{{ t('wishlist.subtitle') }}</p>
        </div>
        <Button @click="pickerOpen = true">{{ t('wishlist.addCard') }}</Button>
      </header>

      <div v-if="isLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div
        v-else-if="data && data.length > 0"
        class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        <div
          v-for="item in data"
          :key="item.id"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-3 transition hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-400/10"
        >
          <div class="aspect-[5/7] w-full overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-white/5">
            <img
              :src="imageUrl(item.card)"
              :alt="item.card.card_name"
              loading="lazy"
              class="h-full w-full object-cover"
            />
          </div>
          <p class="mt-2 truncate text-sm font-medium text-white">{{ item.card.card_name }}</p>
          <p class="truncate text-xs text-white/40">#{{ item.card.card_number }}</p>
          <input
            v-model="noteDraft[item.id]"
            :placeholder="t('wishlist.addNotePlaceholder')"
            class="mt-2 w-full rounded-md bg-white/5 px-2 py-1 text-xs text-white/80 outline-none ring-1 ring-white/10 placeholder:text-white/25 focus:ring-yellow-400/60"
            @blur="persistNote(item.id, item.note)"
            @keydown.enter="($event.target as HTMLElement).blur()"
          />

          <button
            type="button"
            class="absolute right-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white/70 opacity-0 backdrop-blur transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
            :aria-label="t('wishlist.removeTooltip')"
            @click="remove.mutate(item.id)"
          >
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border-2 border-dashed border-white/10 py-20 text-center"
      >
        <p class="text-lg text-white/40">{{ t('wishlist.empty') }}</p>
        <p class="mt-1 text-sm text-white/30">{{ t('wishlist.emptyHint') }}</p>
        <Button class="mt-4" @click="pickerOpen = true">{{ t('wishlist.addCard') }}</Button>
      </div>
    </div>

    <CardPickerDialog :open="pickerOpen" @close="pickerOpen = false" @pick="onPick" />
  </PkmContainer>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import CardPickerDialog from '@/components/custom/Binder/CardPickerDialog.vue'
import { Button } from '@/components/ui/button'
import {
  useAddWishlist,
  useRemoveWishlist,
  useUpdateWishlistNote,
  useWishlist
} from '@/composables/useWishlist'
import { snapshotToTcgCard, toBinderSnapshot } from '@/lib/binder-card'
import { getCardImageUrl, type TcgCard } from '@/api/tcg'
import type { BinderCardSnapshot } from '@shared/binders'

const { t } = useI18n()
const { data, isLoading } = useWishlist()
const add = useAddWishlist()
const remove = useRemoveWishlist()
const updateNote = useUpdateWishlistNote()

const pickerOpen = ref(false)

/** Per-item draft for the inline note input, keyed by wishlist id. */
const noteDraft = reactive<Record<number, string>>({})

// Hydrate the draft map from the server data so inputs render with the saved value.
watch(
  data,
  (items) => {
    if (!items) return
    for (const item of items) {
      if (noteDraft[item.id] === undefined) noteDraft[item.id] = item.note ?? ''
    }
  },
  { immediate: true }
)

function imageUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: 8 })
}

function onPick(card: TcgCard) {
  add.mutate({ card: toBinderSnapshot(card) })
  pickerOpen.value = false
}

function persistNote(id: number, currentSaved: string | null) {
  const next = noteDraft[id]?.trim() || null
  if (next !== (currentSaved ?? null)) {
    updateNote.mutate({ id, note: next })
  }
}
</script>
