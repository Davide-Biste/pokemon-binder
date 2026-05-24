<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-6 backdrop-blur-md"
        @click.self="$emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          appear
        >
          <div
            v-if="open"
            class="relative w-full max-w-4xl rounded-3xl bg-zinc-900/95 p-6 shadow-2xl ring-1 ring-white/10"
          >
            <div class="mb-4 flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-white">{{ t('cardPicker.title') }}</h2>
              <button
                type="button"
                class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white"
                @click="$emit('close')"
              >
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <Input
              v-model="search"
              type="text"
              :placeholder="t('cardPicker.searchPlaceholder')"
              class="mb-4"
              autofocus
            />

            <div class="max-h-[60vh] overflow-y-auto">
              <div v-if="!debouncedSearch" class="py-12 text-center text-sm text-white/40">
                {{ t('cardPicker.typeToSearch') }}
              </div>
              <div v-else-if="isLoading" class="py-12 text-center text-sm text-white/40">
                {{ t('cardPicker.searching') }}
              </div>
              <div
                v-else-if="cards && cards.length > 0"
                class="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
              >
                <button
                  v-for="card in cards"
                  :key="card.id"
                  type="button"
                  class="group relative aspect-[5/7] cursor-pointer overflow-hidden rounded-[5%] shadow-md ring-1 ring-white/5 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-red-400/60"
                  @click="$emit('pick', card)"
                >
                  <img
                    :src="getCardImageUrl(card, { preferredLang: 8 })"
                    :alt="card.card_name"
                    loading="lazy"
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                  <span
                    class="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 py-1 text-[10px] font-medium text-white"
                  >
                    {{ card.card_name }} · #{{ card.card_number }}
                  </span>
                </button>
              </div>
              <div v-else class="py-12 text-center text-sm text-white/40">
                {{ t('cardPicker.noResults') }}
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuery } from '@tanstack/vue-query'
import { Input } from '@/components/ui/input'
import { getCardImageUrl, searchTcgCards, type TcgCard } from '@/api/tcg'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; pick: [card: TcgCard] }>()

const search = ref('')
const debouncedSearch = ref('')

// Debounce input by 350ms so we don't hammer the API on every keystroke.
let timer: ReturnType<typeof setTimeout> | null = null
watch(search, (v) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    debouncedSearch.value = v.trim()
  }, 350)
})

const { data: cards, isLoading } = useQuery({
  queryKey: ['tcg-picker', debouncedSearch],
  queryFn: () => searchTcgCards({ search: debouncedSearch.value, limit: 60 }),
  enabled: computed(() => debouncedSearch.value.length >= 2),
  staleTime: 1000 * 60 * 5
})

// Reset state and handle ESC when the dialog opens/closes.
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
      search.value = ''
      debouncedSearch.value = ''
    }
  }
)
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>
