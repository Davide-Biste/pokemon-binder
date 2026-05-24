<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ring-1 ring-inset"
    :class="[colors.bg, colors.text, colors.ring]"
  >
    {{ type }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PokemonType } from '@/api/pokemon'
import { TYPE_COLORS } from '@/lib/pokemon-types'

const props = defineProps<{ type: PokemonType }>()
const colors = computed(() => TYPE_COLORS[props.type])
</script>
