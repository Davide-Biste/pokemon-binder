<template>
  <div class="rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
    <div :class="['text-3xl font-bold', tintClass, loading ? 'text-white/15' : '']">
      <CountUp v-if="!loading" :end-val="value" />
    </div>
    <div class="mt-0.5 text-xs uppercase tracking-wider text-white/40">{{ label }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CountUp from 'vue-countup-v3'

const props = withDefaults(
  defineProps<{
    value: number
    label: string
    tint?: 'white' | 'emerald' | 'violet' | 'yellow'
    loading?: boolean
  }>(),
  { tint: 'white', loading: false }
)

const tintClass = computed(() => {
  if (props.loading) return ''
  switch (props.tint) {
    case 'emerald':
      return 'text-emerald-300'
    case 'violet':
      return 'text-violet-300'
    case 'yellow':
      return 'text-yellow-300'
    default:
      return 'text-white'
  }
})
</script>
