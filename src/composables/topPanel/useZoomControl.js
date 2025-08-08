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
  const zoomIn = (zoomDiff = viewportConfig.defaultZoomOut) => {
    if (!canZoomIn.value) return
    viewportStore.setZoomLevel(viewportStore.zoomLevel + zoomDiff)
  }

  /**
   * Decrease zoom level by 10%
   */
  const zoomOut = (zoomDiff = viewportConfig.defaultZoomOut) => {
    if (!canZoomOut.value) return
    viewportStore.setZoomLevel(viewportStore.zoomLevel - zoomDiff)
  }

  /**
   * Reset zoom and pan to defaults
   */
  const resetZoom = () => {
    viewportStore.resetZoom()
    viewportStore.resetPan()
    viewportStore.shouldFitToScreen = true
  }

  /**
   * Zoom using mouse wheel
   *
   * @param {WheelEvent} event - The wheel event
   */
  const wheelZoom = (event) => {
    if (event.deltaY < 0) {
      zoomIn(0.01)
    } else if (event.deltaY > 0) {
      zoomOut(0.01)
    }
  }

  return {
    zoomLevel: zoomLevelInput,
    zoomIn,
    zoomOut,
    wheelZoom,
    resetZoom,
    canZoomIn,
    canZoomOut,
  }
}
