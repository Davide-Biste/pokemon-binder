<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1',
      style.bg,
      style.text,
      style.ring
    ]"
    :title="style.title"
  >
    <svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M12 3v18M5 7h14M3 11l2-4h4l-3 4a3 3 0 006 0l-3-4M15 11l3-4h4l-3 4a3 3 0 006 0l-3-4M5 21h14"
        stroke="currentColor"
        stroke-width="1.5"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    {{ score }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Visualises the per-friend fairness score from the Trade Matcher:
 *   0   → no overlap (grey)
 *   1-2 → small potential (yellow)
 *   3+  → strong mutual interest (emerald)
 */
const props = defineProps<{ score: number }>()
const { t } = useI18n()

const style = computed(() => {
  if (props.score >= 3) {
    return {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-200',
      ring: 'ring-emerald-400/30',
      title: t('fairness.strong')
    }
  }
  if (props.score >= 1) {
    return {
      bg: 'bg-yellow-500/15',
      text: 'text-yellow-200',
      ring: 'ring-yellow-400/30',
      title: t('fairness.some')
    }
  }
  return {
    bg: 'bg-white/5',
    text: 'text-white/40',
    ring: 'ring-white/10',
    title: t('fairness.none')
  }
})
</script>
