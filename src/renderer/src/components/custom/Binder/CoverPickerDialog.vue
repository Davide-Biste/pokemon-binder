<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-6 backdrop-blur-md"
        @click.self="$emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          appear
        >
          <div
            v-if="open"
            class="relative w-full max-w-3xl rounded-3xl bg-zinc-900/95 p-6 shadow-2xl ring-1 ring-white/10"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-white">{{ t('coverPicker.title') }}</h2>
                <p class="text-xs text-white/40">{{ t('coverPicker.subtitle') }}</p>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white"
                @click="$emit('close')"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <div class="max-h-[60vh] overflow-y-auto">
              <div
                v-if="cards.length > 0"
                class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
              >
                <button
                  v-for="(card, i) in cards"
                  :key="`${card.id}-${i}`"
                  type="button"
                  class="group relative aspect-[5/7] cursor-pointer overflow-hidden rounded-[5%] shadow-md ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-2"
                  :class="
                    currentCoverId === card.id
                      ? 'ring-2 ring-red-400/80'
                      : 'hover:ring-red-400/60'
                  "
                  @click="$emit('pick', card)"
                >
                  <img
                    :src="coverUrl(card)"
                    :alt="card.card_name"
                    loading="lazy"
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    class="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 py-1 text-[10px] font-medium text-white"
                  >
                    {{ card.card_name }} · #{{ card.card_number }}
                  </span>
                  <span
                    v-if="currentCoverId === card.id"
                    class="absolute left-1.5 top-1.5 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow"
                  >
                    {{ t('coverPicker.coverBadge') }}
                  </span>
                </button>
              </div>
              <div v-else class="py-12 text-center text-sm text-white/40">
                {{ t('coverPicker.addCardsFirst') }}
              </div>
            </div>

            <div class="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
              <button
                type="button"
                class="text-xs text-white/40 transition hover:text-red-400"
                :class="currentCoverId ? 'cursor-pointer' : 'cursor-not-allowed opacity-30'"
                :disabled="!currentCoverId"
                @click="$emit('clear')"
              >
                {{ t('coverPicker.removeCover') }}
              </button>
              <Button variant="outline" size="sm" @click="$emit('close')">
                {{ t('common.done') }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Binder, BinderCardSnapshot } from '@shared/binders'
import { Button } from '@/components/ui/button'
import { getCardImageUrl } from '@/api/tcg'
import { snapshotToTcgCard } from '@/lib/binder-card'
import { usePreferredLang } from '@/i18n'

const { t } = useI18n()
const props = defineProps<{ open: boolean; binder: Binder | null | undefined }>()
const emit = defineEmits<{
  close: []
  pick: [card: BinderCardSnapshot]
  clear: []
}>()

// Flatten all cards across pages — order by page, then slot.
const cards = computed<BinderCardSnapshot[]>(() => {
  if (!props.binder) return []
  const out: BinderCardSnapshot[] = []
  for (const page of props.binder.pages) {
    for (const slot of page.slots) out.push(slot.card)
  }
  return out
})

const currentCoverId = computed(() => props.binder?.coverCard?.id ?? null)

const preferredLang = usePreferredLang()
function coverUrl(card: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(card), { preferredLang: preferredLang.value })
}

// ESC + body scroll lock while open.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
watch(
  () => props.open,
  (o) => {
    if (o) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }
)
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>
