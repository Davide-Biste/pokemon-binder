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
            class="relative w-full max-w-md rounded-3xl bg-zinc-900/95 p-6 shadow-2xl ring-1 ring-white/10"
          >
            <div class="mb-4 flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="text-lg font-semibold text-white">{{ t('addToBinder.title') }}</h2>
                <p v-if="card" class="mt-0.5 truncate text-xs text-white/50">
                  {{ card.card_name }} · #{{ card.card_number }}
                </p>
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

            <div v-if="bindersLoading" class="py-12 text-center text-sm text-white/40">
              {{ t('addToBinder.loading') }}
            </div>

            <div v-else-if="!binders || binders.length === 0" class="py-10 text-center">
              <p class="text-sm text-white/50">{{ t('addToBinder.none') }}</p>
              <RouterLink
                to="/binders"
                class="mt-3 inline-block cursor-pointer text-sm text-red-400 underline-offset-4 transition hover:text-red-300 hover:underline"
                @click="$emit('close')"
              >
                {{ t('addToBinder.createOne') }}
              </RouterLink>
            </div>

            <ul v-else class="max-h-[60vh] space-y-1.5 overflow-y-auto">
              <li v-for="b in binders" :key="b.id">
                <button
                  type="button"
                  class="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition"
                  :class="
                    isFull(b)
                      ? 'cursor-not-allowed opacity-40'
                      : 'cursor-pointer hover:border-red-400/40 hover:bg-red-500/5'
                  "
                  :disabled="isFull(b) || busyId === b.id"
                  @click="onPick(b)"
                >
                  <!-- Cover thumb -->
                  <div
                    class="aspect-[5/7] w-9 shrink-0 overflow-hidden rounded-md bg-zinc-950 ring-1 ring-white/10"
                  >
                    <img
                      v-if="b.coverCard"
                      :src="coverUrl(b.coverCard)"
                      :alt="b.coverCard.card_name"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-white">{{ b.name }}</p>
                    <p class="truncate text-[11px] text-white/45">
                      {{ t('addToBinder.cardsTotal', { count: b.cardCount, total: totalSlots(b) }) }}
                      <span class="opacity-60">
                        {{
                          b.pageCount === 1
                            ? t('addToBinder.pageOne', { n: b.pageCount })
                            : t('addToBinder.pageMany', { n: b.pageCount })
                        }}
                      </span>
                    </p>
                  </div>

                  <span
                    v-if="isFull(b)"
                    class="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50"
                  >
                    {{ t('addToBinder.full') }}
                  </span>
                  <svg
                    v-else-if="busyId === b.id"
                    class="h-4 w-4 animate-spin text-white/70"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="20" />
                  </svg>
                  <svg
                    v-else
                    class="h-4 w-4 text-white/30 transition group-hover:translate-x-0.5 group-hover:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            </ul>

            <p
              v-if="errorMessage"
              class="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 ring-1 ring-red-500/30"
            >
              {{ errorMessage }}
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQueryClient } from '@tanstack/vue-query'
import { useBinders } from '@/composables/useBinders'
import { findFirstEmptySlot } from '@/lib/binder-helpers'
import { getCardImageUrl, type TcgCard } from '@/api/tcg'
import { snapshotToTcgCard, toBinderSnapshot } from '@/lib/binder-card'
import { usePreferredLang } from '@/i18n'
import type { BinderCardSnapshot, BinderSummary } from '@shared/binders'

const { t } = useI18n()
const props = defineProps<{ open: boolean; card: TcgCard | null }>()
const emit = defineEmits<{
  close: []
  /** Fired after a successful place. Lets the parent show a toast / advance UI. */
  added: [payload: { binder: BinderSummary; pageId: number; slotIndex: number }]
}>()

const { data: binders, isLoading: bindersLoading } = useBinders()
const qc = useQueryClient()

const busyId = ref<number | null>(null)
const errorMessage = ref<string | null>(null)

function totalSlots(b: BinderSummary): number {
  return b.rows * b.cols * b.pageCount
}
function isFull(b: BinderSummary): boolean {
  return b.cardCount >= totalSlots(b)
}
const preferredLang = usePreferredLang()
function coverUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: preferredLang.value })
}

async function onPick(b: BinderSummary) {
  if (!props.card || busyId.value !== null) return
  errorMessage.value = null
  busyId.value = b.id
  try {
    // Fetch the full binder fresh so we don't race a stale cache for slot occupancy.
    const full = await window.api.binders.get(b.id)
    if (!full) throw new Error(t('addToBinder.notFound'))
    const target = findFirstEmptySlot(full)
    if (!target) {
      errorMessage.value = t('addToBinder.binderFull')
      return
    }
    await window.api.binders.placeCard({
      pageId: target.pageId,
      slotIndex: target.slotIndex,
      card: toBinderSnapshot(props.card)
    })
    // Refresh caches so other views reflect the new card immediately.
    qc.invalidateQueries({ queryKey: ['binders'] })
    qc.invalidateQueries({ queryKey: ['binder', b.id] })
    emit('added', { binder: b, pageId: target.pageId, slotIndex: target.slotIndex })
    emit('close')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : t('addToBinder.addFailed')
  } finally {
    busyId.value = null
  }
}

// ESC + body scroll lock + state reset on open/close.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
watch(
  () => props.open,
  (o) => {
    if (o) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
      errorMessage.value = null
      busyId.value = null
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
