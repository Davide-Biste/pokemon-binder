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
          <h2 class="mb-1 text-xl font-bold text-white">{{ t('exportDialog.title') }}</h2>
          <i18n-t keypath="exportDialog.subtitle" tag="p" class="mb-5 text-sm text-white/50">
            <template #file>
              <code class="text-white/70">.pkbinder.json</code>
            </template>
          </i18n-t>

          <form class="space-y-4" @submit.prevent="onSubmit">
            <div>
              <label class="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/50">
                {{ t('exportDialog.yourName') }}
              </label>
              <Input
                v-model="name"
                required
                autofocus
                :placeholder="t('exportDialog.namePlaceholder')"
              />
              <p class="mt-1.5 text-xs text-white/35">
                {{ t('exportDialog.shownToFriends') }}
              </p>
            </div>

            <p
              v-if="result"
              class="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 ring-1 ring-emerald-400/20"
            >
              {{ t('exportDialog.exportedTo', { path: result.path, size: formatBytes(result.byteSize) }) }}
            </p>
            <p
              v-if="error"
              class="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-200 ring-1 ring-red-400/20"
            >
              {{ error }}
            </p>

            <div class="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" @click="$emit('close')">
                {{ t('common.close') }}
              </Button>
              <Button type="submit" :disabled="exporting.isPending.value || !name.trim()">
                {{ exporting.isPending.value ? t('exportDialog.saving') : t('exportDialog.export') }}
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useExportProfile, useOwnerName, useSetOwnerName } from '@/composables/useProfile'
import type { ExportResult } from '@shared/export'

const props = defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const { t } = useI18n()
const exporting = useExportProfile()
const { data: savedName } = useOwnerName()
const saveName = useSetOwnerName()

const name = ref('')
const result = ref<ExportResult | null>(null)
const error = ref<string | null>(null)

// Hydrate the input from the saved owner name when the dialog opens.
watch(
  () => props.open,
  (o) => {
    if (o) {
      name.value = savedName.value ?? ''
      result.value = null
      error.value = null
    }
  }
)
watch(savedName, (n) => {
  if (n && !name.value) name.value = n
})

async function onSubmit() {
  const trimmed = name.value.trim()
  if (!trimmed) return
  error.value = null
  result.value = null
  try {
    saveName.mutate(trimmed)
    const res = await exporting.mutateAsync(trimmed)
    if (res) result.value = res
    // res === null → user cancelled the save dialog; leave the form silent.
  } catch (err) {
    error.value = (err as Error).message || t('exportDialog.failed')
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
</script>
