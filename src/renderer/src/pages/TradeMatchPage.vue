<template>
  <PkmContainer>
    <div class="mx-auto max-w-7xl px-6 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-white">{{ t('trades.title') }}</h1>
        <i18n-t keypath="trades.subtitle" tag="p" class="text-sm text-white/50">
          <template #forTrade>
            <span class="text-emerald-300">{{ t('trades.forTradeWord') }}</span>
          </template>
          <template #dupe>
            <span class="text-sky-300">{{ t('trades.dupeWord') }}</span>
          </template>
        </i18n-t>
      </header>

      <div v-if="loadingPrereqs" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div
        v-else-if="!friends || friends.length === 0"
        class="rounded-2xl border-2 border-dashed border-white/10 py-20 text-center"
      >
        <p class="text-lg text-white/40">{{ t('trades.noFriends') }}</p>
        <i18n-t keypath="trades.noFriendsHint" tag="p" class="mt-1 text-sm text-white/30">
          <template #file>
            <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">.pkbinder.json</code>
          </template>
        </i18n-t>
        <Button class="mt-4" @click="$router.push('/friends')">{{ t('trades.goToFriends') }}</Button>
      </div>

      <template v-else>
        <!-- Friend picker -->
        <div class="mb-6 flex flex-wrap items-center gap-2">
          <span class="mr-1 text-xs uppercase tracking-wider text-white/40">
            {{ t('trades.matchWith') }}
          </span>
          <button
            v-for="f in friends"
            :key="f.id"
            type="button"
            class="cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition"
            :class="
              selectedFriendId === f.id
                ? 'bg-violet-500 text-white ring-violet-400/40'
                : 'bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white'
            "
            @click="selectedFriendId = f.id"
          >
            {{ f.ownerName }}
          </button>
        </div>

        <!-- Summary -->
        <section
          v-if="result"
          class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <StatCard
            :value="result.theyOfferIWant.length"
            :label="t('trades.theyHaveYouWant')"
            tint="emerald"
          />
          <StatCard
            :value="result.iOfferTheyWant.length"
            :label="t('trades.youHaveTheyWant')"
            tint="violet"
          />
          <StatCard :value="result.fairnessScore" :label="t('trades.fairTradeSize')" tint="yellow" />
        </section>

        <!-- Two-column diff -->
        <section v-if="result" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MatchColumn
            :title="t('trades.theyHaveYouWant')"
            :empty-text="t('trades.nothingTheirs')"
            tint="emerald"
            :entries="result.theyOfferIWant"
          />
          <MatchColumn
            :title="t('trades.youHaveTheyWant')"
            :empty-text="t('trades.nothingYours')"
            tint="violet"
            :entries="result.iOfferTheyWant"
          />
        </section>
      </template>
    </div>
  </PkmContainer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import { Button } from '@/components/ui/button'
import { useFriend, useFriends } from '@/composables/useFriends'
import { useOwnerProfile } from '@/composables/useProfile'
import { computeTradeMatches } from '@/lib/trade-match'
import StatCard from '@/components/custom/Trade/StatCard.vue'
import MatchColumn from '@/components/custom/Trade/MatchColumn.vue'

const { t } = useI18n()
const route = useRoute()

const { data: friends, isLoading: loadingFriends } = useFriends()
const { data: ownerProfile, isLoading: loadingOwner } = useOwnerProfile()

const loadingPrereqs = computed(() => loadingFriends.value || loadingOwner.value)

// Pre-select via /trades/:friendId or default to the first friend.
const selectedFriendId = ref<number | null>(
  route.params.friendId ? Number(route.params.friendId) : null
)
watch(
  friends,
  (list) => {
    if (selectedFriendId.value === null && list && list.length > 0) {
      selectedFriendId.value = list[0].id
    }
  },
  { immediate: true }
)

// useFriend expects `number | undefined`; map our nullable ref accordingly.
const selectedFriendIdForQuery = computed<number | undefined>(
  () => selectedFriendId.value ?? undefined
)
const { data: selectedFriend } = useFriend(selectedFriendIdForQuery)

const result = computed(() => {
  if (!ownerProfile.value || !selectedFriend.value) return null
  return computeTradeMatches(ownerProfile.value, selectedFriend.value.payload)
})
</script>
