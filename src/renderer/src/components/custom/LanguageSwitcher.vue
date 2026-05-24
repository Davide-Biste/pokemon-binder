<template>
  <div class="pb-lang-switch">
    <button
      v-for="loc in SUPPORTED_LOCALES"
      :key="loc"
      type="button"
      class="pb-lang-btn"
      :class="{ active: locale === loc }"
      :title="LOCALE_LABELS[loc]"
      @click="onPick(loc)"
    >
      {{ loc.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  setLocale,
  type SupportedLocale
} from '@/i18n'

const { locale } = useI18n()

function onPick(loc: SupportedLocale) {
  if (loc !== locale.value) setLocale(loc)
}
</script>

<style scoped>
.pb-lang-switch {
  display: inline-flex;
  gap: 2px;
  padding: 2px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}
.pb-lang-btn {
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: background 120ms, color 120ms;
}
.pb-lang-btn:hover {
  color: rgba(255, 255, 255, 0.85);
}
.pb-lang-btn.active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
</style>
