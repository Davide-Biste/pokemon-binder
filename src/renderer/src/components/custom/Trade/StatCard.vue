<template>
  <div
    class="rounded-2xl border border-white/10 bg-zinc-900/60 p-4"
    :class="ring"
  >
    <div :class="['text-3xl font-bold', valueClass]">{{ value }}</div>
    <div class="mt-0.5 text-xs uppercase tracking-wider text-white/40">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    label: string
    tint?: 'emerald' | 'violet' | 'yellow'
  }>(),
  { tint: 'emerald' }
)

const valueClass = computed(() => {
  switch (props.tint) {
    case 'violet':
      return 'text-violet-300'
    case 'yellow':
      return 'text-yellow-300'
    default:
      return 'text-emerald-300'
  }
})

const ring = computed(() => {
  // Subtle outer glow that matches the value color — only visible on hover so
  // the grid stays calm at rest.
  switch (props.tint) {
    case 'violet':
      return 'transition hover:shadow-lg hover:shadow-violet-500/10'
    case 'yellow':
      return 'transition hover:shadow-lg hover:shadow-yellow-500/10'
    default:
      return 'transition hover:shadow-lg hover:shadow-emerald-500/10'
  }
})
</script>
