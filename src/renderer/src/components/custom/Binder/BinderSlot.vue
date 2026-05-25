<template>
  <div
    class="group relative aspect-[5/7] w-full select-none"
    :draggable="!!slot"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
  >
    <!-- Empty slot: dashed border, "add" affordance -->
    <button
      v-if="!slot"
      type="button"
      class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-[4%] border-2 border-dashed border-white/10 bg-white/[0.02] text-white/30 transition hover:border-red-400/50 hover:bg-red-500/5 hover:text-red-400"
      :class="{ 'border-red-400/70 bg-red-500/10 text-red-300': dragOver }"
      @click="$emit('add')"
    >
      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
      </svg>
    </button>

    <!--
      Filled slot: card image + remove affordance on hover.
      Cliccando la carta si apre il TcgCardDialog (stesso effetto del catalogo).
      Il `cursor-grab` resta come affordance di trascinabilità; click vs drag
      vengono distinti dal browser (click parte solo se non c'è stato
      movimento sufficiente da innescare il drag).
    -->
    <div
      v-else
      class="relative h-full w-full cursor-grab transition-opacity active:cursor-grabbing"
      :class="[
        { 'opacity-40': dragging, 'ring-2 ring-red-400/80 rounded-[4%]': dragOver }
      ]"
      @click="onCardClick"
    >
      <TcgCardThumb
        :src="broken ? null : imageUrl"
        :alt="slot.card.card_name"
        :rarity="slot.card.card_rarity"
        :supertype="slot.card.card_type"
        :number="slot.card.card_number"
        class="absolute inset-0"
        @error="onImageError"
      />

      <!-- Persistent cover badge -->
      <span
        v-if="isCover"
        class="absolute left-1.5 top-1.5 z-10 flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow"
      >
        <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
        </svg>
        {{ t('binderSlot.coverBadge') }}
      </span>

      <!-- Persistent trade-status badge — shown when not 'keep'.
           Hidden on hover so the picker pills below can take the space. -->
      <span
        v-if="slot.tradeStatus !== 'keep'"
        :class="[
          'absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow transition group-hover:opacity-0',
          slot.tradeStatus === 'for_trade' ? 'bg-emerald-500/90' : 'bg-sky-500/90'
        ]"
      >
        {{
          slot.tradeStatus === 'for_trade'
            ? t('binderSlot.tradeBadgeForTrade')
            : t('binderSlot.tradeBadgeDupe')
        }}
      </span>

      <!-- Hover actions: set-as-cover (only if not already) + remove -->
      <div class="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          v-if="!isCover"
          type="button"
          class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white/80 ring-1 ring-white/20 backdrop-blur transition hover:bg-yellow-400 hover:text-zinc-900"
          :aria-label="t('binderSlot.setAsCover')"
          :title="t('binderSlot.setAsCover')"
          @click.stop="$emit('set-cover')"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 21 12 16.5 5.8 21l2.39-7.14L2 9.36h7.61z" />
          </svg>
        </button>
        <button
          type="button"
          class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white/80 ring-1 ring-white/20 backdrop-blur transition hover:bg-red-500 hover:text-white"
          :aria-label="t('binderSlot.removeCard')"
          @click.stop="$emit('remove')"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      </div>

      <!-- Hover trade-status picker — three pills along the bottom of the card. -->
      <div
        class="absolute inset-x-1.5 bottom-1.5 z-10 flex items-center justify-center gap-1 opacity-0 transition group-hover:opacity-100"
      >
        <button
          v-for="opt in tradeOptions"
          :key="opt.value"
          type="button"
          :title="opt.title"
          :class="[
            'flex h-6 min-w-[26px] cursor-pointer items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ring-1 backdrop-blur transition',
            slot.tradeStatus === opt.value
              ? `${opt.activeBg} text-white ring-white/20`
              : 'bg-black/70 text-white/70 ring-white/15 hover:bg-white/15 hover:text-white'
          ]"
          @click.stop="$emit('set-trade-status', opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Dialog di zoom della carta — stesso usato dal catalogo / ricerca. -->
    <TcgCardDialog
      v-if="dialogCard"
      :card="dialogCard"
      :open="dialogOpen"
      @close="dialogOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BinderSlot, TradeStatus } from '@shared/binders'
import { getCardImageUrls } from '@/api/tcg'
import { snapshotToTcgCard } from '@/lib/binder-card'
import { usePreferredLang } from '@/i18n'
import TcgCardThumb from '@/components/custom/TcgCard/TcgCardThumb.vue'
import TcgCardDialog from '@/components/custom/TcgCard/TcgCardDialog.vue'

const { t } = useI18n()

// Picker pill metadata — computed so titles update on locale switch.
// Labels stay as glyphs/emoji because they're language-agnostic; tooltips
// carry the localized meaning.
const tradeOptions = computed<
  ReadonlyArray<{ value: TradeStatus; label: string; title: string; activeBg: string }>
>(() => [
  { value: 'keep', label: 'K', title: t('binderSlot.keepTitle'), activeBg: 'bg-zinc-700' },
  { value: 'for_trade', label: '🔁', title: t('binderSlot.forTradeTitle'), activeBg: 'bg-emerald-500' },
  { value: 'dupe', label: '📚', title: t('binderSlot.dupeTitle'), activeBg: 'bg-sky-500' }
])

const props = withDefaults(
  defineProps<{
    slot: BinderSlot | null
    pageId: number
    slotIndex: number
    /** Marks this card as the binder's current cover (shows a badge, hides set-cover action). */
    isCover?: boolean
  }>(),
  { isCover: false }
)

const emit = defineEmits<{
  add: []
  remove: []
  'set-cover': []
  'set-trade-status': [status: TradeStatus]
  /** Fires when the user drops a card from another slot onto this one. */
  drop: [payload: { fromPageId: number; fromSlotIndex: number }]
}>()

const dragging = ref(false)
const dragOver = ref(false)
const broken = ref(false)
const urlIndex = ref(0)
const dialogOpen = ref(false)

const preferredLang = usePreferredLang()
const urlCandidates = computed(() =>
  props.slot
    ? getCardImageUrls(snapshotToTcgCard(props.slot.card), {
        preferredLang: preferredLang.value
      })
    : []
)
const imageUrl = computed(() => urlCandidates.value[urlIndex.value])

/** TcgCard hydrated from the binder snapshot; il dialog si aspetta una
 * TcgCard piena, non lo `BinderCardSnapshot` slim che abbiamo nei binder. */
const dialogCard = computed(() =>
  props.slot ? snapshotToTcgCard(props.slot.card) : null
)

function onImageError() {
  if (urlIndex.value < urlCandidates.value.length - 1) urlIndex.value++
  else broken.value = true
}

/**
 * Click sulla carta → apre il dialog di zoom. I bottoni interni (set-cover,
 * remove, trade pills) usano `@click.stop` quindi non bubble qui.
 *
 * `dragging` distingue il caso click-puro dal drag-then-release: durante un
 * drag il browser sopprime il click di fine, quindi qui arriviamo solo se
 * davvero è stato un click "fermo".
 */
function onCardClick() {
  if (dragging.value) return
  dialogOpen.value = true
}

const DRAG_MIME = 'application/x-binder-slot'

function onDragStart(e: DragEvent) {
  if (!props.slot || !e.dataTransfer) return
  dragging.value = true
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData(
    DRAG_MIME,
    JSON.stringify({ fromPageId: props.pageId, fromSlotIndex: props.slotIndex })
  )
}

function onDragEnd() {
  dragging.value = false
}

function onDragOver(e: DragEvent) {
  if (!e.dataTransfer?.types.includes(DRAG_MIME)) return
  e.dataTransfer.dropEffect = 'move'
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  const raw = e.dataTransfer?.getData(DRAG_MIME)
  if (!raw) return
  try {
    const payload = JSON.parse(raw) as { fromPageId: number; fromSlotIndex: number }
    if (payload.fromPageId === props.pageId && payload.fromSlotIndex === props.slotIndex) return
    emit('drop', payload)
  } catch {
    /* ignore malformed drag payload */
  }
}
</script>
