<template>
  <PkmContainer>
    <div class="mx-auto max-w-6xl px-6 py-6">
      <div v-if="isLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div v-else-if="friend">
        <!-- Header -->
        <header class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <RouterLink
              to="/friends"
              class="mb-2 inline-flex cursor-pointer items-center gap-1 text-xs text-white/50 transition hover:text-white"
            >
              {{ t('friendBinder.backToFriends') }}
            </RouterLink>
            <h1 class="text-3xl font-bold text-white">
              {{ friend.ownerName
              }}<span class="text-white/40 text-base font-normal">{{
                t('friendBinder.bindersSuffix')
              }}</span>
            </h1>
            <p class="text-xs text-white/40">
              {{
                t('friendBinder.exportedImported', {
                  exported: formatDate(friend.exportedAt),
                  imported: formatDate(friend.importedAt)
                })
              }}
            </p>
          </div>
          <Button @click="$router.push(`/trades/${friend.id}`)">
            {{ t('friendBinder.matchTrades') }}
          </Button>
        </header>

        <!-- Binder picker (only when more than one) -->
        <div
          v-if="friend.payload.binders.length > 1"
          class="mb-6 flex flex-wrap gap-2"
        >
          <button
            v-for="(b, idx) in friend.payload.binders"
            :key="b.id"
            type="button"
            class="cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition"
            :class="
              activeBinderIdx === idx
                ? 'bg-violet-500 text-white ring-violet-400/40'
                : 'bg-white/5 text-white/60 ring-white/10 hover:bg-white/10 hover:text-white'
            "
            @click="setActiveBinder(idx)"
          >
            {{ b.name }}
            <span class="ml-1 text-[10px] opacity-70">
              {{ totalCards(b) }}/{{ b.rows * b.cols * b.pages.length }}
            </span>
          </button>
        </div>

        <div v-if="!activeBinder" class="rounded-2xl border-2 border-dashed border-white/10 py-20 text-center text-white/40">
          {{ t('friendBinder.noBinders') }}
        </div>

        <template v-else>
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
              {{ t('friendBinder.page', { current: currentPageIdx + 1, total: activeBinder.pages.length }) }}
            </span>
            <button
              type="button"
              class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
              :disabled="currentPageIdx >= activeBinder.pages.length - 1"
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
              gridTemplateColumns: `repeat(${activeBinder.cols}, minmax(0, 1fr))`,
              maxWidth: `${activeBinder.cols * 180}px`
            }"
          >
            <div
              v-for="slotIndex in totalSlots"
              :key="`${currentPage.id}-${slotIndex - 1}`"
              class="relative aspect-[5/7] w-full"
            >
              <div
                v-if="slotMap.get(slotIndex - 1)"
                class="relative h-full w-full overflow-hidden rounded-[4%] shadow-lg ring-1 ring-white/5"
              >
                <img
                  :src="imageUrl(slotMap.get(slotIndex - 1)!.card)"
                  :alt="slotMap.get(slotIndex - 1)!.card.card_name"
                  loading="lazy"
                  class="absolute inset-0 h-full w-full object-cover"
                />
                <!-- Trade-status badge -->
                <span
                  v-if="slotMap.get(slotIndex - 1)!.tradeStatus !== 'keep'"
                  :class="[
                    'absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow',
                    slotMap.get(slotIndex - 1)!.tradeStatus === 'for_trade'
                      ? 'bg-emerald-500/90'
                      : 'bg-sky-500/90'
                  ]"
                >
                  {{
                    slotMap.get(slotIndex - 1)!.tradeStatus === 'for_trade'
                      ? t('binderSlot.tradeBadgeForTrade')
                      : t('binderSlot.tradeBadgeDupe')
                  }}
                </span>
              </div>
              <div
                v-else
                class="h-full w-full rounded-[4%] border-2 border-dashed border-white/5 bg-white/[0.01]"
              ></div>
            </div>
          </div>
        </template>
      </div>

      <div v-else class="py-20 text-center text-white/40">{{ t('friendBinder.notFound') }}</div>
    </div>
  </PkmContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import { Button } from '@/components/ui/button'
import { useFriend } from '@/composables/useFriends'
import { snapshotToTcgCard } from '@/lib/binder-card'
import { getCardImageUrl } from '@/api/tcg'
import type { Binder, BinderCardSnapshot } from '@shared/binders'

const { t } = useI18n()
const route = useRoute()
const friendId = computed(() => Number(route.params.id))

const { data: friend, isLoading } = useFriend(friendId)

const activeBinderIdx = ref(0)
const currentPageIdx = ref(0)

// Reset navigation when the friend or binder changes.
watch(friendId, () => {
  activeBinderIdx.value = 0
  currentPageIdx.value = 0
})

const activeBinder = computed<Binder | null>(
  () => friend.value?.payload.binders[activeBinderIdx.value] ?? null
)
const currentPage = computed(() => activeBinder.value?.pages[currentPageIdx.value])
const totalSlots = computed(() =>
  activeBinder.value ? activeBinder.value.rows * activeBinder.value.cols : 0
)

const slotMap = computed(() => {
  const m = new Map<number, NonNullable<typeof currentPage.value>['slots'][number]>()
  if (currentPage.value) {
    for (const s of currentPage.value.slots) m.set(s.slotIndex, s)
  }
  return m
})

function setActiveBinder(idx: number) {
  activeBinderIdx.value = idx
  currentPageIdx.value = 0
}

function totalCards(b: Binder): number {
  return b.pages.reduce((acc, p) => acc + p.slots.length, 0)
}

function imageUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: 8 })
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
