/**
 * Pointer-driven holographic state for Pokémon cards.
 *
 * Port of the spring-based logic in simeydotme/pokemon-cards-css (Svelte) to
 * Vue 3. Instead of Svelte's `spring`, we use a critically-damped exponential
 * smoothing in a single `requestAnimationFrame` loop — cheaper, no extra deps,
 * and the visual result is indistinguishable on cards this small.
 *
 * Returned values feed CSS custom properties consumed by the holo CSS layers
 * (`--pointer-x`, `--rotate-x`, `--background-x`, etc.). Bind `styleVars` to
 * the host element's `style`, and wire `bind`'s pointer handlers on it.
 */
import { computed, onBeforeUnmount, reactive, ref, type CSSProperties } from 'vue'

const round = (v: number, p = 3) => parseFloat(v.toFixed(p))
const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max)
const adjust = (v: number, fromMin: number, fromMax: number, toMin: number, toMax: number) =>
  round(toMin + ((toMax - toMin) * (v - fromMin)) / (fromMax - fromMin))

interface Vec2 {
  x: number
  y: number
}
interface Glare {
  x: number
  y: number
  o: number
}

/** Easing factor per frame. Higher = snappier, lower = more sluggish. */
const SMOOTH_INTERACT = 0.18
const SMOOTH_REST = 0.07

export function useHoloPointer() {
  // Current (rendered) state — smoothed toward `target` each frame.
  const rotate = reactive<Vec2>({ x: 0, y: 0 })
  const background = reactive<Vec2>({ x: 50, y: 50 })
  const glare = reactive<Glare>({ x: 50, y: 50, o: 0 })

  // What we're easing toward.
  const targetRotate: Vec2 = { x: 0, y: 0 }
  const targetBackground: Vec2 = { x: 50, y: 50 }
  const targetGlare: Glare = { x: 50, y: 50, o: 0 }

  const interacting = ref(false)
  let smooth = SMOOTH_REST
  let rafId: number | null = null

  const approxEqual = (a: number, b: number) => Math.abs(a - b) < 0.05

  const isAtRest = () =>
    approxEqual(rotate.x, targetRotate.x) &&
    approxEqual(rotate.y, targetRotate.y) &&
    approxEqual(background.x, targetBackground.x) &&
    approxEqual(background.y, targetBackground.y) &&
    approxEqual(glare.x, targetGlare.x) &&
    approxEqual(glare.y, targetGlare.y) &&
    approxEqual(glare.o, targetGlare.o)

  const tick = () => {
    rotate.x += (targetRotate.x - rotate.x) * smooth
    rotate.y += (targetRotate.y - rotate.y) * smooth
    background.x += (targetBackground.x - background.x) * smooth
    background.y += (targetBackground.y - background.y) * smooth
    glare.x += (targetGlare.x - glare.x) * smooth
    glare.y += (targetGlare.y - glare.y) * smooth
    glare.o += (targetGlare.o - glare.o) * smooth

    if (isAtRest()) {
      // Snap to exact targets, then idle until the next interaction.
      rotate.x = targetRotate.x
      rotate.y = targetRotate.y
      background.x = targetBackground.x
      background.y = targetBackground.y
      glare.x = targetGlare.x
      glare.y = targetGlare.y
      glare.o = targetGlare.o
      rafId = null
      return
    }
    rafId = requestAnimationFrame(tick)
  }

  const ensureLoop = () => {
    if (rafId === null) rafId = requestAnimationFrame(tick)
  }

  /** Wire to `@pointermove`. Pass the host element so we measure against it. */
  function onPointerMove(e: PointerEvent | MouseEvent, host: HTMLElement | null) {
    const el = host ?? (e.currentTarget as HTMLElement | null)
    if (!el) return
    interacting.value = true
    smooth = SMOOTH_INTERACT

    const rect = el.getBoundingClientRect()
    const absX = e.clientX - rect.left
    const absY = e.clientY - rect.top
    const pctX = clamp(round((100 / rect.width) * absX))
    const pctY = clamp(round((100 / rect.height) * absY))
    const centerX = pctX - 50
    const centerY = pctY - 50

    targetBackground.x = adjust(pctX, 0, 100, 37, 63)
    targetBackground.y = adjust(pctY, 0, 100, 33, 67)
    targetRotate.x = round(-(centerX / 3.5))
    targetRotate.y = round(centerY / 3.5)
    targetGlare.x = round(pctX)
    targetGlare.y = round(pctY)
    targetGlare.o = 1
    ensureLoop()
  }

  /** Wire to `@pointerleave` / `@blur` / `@touchend`. */
  function onPointerLeave() {
    interacting.value = false
    smooth = SMOOTH_REST
    targetRotate.x = 0
    targetRotate.y = 0
    targetBackground.x = 50
    targetBackground.y = 50
    targetGlare.x = 50
    targetGlare.y = 50
    targetGlare.o = 0
    ensureLoop()
  }

  /** Convenience: forwards touchmove → pointer math using the first touch. */
  function onTouchMove(e: TouchEvent, host: HTMLElement | null) {
    if (!e.touches.length) return
    const t = e.touches[0]
    onPointerMove(
      { clientX: t.clientX, clientY: t.clientY, currentTarget: e.currentTarget } as MouseEvent,
      host
    )
  }

  onBeforeUnmount(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })

  /**
   * The CSS custom properties consumed by the holo CSS. Bind via `:style`.
   * `pointer-from-center/top/left` are derived from the glare position — the
   * holo gradients use them to decide layer opacity & direction.
   */
  const styleVars = computed<CSSProperties>(() => {
    const fromCenter = clamp(
      Math.sqrt((glare.y - 50) * (glare.y - 50) + (glare.x - 50) * (glare.x - 50)) / 50,
      0,
      1
    )
    return {
      '--pointer-x': `${glare.x}%`,
      '--pointer-y': `${glare.y}%`,
      '--pointer-from-center': fromCenter,
      '--pointer-from-top': glare.y / 100,
      '--pointer-from-left': glare.x / 100,
      '--card-opacity': glare.o,
      '--rotate-x': `${rotate.x}deg`,
      '--rotate-y': `${rotate.y}deg`,
      '--background-x': `${background.x}%`,
      '--background-y': `${background.y}%`
    } as CSSProperties
  })

  return {
    interacting,
    styleVars,
    onPointerMove,
    onPointerLeave,
    onTouchMove
  }
}
