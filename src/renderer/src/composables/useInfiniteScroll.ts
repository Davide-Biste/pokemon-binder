import { ref, computed, onBeforeUnmount, watch, type Ref } from 'vue'

interface UseInfiniteScrollOptions {
  /** How many items to show initially. */
  pageSize?: number
  /** How many items to add each time the sentinel becomes visible. */
  increment?: number
  /** Distance from viewport (in px) at which to trigger the next load. */
  rootMargin?: string
}

/**
 * Slices a reactive array and grows the visible window when a sentinel
 * element enters the viewport. Reset whenever the source length changes.
 */
export function useInfiniteScroll<T>(
  source: Ref<T[]>,
  options: UseInfiniteScrollOptions = {}
) {
  const { pageSize = 60, increment = 60, rootMargin = '400px' } = options

  const visibleCount = ref(pageSize)
  const sentinel = ref<HTMLElement | null>(null)

  const visibleItems = computed(() => source.value.slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < source.value.length)

  let observer: IntersectionObserver | null = null

  function loadMore() {
    if (!hasMore.value) return
    visibleCount.value = Math.min(visibleCount.value + increment, source.value.length)
  }

  function disconnect() {
    observer?.disconnect()
    observer = null
  }

  // Reset window whenever the underlying list changes (e.g. filters)
  watch(
    () => source.value.length,
    () => {
      visibleCount.value = pageSize
    }
  )

  // (Re)attach observer when the sentinel element mounts
  watch(sentinel, (el) => {
    disconnect()
    if (!el) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore()
      },
      { rootMargin }
    )
    observer.observe(el)
  })

  onBeforeUnmount(disconnect)

  return { visibleItems, sentinel, hasMore, loadMore }
}
