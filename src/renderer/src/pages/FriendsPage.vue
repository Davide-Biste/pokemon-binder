<template>
  <PkmContainer>
    <div class="mx-auto max-w-6xl px-6 py-8">
      <header class="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ t('friends.title') }}</h1>
          <p class="text-sm text-white/50">{{ t('friends.subtitle') }}</p>
        </div>
        <Button :disabled="importing.isPending.value" @click="onImport">
          {{ importing.isPending.value ? t('friends.importing') : t('friends.importProfile') }}
        </Button>
      </header>

      <div v-if="isLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div
        v-else-if="data && data.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="friend in data"
          :key="friend.id"
          class="group relative cursor-pointer rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-violet-400/50 hover:shadow-xl hover:shadow-violet-500/10"
          @click="goToFriend(friend.id)"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-lg font-semibold text-violet-200 ring-1 ring-violet-400/30">
              {{ initials(friend.ownerName) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="truncate text-lg font-semibold text-white">{{ friend.ownerName }}</h3>
              <p class="text-xs text-white/40">
                {{ t('friends.snapshotExportedAt', { date: formatDate(friend.exportedAt) }) }}
              </p>
            </div>
          </div>

          <dl class="mt-4 grid grid-cols-4 gap-2 text-center">
            <Stat :value="friend.binderCount" :label="t('friends.stats.binders')" />
            <Stat :value="friend.cardCount" :label="t('friends.stats.cards')" />
            <Stat :value="friend.tradablesCount" :label="t('friends.stats.tradables')" accent="emerald" />
            <Stat :value="friend.wishlistCount" :label="t('friends.stats.wishlist')" accent="yellow" />
          </dl>

          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white/50 opacity-0 backdrop-blur transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
            :aria-label="t('friends.removeTooltip')"
            @click.stop="confirmRemove(friend.id, friend.ownerName)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
            </svg>
          </button>
        </article>
      </div>

      <div
        v-else
        class="rounded-2xl border-2 border-dashed border-white/10 py-20 text-center"
      >
        <p class="text-lg text-white/40">{{ t('friends.empty') }}</p>
        <i18n-t keypath="friends.emptyHint" tag="p" class="mt-1 text-sm text-white/30">
          <template #file>
            <code class="rounded bg-white/10 px-1.5 py-0.5 text-xs">.pkbinder.json</code>
          </template>
        </i18n-t>
        <Button class="mt-4" :disabled="importing.isPending.value" @click="onImport">
          {{ t('friends.importProfile') }}
        </Button>
      </div>
    </div>
  </PkmContainer>
</template>

<script setup lang="ts">
import { h, type FunctionalComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import { Button } from '@/components/ui/button'
import { useFriends, useImportFriend, useRemoveFriend } from '@/composables/useFriends'

const router = useRouter()
const { t } = useI18n()
const { data, isLoading } = useFriends()
const importing = useImportFriend()
const remove = useRemoveFriend()

function goToFriend(id: number) {
  router.push(`/friends/${id}`)
}

async function onImport() {
  try {
    await importing.mutateAsync()
  } catch (err) {
    window.alert(t('sidebar.importFailed', { error: (err as Error).message }))
  }
}

function confirmRemove(id: number, name: string) {
  if (window.confirm(t('friends.removeConfirm', { name }))) {
    remove.mutate(id)
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Inline stat tile — small enough to live here rather than as a separate file.
const Stat: FunctionalComponent<{
  value: number
  label: string
  accent?: 'emerald' | 'yellow'
}> = (props) => {
  const valueClass =
    props.accent === 'emerald'
      ? 'text-emerald-300'
      : props.accent === 'yellow'
        ? 'text-yellow-300'
        : 'text-white'
  return h('div', { class: 'rounded-lg bg-white/5 px-2 py-1.5 ring-1 ring-white/5' }, [
    h('div', { class: `text-base font-semibold ${valueClass}` }, props.value),
    h('div', { class: 'text-[10px] uppercase tracking-wider text-white/40' }, props.label)
  ])
}
Stat.props = ['value', 'label', 'accent']
</script>
