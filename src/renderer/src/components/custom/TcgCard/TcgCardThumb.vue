<template>
  <div
    ref="hostRef"
    class="tcg-card-thumb relative aspect-[5/7]"
  >
    <div
      class="holo-card interactive"
      :class="{ active: interactive && interacting }"
      :data-rarity="dataRarity"
      :data-subtypes="dataSubtypes"
      :data-supertype="dataSupertype"
      :data-number="dataNumber"
      :style="cardStyle"
      @pointermove="onMove"
      @pointerleave="onLeave"
      @touchmove.passive="onTouch"
      @touchend="onLeave"
    >
      <div class="holo-card__translater">
        <!--
          `@mousedown.prevent`: impedisce al browser di mettere il focus sul
          bottone al click. Senza questo, in Chromium il click apriva il
          dialog ma il bottone restava `:focus` → stato `.active`/`:focus`
          del simey-CSS persistente → alone colorato fantasma anche con il
          pointer altrove.
        -->
        <button
          type="button"
          class="holo-card__rotator"
          tabindex="-1"
          @mousedown.prevent
          @blur="onLeave"
        >
          <div class="holo-card__front">
            <img
              v-if="src && !broken"
              :src="src"
              :alt="alt"
              loading="lazy"
              width="660"
              height="921"
              @error="onImgError"
            />
            <div
              v-else
              class="thumb-empty flex h-full w-full items-center justify-center text-white/15"
              aria-hidden="true"
            >
              <svg
                class="h-1/3 w-1/3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z"
                />
              </svg>
            </div>
            <div class="holo-card__shine"></div>
            <div class="holo-card__glare"></div>
          </div>
        </button>
      </div>
    </div>

    <!--
      Slot overlay come SORELLA di .holo-card (non discendente):
      la regola simey `.holo-card__rotator * { width:100%; aspect-ratio:.718;
      display:grid; ... }` colpirebbe il contenuto dello slot, schiacciando
      badge/pulsanti a riempire l'intera carta. Mettendolo fuori conserviamo
      il posizionamento `absolute right-2 top-2` dei consumer.
      `pointer-events: none` di default → solo i child con
      `pointer-events-auto` (es. il pulsante "+") catturano click.
    -->
    <div class="tcg-card-thumb__overlay">
      <slot name="overlay" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import { useHoloPointer } from '@/composables/useHoloPointer'
import {
  toHoloDataRarity,
  toHoloSubtypes,
  toHoloSupertype
} from '@/lib/holo-rarity'

const props = withDefaults(
  defineProps<{
    /** URL completo dell'immagine della carta. */
    src?: string | null
    /** Testo alternativo (es. `card.card_name`). */
    alt?: string
    /** Rarità (qualsiasi stringa). Viene mappata a `data-rarity` simey. */
    rarity?: string | null
    /** Sottotipi della carta (array o stringa). Influisce sui clip-path. */
    subtypes?: string | string[] | null
    /** "pokemon" | "trainer" | "energy" — controlla i clip-path per trainer. */
    supertype?: string | null
    /** Numero carta (lowercase) — usato per casi speciali (es. trainer gallery). */
    number?: string | null
    /**
     * Se `false`, disattiva il tracking del puntatore e gli effetti restano
     * statici (utile per liste con tantissime thumb sotto la stessa pagina).
     */
    interactive?: boolean
  }>(),
  { interactive: true }
)

const hostRef = ref<HTMLElement | null>(null)
const broken = ref(false)

/**
 * Si rilancia quando l'<img> fallisce. Il parent può ascoltare per provare
 * un'altra URL (fallback lingua → English nelle pagine catalogo) senza
 * dover ricreare il componente. Se nessuno ascolta, internamente il thumb
 * mostra comunque il placeholder "no image".
 */
const emit = defineEmits<{ error: [event: Event] }>()

function onImgError(e: Event) {
  broken.value = true
  emit('error', e)
}

watch(
  () => props.src,
  () => {
    broken.value = false
  }
)

const dataRarity = computed(() => toHoloDataRarity(props.rarity))
const dataSubtypes = computed(() => toHoloSubtypes(props.subtypes))
const dataSupertype = computed(() => toHoloSupertype(props.supertype))
const dataNumber = computed(() => (props.number ?? '').toLowerCase())

const { interacting, styleVars, onPointerMove, onPointerLeave, onTouchMove } =
  useHoloPointer()

// Cosmos uses a per-card random background offset so adjacent cards don't
// share the same starry pattern. Picked once per component instance.
const cosmosSeed = {
  x: Math.floor(Math.random() * 734),
  y: Math.floor(Math.random() * 1280)
}

const cardStyle = computed<CSSProperties>(() => {
  if (!props.interactive) {
    return {
      '--cosmosbg': `${cosmosSeed.x}px ${cosmosSeed.y}px`
    } as CSSProperties
  }
  return {
    ...styleVars.value,
    '--cosmosbg': `${cosmosSeed.x}px ${cosmosSeed.y}px`
  } as CSSProperties
})

function onMove(e: PointerEvent) {
  if (!props.interactive) return
  onPointerMove(e, hostRef.value)
}
function onTouch(e: TouchEvent) {
  if (!props.interactive) return
  onTouchMove(e, hostRef.value)
}
function onLeave() {
  if (!props.interactive) return
  onPointerLeave()
}
</script>

<style scoped>
/*
 * Il wrapper esterno gestisce SOLO sizing — gli effetti holo (border-radius
 * autentico, shadow, scale 3D) vivono dentro `.holo-card` e provengono dai
 * CSS importati globalmente.
 *
 * NOTA: niente `contain` né `overflow: hidden` qui — la carta su hover sale
 * di z-index a 120 (base.css) per passare sopra le sorelle nella griglia,
 * e fa anche scale + box-shadow glow. Un containing block bloccherebbe
 * entrambi.
 */

/* Forza tutta la catena simey (.holo-card → __translater → __rotator →
 * __front → img) a riempire esattamente il wrapper aspect-[5/7].
 *
 * Senza questo override base.css impone `aspect-ratio: var(--card-aspect)`
 * (0.718) su rotator/front/img mentre il wrapper è 5/7 (0.714): risultato
 * un gap di ~1.5px in basso e la carta che sembra "shrinkata" nella cella.
 *
 * La distorsione visiva della bitmap (0.5% di stretch orizzontale) è sotto
 * la soglia percettibile su carte TCG. I clip-path simey (stage/trainer)
 * restano accurati entro frazioni di pixel. */
.tcg-card-thumb :deep(.holo-card),
.tcg-card-thumb :deep(.holo-card__translater),
.tcg-card-thumb :deep(.holo-card__rotator),
.tcg-card-thumb :deep(.holo-card__front),
.tcg-card-thumb :deep(.holo-card__front > *) {
  width: 100%;
  height: 100%;
  aspect-ratio: auto;
}
.tcg-card-thumb :deep(.holo-card) {
  margin: 0;
  pointer-events: auto;
}
/* Garantisce il fill dell'immagine senza letterboxing su sorgenti che
 * dovessero avere aspect leggermente diverso (es. card scan vs print). */
.tcg-card-thumb :deep(.holo-card__front > img) {
  object-fit: cover;
  object-position: center;
}

/* Il `button.holo-card__rotator` ha appearance di base — qui togliamo focus
 * outline e gradient per non rovinare la holo. Lo focus accessibile è
 * gestito dal contenitore parent (es. RouterLink). */
.tcg-card-thumb :deep(.holo-card__rotator) {
  cursor: inherit;
}
.tcg-card-thumb :deep(.holo-card__rotator:focus) {
  outline: none;
}

/*
 * Carte SENZA rarità holo mappata (common, uncommon, ecc.):
 * neutralizziamo il "TCG card halo" (golden edge + colored glow) che simey
 * applica negli stati `.active` e `:focus`. Su una common quell'alone
 * dorato/cyan sembra fuori posto — la carta finisce per assomigliare a
 * una holo rare anche quando non lo è.
 *
 * Le carte con un `data-rarity` mappato mantengono il glow autentico.
 * `data-rarity=""` è ciò che il nostro mapper emette per le rarità non
 * riconosciute (vedi `holo-rarity.ts`).
 */
.tcg-card-thumb :deep(.holo-card[data-rarity=""].active .holo-card__rotator),
.tcg-card-thumb :deep(.holo-card[data-rarity=""] .holo-card__rotator:focus) {
  box-shadow:
    0 0 3px -1px transparent,
    0 0 2px 1px transparent,
    0 0 5px 0px transparent,
    0px 10px 20px -5px black,
    0 2px 15px -5px black,
    0 0 20px 0px transparent;
}

/* Layer overlay che ricalca l'area visibile della carta. Z-index alto
 * perché `.holo-card.interacting` arriva fino a ~210 (calc(scale*120)
 * con scale~1.75 nel pop-up). Non blocca i pointer events per default;
 * i child possono opt-in con `pointer-events-auto`. */
.tcg-card-thumb__overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 250;
}

</style>
