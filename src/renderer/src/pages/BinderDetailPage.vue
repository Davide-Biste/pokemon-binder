<template>
  <PkmContainer>
    <div class="mx-auto max-w-6xl px-6 py-6">
      <div v-if="isLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div v-else-if="binder">
        <!-- Back link -->
        <RouterLink
          to="/binders"
          class="mb-4 inline-flex cursor-pointer items-center gap-1 text-xs text-white/50 transition hover:text-white"
        >
          {{ t('binderDetail.backToBinders') }}
        </RouterLink>

        <!-- Hero: small cover thumb + meta, sitting on one row.
             When there is no cover we skip the placeholder so the title block
             takes the full width — the empty black box was the worst case. -->
        <header class="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div
            v-if="binder.coverCard"
            class="aspect-5/7 w-20 shrink-0 overflow-hidden rounded-xs bg-transparent shadow-lg ring-1 ring-white/10 sm:w-24"
          >
            <img
              :src="coverUrl(binder.coverCard)"
              :alt="binder.coverCard.card_name"
              class="h-full w-full object-cover"
            />
          </div>

          <div class="min-w-0 flex-1">
            <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
              {{ t('binderDetail.binderLabel') }}
            </p>
            <h1 class="truncate text-2xl font-bold text-white sm:text-3xl">{{ binder.name }}</h1>
            <p v-if="binder.description" class="mt-1.5 max-w-2xl text-sm text-white/60">
              {{ binder.description }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
              <span>{{ t('binderDetail.perPage', { rows: binder.rows, cols: binder.cols }) }}</span>
              <span>·</span>
              <span>
                {{ binder.pages.length }}
                {{ binder.pages.length === 1 ? t('binders.page') : t('binders.pages') }}
              </span>
              <span>·</span>
              <span>{{ t('binderDetail.slotsFilled', { filled: filledCount, total: totalSlots }) }}</span>
            </div>
          </div>

          <div class="shrink-0">
            <Button @click="$router.push(`/binders/${binder.id}/edit`)">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {{ t('binderDetail.editBinder') }}
            </Button>
          </div>
        </header>

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
        </div>

        <!-- Read-only grid -->
        <div
          v-if="currentPage"
          class="mx-auto grid gap-3"
          :style="{
            gridTemplateColumns: `repeat(${binder.cols}, minmax(0, 1fr))`,
            maxWidth: `${binder.cols * 180}px`
          }"
        >
          <div
            v-for="slotIndex in totalPageSlots"
            :key="`${currentPage.id}-${slotIndex - 1}`"
            class="aspect-[5/7] w-full"
          >
            <!--
              Click sulla carta → apre il dialog di zoom (stesso del catalogo).
              Holo effect ereditato da TcgCardThumb in base alla rarità.
            -->
            <div
              v-if="slotMap.get(slotIndex - 1)"
              class="relative h-full w-full cursor-zoom-in"
              @click="openDialog(slotMap.get(slotIndex - 1)!.card)"
            >
              <TcgCardThumb
                :src="cardUrl(slotMap.get(slotIndex - 1)!.card)"
                :alt="slotMap.get(slotIndex - 1)!.card.card_name"
                :rarity="slotMap.get(slotIndex - 1)!.card.card_rarity"
                :supertype="slotMap.get(slotIndex - 1)!.card.card_type"
                :number="slotMap.get(slotIndex - 1)!.card.card_number"
                class="absolute inset-0"
              />
            </div>
            <div
              v-else
              class="h-full w-full rounded-[4%] border border-dashed border-white/10 bg-white/[0.015]"
            />
          </div>
        </div>
      </div>

      <div v-else class="py-20 text-center text-white/40">{{ t('binderDetail.notFound') }}</div>
    </div>

    <!-- Card zoom dialog (stesso del catalogo). -->
    <TcgCardDialog
      v-if="dialogCard"
      :card="dialogCard"
      :open="dialogOpen"
      @close="dialogOpen = false"
    />
  </PkmContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import { Button } from '@/components/ui/button'
import { useBinder } from '@/composables/useBinders'
import { getCardImageUrl, type TcgCard } from '@/api/tcg'
import { snapshotToTcgCard } from '@/lib/binder-card'
import { usePreferredLang } from '@/i18n'
import TcgCardThumb from '@/components/custom/TcgCard/TcgCardThumb.vue'
import TcgCardDialog from '@/components/custom/TcgCard/TcgCardDialog.vue'
import type { BinderCardSnapshot } from '@shared/binders'

const { t } = useI18n()
const route = useRoute()
const binderId = computed(() => Number(route.params.id))
const { data: binder, isLoading } = useBinder(binderId)

const currentPageIdx = ref(0)
// Reset page navigation when switching between binders.
watch(binderId, () => {
  currentPageIdx.value = 0
})

const currentPage = computed(() => binder.value?.pages[currentPageIdx.value])
const totalPageSlots = computed(() =>
  binder.value ? binder.value.rows * binder.value.cols : 0
)
const totalSlots = computed(() =>
  binder.value ? binder.value.rows * binder.value.cols * binder.value.pages.length : 0
)
const filledCount = computed(() =>
  binder.value
    ? binder.value.pages.reduce((acc, p) => acc + p.slots.length, 0)
    : 0
)

// Index the current page's slots by slot_index for O(1) lookup in the template.
const slotMap = computed(() => {
  const m = new Map<number, NonNullable<typeof currentPage.value>['slots'][number]>()
  if (currentPage.value) {
    for (const s of currentPage.value.slots) m.set(s.slotIndex, s)
  }
  return m
})

// Reactive: cambia automaticamente quando l'utente cambia lingua app.
const preferredLang = usePreferredLang()
function coverUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: preferredLang.value })
}
const cardUrl = coverUrl

/** Card zoom dialog state — idratiamo lo snapshot a TcgCard on click. */
const dialogOpen = ref(false)
const dialogCard = ref<TcgCard | null>(null)
function openDialog(snap: BinderCardSnapshot) {
  dialogCard.value = snapshotToTcgCard(snap)
  dialogOpen.value = true
}
</script>
