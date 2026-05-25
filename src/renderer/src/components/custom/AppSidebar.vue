<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  DashboardSquare01Icon,
  Notebook01Icon,
  GridViewIcon,
  FavouriteIcon,
  Add01Icon,
  Download01Icon,
  Upload01Icon,
  UserMultiple02Icon,
  ArrowDataTransferHorizontalIcon,
  Settings01Icon
} from '@hugeicons/core-free-icons'
import { useImportFriend } from '@/composables/useFriends'
import ExportProfileDialog from '@/components/custom/ExportProfileDialog.vue'
import LanguageSwitcher from '@/components/custom/LanguageSwitcher.vue'

const version = import.meta.env.VITE_APP_VERSION
console.log({ version: import.meta.env })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Translation keys are resolved at render time so the labels live-update on
// locale change (i18n.global.locale.value is reactive).
const navItems = [
  { id: 'dashboard', labelKey: 'sidebar.dashboard', icon: DashboardSquare01Icon, path: '/' },
  { id: 'binders', labelKey: 'sidebar.binder', icon: Notebook01Icon, path: '/binders' },
  { id: 'pokedex', labelKey: 'sidebar.pokedex', icon: GridViewIcon, path: '/pokedex' },
  { id: 'wishlist', labelKey: 'sidebar.wishlist', icon: FavouriteIcon, path: '/wishlist' },
  { id: 'friends', labelKey: 'sidebar.friends', icon: UserMultiple02Icon, path: '/friends' },
  {
    id: 'trades',
    labelKey: 'sidebar.trades',
    icon: ArrowDataTransferHorizontalIcon,
    path: '/trades'
  }
] as const

const isActive = (path: string): boolean => route.path === path || route.path.startsWith(path + '/')

const exportOpen = ref(false)
const importFriend = useImportFriend()

async function onImportFriend() {
  try {
    const snap = await importFriend.mutateAsync()
    if (snap) router.push(`/friends/${snap.id}`)
  } catch (err) {
    window.alert(t('sidebar.importFailed', { error: (err as Error).message }))
  }
}
</script>

<template>
  <aside class="pb-sidebar">
    <div class="pb-brand">
      <div class="pb-brand-logo"></div>
      <div class="pb-brand-text">
        <b>Po-Po-POKE</b>
        <small>{{ version }} · {{ t('badges.pro') }}</small>
      </div>
    </div>

    <div class="pb-nav-section">
      <div class="pb-nav-label">{{ t('sidebar.workspace') }}</div>
      <button
        v-for="item in navItems"
        :key="item.id"
        class="pb-nav-item"
        :class="{ active: isActive(item.path) }"
        @click="router.push(item.path)"
      >
        <HugeiconsIcon :icon="item.icon" :size="18" class="pb-nav-icon" />
        <span class="pb-nav-text">{{ t(item.labelKey) }}</span>
      </button>
    </div>

    <div class="pb-nav-section">
      <div class="pb-nav-label">{{ t('sidebar.myBinders') }}</div>
      <button class="pb-nav-item" style="color: var(--pb-fg-3)" @click="router.push('/binders')">
        <HugeiconsIcon :icon="Add01Icon" :size="18" class="pb-nav-icon" />
        <span class="pb-nav-text">{{ t('sidebar.newBinder') }}</span>
      </button>
    </div>

    <div class="pb-nav-section" style="margin-top: auto">
      <div class="pb-nav-label">{{ t('sidebar.tools') }}</div>
      <button class="pb-nav-item" :disabled="importFriend.isPending.value" @click="onImportFriend">
        <HugeiconsIcon :icon="Download01Icon" :size="18" class="pb-nav-icon" />
        <span class="pb-nav-text">
          {{ importFriend.isPending.value ? t('sidebar.importing') : t('sidebar.importFriend') }}
        </span>
      </button>
      <button class="pb-nav-item" @click="exportOpen = true">
        <HugeiconsIcon :icon="Upload01Icon" :size="18" class="pb-nav-icon" />
        <span class="pb-nav-text">{{ t('sidebar.exportProfile') }}</span>
      </button>
      <button class="pb-nav-item">
        <HugeiconsIcon :icon="Settings01Icon" :size="18" class="pb-nav-icon" />
        <span class="pb-nav-text">{{ t('sidebar.settings') }}</span>
      </button>

      <!-- Language switcher pinned to the very bottom of the tools group. -->
      <div class="pb-lang-row">
        <LanguageSwitcher />
      </div>
    </div>

    <ExportProfileDialog :open="exportOpen" @close="exportOpen = false" />
  </aside>
</template>

<style scoped>
.pb-lang-row {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}
</style>
