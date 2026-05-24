<template>
  <div
    class="group relative cursor-zoom-in transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03]"
    role="button"
    tabindex="0"
    @click="isOpen = true"
    @keydown.enter.prevent="isOpen = true"
    @keydown.space.prevent="isOpen = true"
  >
    <!-- Card frame: matches real TCG aspect + corner radius. Crops a hair (5:7 vs 63:88) but
         lines up perfectly with the card's natural rounded corners. -->
    <div
      class="relative aspect-[5/7] w-full overflow-hidden rounded-[4%] shadow-lg ring-1 ring-white/5 transition-shadow duration-300"
      :class="[rarity.ring, `group-hover:shadow-2xl ${rarity.glow}`, 'group-hover:ring-2']"
    >
      <!-- Rarity badge -->
      <div
        v-if="card.card_rarity"
        class="absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ring-1 ring-white/20"
        :class="rarity.badge"
      >
        <span aria-hidden="true">{{ rarity.icon }}</span>
        <span>{{ card.card_rarity }}</span>
      </div>

      <!-- Add to binder affordance (opt-in; appears on hover) -->
      <button
        v-if="addable"
        type="button"
        class="absolute left-2 top-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 ring-1 ring-white/25 backdrop-blur transition hover:bg-red-500 group-hover:opacity-100"
        aria-label="Add to binder"
        title="Add to binder"
        @click.stop="$emit('add-to-binder', card)"
        @keydown.enter.stop
        @keydown.space.stop
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <img
        v-if="!broken"
        :src="currentUrl"
        :alt="card.card_name"
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        @error="onImageError"
      />
      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-900 text-white/30"
      >
        <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5z" />
        </svg>
        <span class="text-[10px] uppercase tracking-wider">No image</span>
      </div>

      <!-- Holographic shine sweep on hover -->
      <div
        class="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        <div
          class="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style="animation: holo-shine 1.4s ease-in-out infinite"
        />
      </div>
    </div>

    <!-- Card info — sits below the card, transparent background. -->
    <div class="px-1 pb-1 pt-3">
      <div class="flex items-baseline justify-between gap-2">
        <h4 class="truncate text-sm font-semibold tracking-tight text-white">
          {{ card.card_name }}
        </h4>
        <span class="shrink-0 font-mono text-[11px] text-white/45">
          <span class="text-white/70">#{{ card.card_number }}</span>
          <span v-if="card.set_n_cards" class="opacity-60">/{{ card.set_n_cards }}</span>
        </span>
      </div>
      <p class="truncate text-[11px] text-white/55">{{ setName ?? '—' }}</p>
      <p v-if="card.artist" class="truncate text-[10px] italic text-white/35">
        by {{ card.artist }}
      </p>
    </div>

    <TcgCardDialog :card="card" :open="isOpen" @close="isOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getCardImageUrls, getSetName, type TcgCard } from '@/api/tcg'
import { getRarityStyle } from '@/lib/tcg-rarities'
import TcgCardDialog from '@/components/custom/TcgCard/TcgCardDialog.vue'

const props = withDefaults(
  defineProps<{
    card: TcgCard
    /** Show the "+ add to binder" hover affordance. Parent listens for `add-to-binder`. */
    addable?: boolean
  }>(),
  { addable: false }
)

defineEmits<{ 'add-to-binder': [card: TcgCard] }>()

const isOpen = ref(false)

// Walk a fallback chain (preferred lang → English) on each image-load failure.
const urlCandidates = computed(() =>
  getCardImageUrls(props.card, { preferredLang: 8 })
)
const urlIndex = ref(0)
const broken = ref(false)

const currentUrl = computed(() => urlCandidates.value[urlIndex.value])

function onImageError() {
  if (urlIndex.value < urlCandidates.value.length - 1) {
    urlIndex.value++
  } else {
    broken.value = true
  }
}

const setName = computed(() => getSetName(props.card))
const rarity = computed(() => getRarityStyle(props.card.card_rarity))
</script>
