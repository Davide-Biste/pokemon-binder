<template>
  <PkmContainer>
    <div class="mx-auto max-w-7xl px-6 py-8">
      <!-- Hero: greeting + primary actions -->
      <header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0 flex-1">
          <p class="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
            {{ greetingPrefix }}
          </p>
          <h1 class="text-3xl font-bold text-white sm:text-4xl">
            <span v-if="!editingName" class="inline-flex items-baseline gap-2">
              {{ displayName }}
              <button
                type="button"
                class="cursor-pointer text-xs font-normal text-white/35 transition hover:text-white"
                :title="ownerName ? t('dashboard.editNameTooltip') : t('dashboard.setNameTooltip')"
                @click="startEditName"
              >
                ✎
              </button>
            </span>
            <input
              v-else
              ref="nameInput"
              v-model="nameDraft"
              type="text"
              class="w-full bg-transparent text-3xl font-bold text-white outline-none focus:bg-white/5 focus:rounded-lg focus:px-2 focus:py-1 sm:text-4xl"
              :placeholder="t('dashboard.yourNamePlaceholder')"
              @blur="saveName"
              @keydown.enter="($event.target as HTMLElement).blur()"
              @keydown.escape="cancelEditName"
            />
          </h1>
          <p v-if="!ownerName && !editingName" class="mt-1 text-sm text-white/40">
            {{ t('dashboard.setNameHint') }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" @click="exportOpen = true">
            {{ t('dashboard.exportProfile') }}
          </Button>
          <Button @click="newBinderOpen = true">{{ t('dashboard.newBinder') }}</Button>
        </div>
      </header>

      <!-- Stats row -->
      <section class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DashStat
          :value="totalCards"
          :label="t('dashboard.stats.cards')"
          tint="white"
          :loading="loadingProfile"
        />
        <DashStat
          :value="binderCount"
          :label="t('dashboard.stats.binders')"
          tint="white"
          :loading="loadingProfile"
        />
        <DashStat
          :value="wishlistCount"
          :label="t('dashboard.stats.wishlist')"
          tint="yellow"
          :loading="loadingProfile"
        />
        <DashStat
          :value="tradablesCount"
          :label="t('dashboard.stats.tradables')"
          tint="emerald"
          :loading="loadingProfile"
        />
      </section>

      <!-- Trade radar — the killer section -->
      <section class="mb-8 rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
        <header class="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider text-violet-300">
              {{ t('dashboard.radar.title') }}
            </h2>
            <p class="text-xs text-white/40">{{ t('dashboard.radar.subtitle') }}</p>
          </div>
          <RouterLink
            v-if="radar && radar.length > 0"
            to="/trades"
            class="cursor-pointer text-xs text-white/50 transition hover:text-white"
          >
            {{ t('dashboard.radar.openMatcher') }}
          </RouterLink>
        </header>

        <div v-if="loadingRadar" class="py-12 text-center text-sm text-white/40">
          {{ t('dashboard.radar.computing') }}
        </div>

        <div
          v-else-if="!friendsFull || friendsFull.length === 0"
          class="rounded-xl border-2 border-dashed border-white/10 py-12 text-center"
        >
          <p class="text-sm text-white/40">{{ t('dashboard.radar.noFriends') }}</p>
          <i18n-t
            keypath="dashboard.radar.noFriendsHint"
            tag="p"
            class="mt-1 text-xs text-white/30"
          >
            <template #file>
              <code class="rounded bg-white/10 px-1 py-0.5">.pkbinder.json</code>
            </template>
          </i18n-t>
        </div>

        <ul v-else class="divide-y divide-white/5">
          <li v-for="row in radar" :key="row.friendId">
            <RouterLink
              :to="`/trades/${row.friendId}`"
              class="group flex items-center gap-4 py-3 transition hover:bg-white/[0.02]"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200 ring-1 ring-violet-400/30"
              >
                {{ initials(row.ownerName) }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-white">{{ row.ownerName }}</p>
                <p class="text-xs text-white/45">
                  <span class="text-emerald-300">{{ row.theyOfferIWantCount }}</span>
                  {{ t('dashboard.radar.cardsYouWant') }} ·
                  <span class="text-violet-300">{{ row.iOfferTheyWantCount }}</span>
                  {{ t('dashboard.radar.cardsTheyWant') }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-3">
                <FairnessBadge :score="row.fairnessScore" />
                <span class="text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60">
                  →
                </span>
              </div>
            </RouterLink>
          </li>
        </ul>
      </section>

      <!-- Two-column bottom: recent binders | recent wishlist -->
      <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Recent binders -->
        <div class="lg:col-span-2 rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
          <header class="mb-4 flex items-baseline justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-white/70">
              {{ t('dashboard.recentBinders') }}
            </h2>
            <RouterLink to="/binders" class="cursor-pointer text-xs text-white/50 transition hover:text-white">
              {{ t('common.seeAll') }}
            </RouterLink>
          </header>

          <div v-if="loadingBinders" class="py-8 text-center text-sm text-white/40">
            {{ t('common.loading') }}
          </div>
          <div
            v-else-if="recentBinders.length === 0"
            class="rounded-xl border-2 border-dashed border-white/10 py-8 text-center text-sm text-white/40"
          >
            {{ t('dashboard.noBinders') }}
          </div>
          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <RouterLink
              v-for="b in recentBinders"
              :key="b.id"
              :to="`/binders/${b.id}`"
              class="group cursor-pointer rounded-xl bg-zinc-900/60 p-2 ring-1 ring-white/5 transition hover:ring-white/15"
            >
              <div class="aspect-[5/7] w-full overflow-hidden rounded-lg bg-zinc-950 ring-1 ring-white/5">
                <img
                  v-if="b.coverCard"
                  :src="coverUrl(b.coverCard)"
                  :alt="b.coverCard.card_name"
                  loading="lazy"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full w-full items-center justify-center text-white/10">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
                  </svg>
                </div>
              </div>
              <p class="mt-2 truncate text-xs font-medium text-white">{{ b.name }}</p>
              <p class="text-[10px] text-white/40">{{ b.cardCount }} {{ t('dashboard.cards') }}</p>
            </RouterLink>
          </div>
        </div>

        <!-- Recent wishlist -->
        <div class="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">
          <header class="mb-4 flex items-baseline justify-between">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-white/70">
              {{ t('dashboard.recentWishlist') }}
            </h2>
            <RouterLink to="/wishlist" class="cursor-pointer text-xs text-white/50 transition hover:text-white">
              {{ t('common.seeAll') }}
            </RouterLink>
          </header>

          <div v-if="loadingWishlist" class="py-8 text-center text-sm text-white/40">
            {{ t('common.loading') }}
          </div>
          <div
            v-else-if="recentWishlist.length === 0"
            class="rounded-xl border-2 border-dashed border-white/10 py-8 text-center text-sm text-white/40"
          >
            {{ t('dashboard.nothingOnHunt') }}
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="item in recentWishlist"
              :key="item.id"
              class="flex items-center gap-3 rounded-lg bg-white/[0.02] p-2 ring-1 ring-white/5"
            >
              <div class="aspect-[5/7] h-12 shrink-0 overflow-hidden rounded-md bg-zinc-950 ring-1 ring-white/5">
                <img
                  :src="coverUrl(item.card)"
                  :alt="item.card.card_name"
                  loading="lazy"
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs font-medium text-white">{{ item.card.card_name }}</p>
                <p class="truncate text-[10px] text-white/40">#{{ item.card.card_number }}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <CreateBinderDialog
      :open="newBinderOpen"
      @close="newBinderOpen = false"
      @created="onBinderCreated"
    />
    <ExportProfileDialog :open="exportOpen" @close="exportOpen = false" />
  </PkmContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import { Button } from '@/components/ui/button'
import CreateBinderDialog from '@/components/custom/Binder/CreateBinderDialog.vue'
import ExportProfileDialog from '@/components/custom/ExportProfileDialog.vue'
import DashStat from '@/components/custom/Dashboard/DashStat.vue'
import FairnessBadge from '@/components/custom/Dashboard/FairnessBadge.vue'
import { useBinders } from '@/composables/useBinders'
import { useWishlist } from '@/composables/useWishlist'
import { useFriendsFull } from '@/composables/useFriends'
import { useOwnerName, useOwnerProfile, useSetOwnerName } from '@/composables/useProfile'
import { snapshotToTcgCard } from '@/lib/binder-card'
import { getCardImageUrl } from '@/api/tcg'
import { computeTradeRadar } from '@/lib/trade-match'
import type { Binder, BinderCardSnapshot } from '@shared/binders'

const router = useRouter()
const { t } = useI18n()

const { data: ownerName } = useOwnerName()
const setOwnerName = useSetOwnerName()
const { data: ownerProfile, isLoading: loadingProfile } = useOwnerProfile()
const { data: binders, isLoading: loadingBinders } = useBinders()
const { data: wishlist, isLoading: loadingWishlist } = useWishlist()
const { data: friendsFull, isLoading: loadingRadar } = useFriendsFull()

const greetingPrefix = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return t('dashboard.greetingNight')
  if (h < 12) return t('dashboard.greetingMorning')
  if (h < 18) return t('dashboard.greetingAfternoon')
  return t('dashboard.greetingEvening')
})

const displayName = computed(() => ownerName.value || t('dashboard.trainer'))

const editingName = ref(false)
const nameDraft = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

function startEditName() {
  nameDraft.value = ownerName.value ?? ''
  editingName.value = true
  nextTick(() => nameInput.value?.focus())
}
function saveName() {
  const trimmed = nameDraft.value.trim()
  if (trimmed && trimmed !== ownerName.value) {
    setOwnerName.mutate(trimmed)
  }
  editingName.value = false
}
function cancelEditName() {
  editingName.value = false
}

const totalCards = computed(() =>
  ownerProfile.value
    ? ownerProfile.value.binders.reduce(
        (acc, b) => acc + b.pages.reduce((a, p) => a + p.slots.length, 0),
        0
      )
    : 0
)
const binderCount = computed(() => ownerProfile.value?.binders.length ?? 0)
const wishlistCount = computed(() => ownerProfile.value?.wishlist.length ?? 0)
const tradablesCount = computed(() => {
  if (!ownerProfile.value) return 0
  let n = 0
  for (const b of ownerProfile.value.binders) {
    for (const p of b.pages) {
      for (const s of p.slots) {
        if (s.tradeStatus === 'for_trade' || s.tradeStatus === 'dupe') n += 1
      }
    }
  }
  return n
})

const radar = computed(() => {
  if (!ownerProfile.value || !friendsFull.value) return []
  return computeTradeRadar(
    ownerProfile.value,
    friendsFull.value.map((f) => ({ id: f.id, payload: f.payload }))
  )
})

const recentBinders = computed(() => (binders.value ?? []).slice(0, 4))
const recentWishlist = computed(() => (wishlist.value ?? []).slice(0, 5))

function coverUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: 8 })
}

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('') || '?'
  )
}

const newBinderOpen = ref(false)
const exportOpen = ref(false)

function onBinderCreated(b: Binder) {
  newBinderOpen.value = false
  router.push(`/binders/${b.id}`)
}

watch(ownerName, (n) => {
  if (!editingName.value && n !== undefined) nameDraft.value = n
})
</script>
