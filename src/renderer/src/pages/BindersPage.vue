<template>
  <PkmContainer>
    <div class="mx-auto max-w-6xl px-6 py-8">
      <header class="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-white">{{ t('binders.title') }}</h1>
          <p class="text-sm text-white/50">{{ t('binders.subtitle') }}</p>
        </div>
        <Button @click="showCreate = true">{{ t('binders.newBinder') }}</Button>
      </header>

      <div v-if="isLoading" class="py-20 text-center text-white/40">{{ t('common.loading') }}</div>

      <div
        v-else-if="data && data.length > 0"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <RouterLink
          v-for="binder in data"
          :key="binder.id"
          :to="`/binders/${binder.id}`"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 p-5 transition hover:-translate-y-0.5 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/20"
        >
          <!-- Cover preview -->
          <div class="mb-4 aspect-[5/7] w-2/3 overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-white/5">
            <img
              v-if="binder.coverCard"
              :src="coverUrl(binder.coverCard)"
              :alt="binder.coverCard.card_name"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-white/20"
            >
              <svg class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
              </svg>
            </div>
          </div>

          <h3 class="truncate text-lg font-semibold text-white">{{ binder.name }}</h3>
          <p v-if="binder.description" class="mt-1 line-clamp-2 text-xs text-white/50">
            {{ binder.description }}
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/40">
            <span>{{ binder.rows }} × {{ binder.cols }}</span>
            <span>·</span>
            <span>
              {{ binder.pageCount }}
              {{ binder.pageCount === 1 ? t('binders.page') : t('binders.pages') }}
            </span>
            <span>·</span>
            <span>{{ binder.cardCount }} {{ t('binders.cards') }}</span>
          </div>

          <button
            type="button"
            class="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white/50 opacity-0 backdrop-blur transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
            :aria-label="t('binders.deleteTooltip')"
            @click.prevent.stop="confirmDelete(binder.id, binder.name)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
            </svg>
          </button>
        </RouterLink>
      </div>

      <div
        v-else
        class="rounded-2xl border-2 border-dashed border-white/10 py-20 text-center"
      >
        <p class="text-lg text-white/40">{{ t('binders.noBindersYet') }}</p>
        <p class="mt-1 text-sm text-white/30">{{ t('binders.createFirst') }}</p>
        <Button class="mt-4" @click="showCreate = true">{{ t('binders.newBinder') }}</Button>
      </div>
    </div>

    <CreateBinderDialog
      :open="showCreate"
      @close="showCreate = false"
      @created="onCreated"
    />
  </PkmContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import PkmContainer from '@/components/custom/PkmContainer.vue'
import { Button } from '@/components/ui/button'
import { useBinders, useRemoveBinder } from '@/composables/useBinders'
import { getCardImageUrl } from '@/api/tcg'
import { snapshotToTcgCard } from '@/lib/binder-card'
import { usePreferredLang } from '@/i18n'
import type { BinderCardSnapshot, Binder } from '@shared/binders'
import CreateBinderDialog from '@/components/custom/Binder/CreateBinderDialog.vue'

const router = useRouter()
const { t } = useI18n()
const { data, isLoading } = useBinders()
const remove = useRemoveBinder()

const showCreate = ref(false)

const preferredLang = usePreferredLang()
function coverUrl(snap: BinderCardSnapshot): string {
  return getCardImageUrl(snapshotToTcgCard(snap), { preferredLang: preferredLang.value })
}

function confirmDelete(id: number, name: string) {
  if (window.confirm(t('binders.deleteConfirm', { name }))) {
    remove.mutate(id)
  }
}

function onCreated(binder: Binder) {
  showCreate.value = false
  router.push(`/binders/${binder.id}`)
}
</script>
