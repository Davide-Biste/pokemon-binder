<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
        @click.self="$emit('close')"
      >
        <!-- Close button -->
        <button
          type="button"
          class="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20 hover:text-white"
          aria-label="Close"
          @click="$emit('close')"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-90"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-90"
          appear
        >
          <div
            v-if="open"
            class="relative flex max-h-full w-full max-w-5xl flex-col items-center gap-6 lg:flex-row lg:items-stretch"
          >
            <!-- Card image -->
            <div class="relative shrink-0">
              <div
                class="relative aspect-[5/7] h-[min(80vh,640px)] overflow-hidden rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
                :class="[rarity.ring, rarity.glow.replace('group-hover:', '')]"
              >
                <img
                  v-if="!broken"
                  :src="currentUrl"
                  :alt="card.card_name"
                  class="absolute inset-0 h-full w-full object-cover"
                  @error="onImageError"
                />
                <div
                  v-else
                  class="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white/40"
                >
                  No image available
                </div>
              </div>
            </div>

            <!-- Info panel -->
            <div
              class="flex min-w-0 flex-1 flex-col justify-between gap-6 rounded-3xl bg-zinc-900/80 p-6 ring-1 ring-white/10 backdrop-blur lg:max-w-sm"
            >
              <div class="space-y-4">
                <!-- Header -->
                <div class="space-y-2">
                  <div
                    v-if="card.card_rarity"
                    class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ring-white/20"
                    :class="rarity.badge"
                  >
                    <span aria-hidden="true">{{ rarity.icon }}</span>
                    <span>{{ card.card_rarity }}</span>
                  </div>
                  <h2 class="text-2xl font-bold tracking-tight text-white">
                    {{ card.card_name }}
                  </h2>
                  <p class="text-sm text-white/60">{{ setName ?? '—' }}</p>
                </div>

                <!-- Stats grid -->
                <dl class="grid grid-cols-2 gap-y-3 text-sm">
                  <div>
                    <dt class="text-[10px] uppercase tracking-wider text-white/40">Number</dt>
                    <dd class="font-mono font-medium text-white">
                      #{{ card.card_number
                      }}<span v-if="card.set_n_cards" class="text-white/40"
                        > / {{ card.set_n_cards }}</span
                      >
                    </dd>
                  </div>
                  <div v-if="card.card_type">
                    <dt class="text-[10px] uppercase tracking-wider text-white/40">Type</dt>
                    <dd class="font-medium text-white">{{ card.card_type }}</dd>
                  </div>
                  <div v-if="card.artist">
                    <dt class="text-[10px] uppercase tracking-wider text-white/40">Artist</dt>
                    <dd class="font-medium italic text-white">{{ card.artist }}</dd>
                  </div>
                  <div>
                    <dt class="text-[10px] uppercase tracking-wider text-white/40">Language</dt>
                    <dd class="font-medium uppercase text-white">{{ card.lang }}</dd>
                  </div>
                </dl>

                <!-- Variants -->
                <div v-if="variants.length > 0" class="space-y-1.5">
                  <p class="text-[10px] uppercase tracking-wider text-white/40">Variants</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="v in variants"
                      :key="v"
                      class="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80"
                    >
                      {{ v }}
                    </span>
                  </div>
                </div>

                <div
                  v-if="card.description"
                  class="text-xs leading-relaxed text-white/60"
                  v-html="card.description"
                />
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { getCardImageUrls, getSetName, type TcgCard } from '@/api/tcg'
import { getRarityStyle } from '@/lib/tcg-rarities'

const props = defineProps<{ card: TcgCard; open: boolean }>()
const emit = defineEmits<{ close: [] }>()

// Dialog zoom: always serves the full-res asset (thumbnails are never used).
const urlCandidates = computed(() =>
  getCardImageUrls(props.card, { preferredLang: 8 })
)
const urlIndex = ref(0)
const broken = ref(false)

const currentUrl = computed(() => urlCandidates.value[urlIndex.value])

function onImageError() {
  if (urlIndex.value < urlCandidates.value.length - 1) urlIndex.value++
  else broken.value = true
}

// Reset image state when card changes or dialog reopens.
watch(
  () => props.open,
  (o) => {
    if (o) {
      urlIndex.value = 0
      broken.value = false
    }
  }
)

const setName = computed(() => getSetName(props.card))
const rarity = computed(() => getRarityStyle(props.card.card_rarity))

const variants = computed(() => {
  const out: string[] = []
  if (props.card.holo === '1') out.push('Holo')
  if (props.card.reverse_holo === '1') out.push('Reverse Holo')
  if (props.card.no_holo === '1') out.push('Non-Holo')
  return out
})

// ESC to close + lock body scroll while open.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
watch(
  () => props.open,
  (o) => {
    if (o) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }
)
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>
