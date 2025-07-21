import { ref, computed, watch } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'

/**
 * Logic for the zoom control functionality in the viewport
 *
 * @param {Object} viewportStore - The store managing zoom and pan state
 * @returns {{
 *   zoomLevel: import('vue').Ref<number>,
 *   zoomIn: () => void,
 *   zoomOut: () => void,
 *   wheelZoom: (e: WheelEvent) => void,
 *   resetZoom: () => void,
 *   canZoomIn: import('vue').ComputedRef<boolean>,
 *   canZoomOut: import('vue').ComputedRef<boolean>,
 *   startDragging: (e: MouseEvent) => void
 * }}
 */
export function useZoomControl(viewportStore) {
  /**
   * Zoom level in percent (0–100+), used for display and manual adjustment
   */
  const zoomLevelInput = ref(Math.round(viewportStore.zoomLevel * 100))

  /**
   * Sync zoom input with store
   */
  watch(
    () => viewportStore.zoomLevel,
    (newZoom) => {
      zoomLevelInput.value = Math.round(newZoom * 100)
    },
  )

  /**
   * Whether zooming in is possible
   */
  const canZoomIn = computed(() => viewportStore.zoomLevel < viewportStore.maxZoomLevel)
  /**
   * Whether zooming out is possible
   */
  const canZoomOut = computed(() => viewportStore.zoomLevel > viewportStore.minZoomLevel)

  /**
   * Indicates whether the zoom slider is being dragged
   */
  const isDragging = ref(false)

  /**
   * Initial X coordinate when dragging starts
   */
  const startX = ref(0)

  /**
   * Increase zoom level by 10%
   */
  const zoomIn = () => {
    console.log('Zooming in')
    if (!canZoomIn.value) return
    viewportStore.setZoomLevel(viewportStore.zoomLevel + viewportConfig.defaultZoomIn)
  }

  /**
   * Decrease zoom level by 10%
   */
  const zoomOut = () => {
    if (!canZoomOut.value) return
    viewportStore.setZoomLevel(viewportStore.zoomLevel - viewportConfig.defaultZoomOut)
  }

  /**
   * Reset zoom and pan to defaults
   */
  const resetZoom = () => {
    viewportStore.resetZoom()
    viewportStore.resetPan()
  }

  /**
   * Zoom using mouse wheel
   *
   * @param {WheelEvent} event - The wheel event
   */
  const wheelZoom = (event) => {
    if (event.deltaY < 0) {
      zoomIn(viewportConfig.defaultZoomIn)
    } else if (event.deltaY > 0) {
      zoomOut(viewportConfig.defaultZoomOut)
    }
  }

  /**
   * Handle mouse movement while dragging to adjust zoom
   *
   * @param {MouseEvent} event
   */
  const onMouseMove = (event) => {
    const deltaX = event.clientX - startX.value
    const step = Math.round(deltaX / 3) // 3px = 1%
    const newLevel = Math.max(
      viewportStore.minZoomLevel * 100,
      Math.min(zoomLevelInput.value + step, viewportStore.maxZoomLevel * 100),
    )
    zoomLevelInput.value = newLevel
    viewportStore.setZoomLevel(newLevel / 100)
    startX.value = event.clientX
  }

  /**
   * Handle mouse release after dragging
   */
  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    isDragging.value = false
  }

  /**
   * Start dragging the zoom slider
   *
   * @param {MouseEvent} e
   */
  const startDragging = (event) => {
    event.preventDefault()
    isDragging.value = true
    startX.value = event.clientX
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return {
    zoomLevel: zoomLevelInput,
    zoomIn,
    zoomOut,
    wheelZoom,
    resetZoom,
    canZoomIn,
    canZoomOut,
    startDragging,
  }
}
