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
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-md rounded-3xl bg-zinc-900/95 p-6 shadow-2xl ring-1 ring-white/10">
          <h2 class="mb-5 text-xl font-bold text-white">{{ t('createBinder.title') }}</h2>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                {{ t('common.name') }}
              </label>
              <Input
                v-model="name"
                required
                autofocus
                :placeholder="t('createBinder.namePlaceholder')"
              />
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                {{ t('common.description') }}
              </label>
              <Input v-model="description" :placeholder="t('common.optional')" />
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {{ t('createBinder.rows') }}
                </label>
                <Input v-model.number="rows" type="number" min="1" max="10" />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {{ t('createBinder.cols') }}
                </label>
                <Input v-model.number="cols" type="number" min="1" max="10" />
              </div>
              <div>
                <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                  {{ t('createBinder.pages') }}
                </label>
                <Input v-model.number="initialPages" type="number" min="1" max="100" />
              </div>
            </div>

            <p class="text-xs text-white/40">
              {{ t('createBinder.totals', { perPage: rows * cols, total: rows * cols * initialPages }) }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="$emit('close')">
                {{ t('common.cancel') }}
              </Button>
              <Button type="submit" :disabled="!name || mutation.isPending.value">
                {{ mutation.isPending.value ? t('createBinder.creating') : t('common.create') }}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateBinder } from '@/composables/useBinders'
import type { Binder } from '@shared/binders'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [binder: Binder] }>()

const name = ref('')
const description = ref('')
const rows = ref(3)
const cols = ref(3)
const initialPages = ref(1)

const mutation = useCreateBinder()

async function onSubmit() {
  if (!name.value.trim()) return
  const binder = await mutation.mutateAsync({
    name: name.value.trim(),
    description: description.value.trim() || undefined,
    rows: rows.value,
    cols: cols.value,
    initialPages: initialPages.value
  })
  emit('created', binder)
}

// Reset form whenever the dialog closes.
watch(
  () => props.open,
  (o) => {
    if (!o) {
      name.value = ''
      description.value = ''
      rows.value = 3
      cols.value = 3
      initialPages.value = 1
    }
  }
)
</script>
