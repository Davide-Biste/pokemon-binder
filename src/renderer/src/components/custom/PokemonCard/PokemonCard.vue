<template>
  <RouterLink
    :to="`/pokedex/${id}`"
    class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-2xl"
  >
  <Card
    class="group relative overflow-hidden rounded-2xl border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/20 cursor-pointer"
  >
    <!-- Decorative glow -->
    <div
      class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
    />
    <div
      class="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"
    />

    <!-- Pokedex number badge -->
    <div
      class="absolute right-3 top-3 z-10 rounded-full bg-white/10 px-2.5 py-1 font-mono text-xs font-semibold text-white/80 backdrop-blur"
    >
      #{{ paddedNumber }}
    </div>

    <!-- Sprite area -->
    <div class="relative flex h-44 items-center justify-center px-4 pt-6">
      <div
        class="absolute inset-x-6 bottom-2 top-6 rounded-full bg-gradient-to-b from-white/10 to-transparent blur-2xl"
      />
      <img
        :src="spriteUrl"
        :alt="displayName"
        class="relative h-full w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110"
        loading="lazy"
        @error="onImageError"
      />
    </div>

    <!-- Info -->
    <div class="relative px-4 pb-4 pt-2 text-center">
      <h3 class="truncate text-base font-semibold capitalize text-white">
        {{ displayName }}
      </h3>
    </div>
  </Card>
  </RouterLink>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Card } from '@/components/ui/card'
import { PokemonCardProps } from '@/components/custom/PokemonCard/PokemonCard.config'

const props = defineProps<PokemonCardProps>()

const fallbackTriggered = ref(false)

const spriteUrl = computed(() => {
  if (fallbackTriggered.value) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.speciesId}.png`
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.speciesId}.png`
})

const paddedNumber = computed(() => String(props.number).padStart(3, '0'))

const displayName = computed(() => props.name.replace(/-/g, ' '))

function onImageError() {
  fallbackTriggered.value = true
}
</script>
