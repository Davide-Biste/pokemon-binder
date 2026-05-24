<template>
  <PkmContainer>
    <div class="mx-auto max-w-6xl px-6 py-6">
      <div v-if="isLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div v-else-if="binder">
        <!-- Header -->
        <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex-1 min-w-0">
            <RouterLink
              :to="`/binders/${binder.id}`"
              class="mb-2 inline-flex cursor-pointer items-center gap-1 text-xs text-white/50 transition hover:text-white"
            >
              {{ t('binderEdit.backToBinder') }}
            </RouterLink>

            <input
              v-model="editName"
              class="block w-full bg-transparent text-3xl font-bold text-white outline-none focus:bg-white/5 focus:px-2 focus:py-1 focus:rounded-lg"
              @blur="persistName"
              @keydown.enter="($event.target as HTMLElement).blur()"
            />
            <input
              v-model="editDescription"
              :placeholder="t('binderEdit.addDescription')"
              class="block w-full bg-transparent text-sm text-white/60 outline-none placeholder:text-white/25 focus:bg-white/5 focus:px-2 focus:py-1 focus:rounded-lg"
              @blur="persistDescription"
              @keydown.enter="($event.target as HTMLElement).blur()"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <div class="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/60 ring-1 ring-white/10">
              <span>{{ t('binderEdit.pageSize') }}</span>
              <input
                v-model.number="editRows"
                type="number"
                min="1"
                max="10"
                class="w-10 bg-transparent text-center text-white outline-none"
                @blur="persistSize"
              />
              <span>×</span>
              <input
                v-model.number="editCols"
                type="number"
                min="1"
                max="10"
                class="w-10 bg-transparent text-center text-white outline-none"
                @blur="persistSize"
              />
            </div>
            <Button variant="outline" size="sm" @click="addPage.mutate()">
              {{ t('binderEdit.addPage') }}
            </Button>
            <Button size="sm" @click="$router.push(`/binders/${binder.id}`)">
              {{ t('binderEdit.done') }}
            </Button>
          </div>
        </header>

        <!-- Cover row -->
        <section
          class="mb-6 flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
        >
          <div
            class="aspect-[5/7] w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-white/10"
          >
            <img
              v-if="binder.coverCard"
              :src="coverUrl(binder.coverCard)"
              :alt="binder.coverCard.card_name"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-white/15">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium uppercase tracking-wider text-white/40">
              {{ t('binderEdit.cover') }}
            </p>
            <p class="truncate text-sm text-white/80">
              {{ binder.coverCard?.card_name ?? t('binderEdit.noCoverSet') }}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            :disabled="totalFilled === 0"
            @click="coverOpen = true"
          >
            {{ binder.coverCard ? t('binderEdit.change') : t('binderEdit.choose') }}
          </Button>
        </section>

        <!-- Page navigator -->
        <div class="mb-5 flex items-center justify-center gap-3">
          <button
            type="button"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="currentPageIdx === 0"
            @click="currentPageIdx--"
          >
            ←
          </button>
          <span class="text-sm font-medium text-white/70">
            {{ t('binderEdit.page', { current: currentPageIdx + 1, total: binder.pages.length }) }}
          </span>
          <button
            type="button"
            class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
            :disabled="currentPageIdx >= binder.pages.length - 1"
            @click="currentPageIdx++"
          >
            →
          </button>
          <button
            v-if="binder.pages.length > 1"
            type="button"
            class="ml-2 cursor-pointer text-xs text-red-400/70 transition hover:text-red-400"
            @click="confirmRemovePage"
          >
            {{ t('binderEdit.deletePage') }}
          </button>
        </div>

        <!-- Grid -->
        <div
          v-if="currentPage"
          class="mx-auto grid gap-3"
          :style="{
            gridTemplateColumns: `repeat(${binder.cols}, minmax(0, 1fr))`,
            maxWidth: `${binder.cols * 180}px`
          }"
        >
          <BinderSlot
            v-for="slotIndex in totalSlots"
            :key="`${currentPage.id}-${slotIndex - 1}`"
            :slot="slotMap.get(slotIndex - 1) ?? null"
            :page-id="currentPage.id"
            :slot-index="slotIndex - 1"
            :is-cover="!!binder.coverCard && slotMap.get(slotIndex - 1)?.card.id === binder.coverCard.id"
            @add="openPicker(slotIndex - 1)"
            @remove="removeSlot(slotIndex - 1)"
            @set-cover="setCoverFromSlot(slotIndex - 1)"
            @set-trade-status="onSetTradeStatus(slotIndex - 1, $event)"
            @drop="onSlotDrop($event, slotIndex - 1)"
          />
        </div>
      </div>

      <div v-else class="py-20 text-center text-white/40">{{ t('binderDetail.notFound') }}</div>
    </div>

    <CardPickerDialog :open="pickerOpen" @close="pickerOpen = false" @pick="onPick" />
    <CoverPickerDialog
      :open="coverOpen"
      :binder="binder"
      @close="coverOpen = false"
      @pick="onPickCover"
      @clear="onClearCover"
    />
  </PkmContainer>
</template>

<script setup lang="ts">
import { computed, ref, toRaw, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import BinderSlot from '@/components/custom/Binder/BinderSlot.vue'
import CardPickerDialog from '@/components/custom/Binder/CardPickerDialog.vue'
import CoverPickerDialog from '@/components/custom/Binder/CoverPickerDialog.vue'
import { Button } from '@/components/ui/button'
import {
  useAddPage,
  useBinder,
  useMoveCard,
  usePlaceCard,
  useRemoveCard,
  useRemovePage,
  useSetTradeStatus,
  useUpdateBinder
} from '@/composables/useBinders'
import { snapshotToTcgCard, toBinderSnapshot } from '@/lib/binder-card'
import { getCardImageUrl, type TcgCard } from '@/api/tcg'
import type { BinderCardSnapshot, TradeStatus } from '@shared/binders'

const { t } = useI18n()
const route = useRoute()
const binderId = computed(() => Number(route.params.id))

const { data: binder, isLoading } = useBinder(binderId)

// Local state for editable fields (form-binding without server round-trips on every keystroke).
const editName = ref('')
const editDescription = ref('')
const editRows = ref(3)
const editCols = ref(3)

watch(
  binder,
  (b) => {
    if (b) {
      editName.value = b.name
      editDescription.value = b.description ?? ''
      editRows.value = b.rows
      editCols.value = b.cols
    }
  },
  { immediate: true }
)

// Reset page navigation when switching between binders.
watch(binderId, () => {
  currentPageIdx.value = 0
})

const currentPageIdx = ref(0)
const currentPage = computed(() => binder.value?.pages[currentPageIdx.value])
const totalSlots = computed(() => (binder.value ? binder.value.rows * binder.value.cols : 0))
const totalFilled = computed(() =>
  binder.value ? binder.value.pages.reduce((acc, p) => acc + p.slots.length, 0) : 0
)

// Index the page's slots by slot_index for O(1) lookup in the template.
const slotMap = computed(() => {
  const m = new Map<number, NonNullable<typeof currentPage.value>['slots'][number]>()
  if (currentPage.value) {
    for (const s of currentPage.value.slots) m.set(s.slotIndex, s)
  }
  return m
})

// Picker dialogs.
const pickerOpen = ref(false)
const pickerSlotIndex = ref<number | null>(null)
const coverOpen = ref(false)

function openPicker(slotIndex: number) {
  pickerSlotIndex.value = slotIndex
  pickerOpen.value = true
}

const placeCard = usePlaceCard(binderId)
const moveCard = useMoveCard(binderId)
const removeCard = useRemoveCard(binderId)
const setTradeStatus = useSetTradeStatus(binderId)
const addPage = useAddPage(binderId)
const removePage = useRemovePage(binderId)
const updateBinder = useUpdateBinder()

function onPick(card: TcgCard) {
  if (!currentPage.value || pickerSlotIndex.value === null) return
  placeCard.mutate({
    pageId: currentPage.value.id,
    slotIndex: pickerSlotIndex.value,
    card: toBinderSnapshot(card)
  })
  pickerOpen.value = false
}

function removeSlot(slotIndex: number) {
  if (!currentPage.value) return
  removeCard.mutate({ pageId: currentPage.value.id, slotIndex })
}

function onSetTradeStatus(slotIndex: number, status: TradeStatus) {
  const slot = slotMap.value.get(slotIndex)
  if (!slot) return
  setTradeStatus.mutate({ slotId: slot.id, status })
}

function onSlotDrop(payload: { fromPageId: number; fromSlotIndex: number }, toSlotIndex: number) {
  if (!currentPage.value) return
  moveCard.mutate({
    fromPageId: payload.fromPageId,
    fromSlotIndex: payload.fromSlotIndex,
    toPageId: currentPage.value.id,
    toSlotIndex
  })
}

function confirmRemovePage() {
  if (!currentPage.value || !binder.value || binder.value.pages.length <= 1) return
  if (!window.confirm(t('binderEdit.deletePageConfirm', { n: currentPageIdx.value + 1 }))) return
  const pageId = currentPage.value.id
  // Adjust local navigation index before the delete fires.
  if (currentPageIdx.value >= binder.value.pages.length - 1) currentPageIdx.value--
  removePage.mutate(pageId)
}

// Field persistence — fire updates only when the value actually changed.
function persistName() {
  if (binder.value && editName.value.trim() && editName.value !== binder.value.name) {
    updateBinder.mutate({ id: binder.value.id, name: editName.value.trim() })
  }
}

function persistDescription() {
  if (binder.value && editDescription.value !== (binder.value.description ?? '')) {
    updateBinder.mutate({ id: binder.value.id, description: editDescription.value })
  }
}

function persistSize() {
  if (!binder.value) return
  const r = Math.max(1, Math.min(10, editRows.value || 1))
  const c = Math.max(1, Math.min(10, editCols.value || 1))
  if (r === binder.value.rows && c === binder.value.cols) return
  updateBinder.mutate({ id: binder.value.id, rows: r, cols: c })
}

// Cover handlers — quick action from a slot, dialog pick, and clear.
// IMPORTANT: we deep-unwrap via `structuredClone(toRaw(card))` before sending
// over IPC. Vue's reactive Proxy occasionally trips up Electron's structured
// clone, leaving the cover_card_data field with a partial/garbled JSON.
function cleanSnapshot(card: BinderCardSnapshot): BinderCardSnapshot {
  return structuredClone(toRaw(card))
}
function setCoverFromSlot(slotIndex: number) {
  if (!binder.value) return
  const card = slotMap.value.get(slotIndex)?.card
  if (card) updateBinder.mutate({ id: binder.value.id, coverCard: cleanSnapshot(card) })
}
function onPickCover(card: BinderCardSnapshot) {
  if (!binder.value) return
  updateBinder.mutate({ id: binder.value.id, coverCard: cleanSnapshot(card) })
  coverOpen.value = false
}
function onClearCover() {
  if (!binder.value) return
  updateBinder.mutate({ id: binder.value.id, coverCard: null })
  coverOpen.value = false
}

function coverUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: 8 })
}
</script>
