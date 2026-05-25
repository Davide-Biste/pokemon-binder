<template>
  <div
    class="group relative cursor-zoom-in"
    role="button"
    tabindex="0"
    @click="isOpen = true"
    @keydown.enter.prevent="isOpen = true"
    @keydown.space.prevent="isOpen = true"
  >
    <!-- L'effetto holo (scale, rotazione 3D, shine, glare) ora vive dentro
         TcgCardThumb. Manteniamo qui solo i layer di overlay: badge rarità +
         pulsante "add to binder". Sono z-indicizzati sopra il glare per
         restare leggibili durante l'interazione. -->
    <TcgCardThumb
      :src="broken ? null : currentUrl"
      :alt="card.card_name"
      :rarity="card.card_rarity"
      :supertype="card.card_type"
      :number="card.card_number"
      class="w-full"
      @error="onImageError"
    >
      <template #overlay>
        <!-- Rarity badge -->
        <div
          v-if="card.card_rarity"
          class="pointer-events-none absolute right-2 top-2 z-20 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm ring-1 ring-white/20"
          :class="rarity.badge"
        >
          <span aria-hidden="true">{{ rarity.icon }}</span>
          <span>{{ card.card_rarity }}</span>
        </div>

        <!-- Add to binder affordance (opt-in; appears on hover) -->
        <button
          v-if="addable"
          type="button"
          class="pointer-events-auto absolute left-2 top-2 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 ring-1 ring-white/25 backdrop-blur transition hover:bg-red-500 group-hover:opacity-100"
          aria-label="Add to binder"
          title="Add to binder"
          @click.stop="$emit('add-to-binder', card)"
          @keydown.enter.stop
          @keydown.space.stop
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </template>
    </TcgCardThumb>

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
import { usePreferredLang } from '@/i18n'
import TcgCardDialog from '@/components/custom/TcgCard/TcgCardDialog.vue'
import TcgCardThumb from '@/components/custom/TcgCard/TcgCardThumb.vue'

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
// `preferredLang` derives from the current i18n locale: cambiando lingua app
// → cards si riscaricano nella lingua giusta (l'EN fallback resta interno).
const preferredLang = usePreferredLang()
const urlCandidates = computed(() =>
  getCardImageUrls(props.card, { preferredLang: preferredLang.value })
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

const setName = computed(() => getSetName(props.card, preferredLang.value))
const rarity = computed(() => getRarityStyle(props.card.card_rarity))
</script>
