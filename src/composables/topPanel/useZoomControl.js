import { ref, computed, watch } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '../common/useMath'
import { useSendEvent } from '@/composables/common/useSendEvent'

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
 *   toggleZoomMode: (mode: string) => void
 * }}
 */
export function useZoomControl(viewportStore) {
  const { clamp, round } = useMath()

  /**
   * Zoom level in percent (0–100+), used for display and manual adjustment
   */
  const zoomLevelInput = ref(round(viewportStore.zoomLevel * 100))

  /**
   * Backing value for the zoom level input
   */
  const lastSyncedZoomInput = ref(zoomLevelInput.value)

  /**
   * Sync zoom input with store
   */
  watch(
    () => viewportStore.zoomLevel,
    (newZoom) => {
      const value = round(newZoom * 100)
      zoomLevelInput.value = value
      lastSyncedZoomInput.value = value
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
   * Current text width
   */
  const textWidth = ref(viewportStore.textWidth)

  /**
   * Increase zoom level
   *
   * @param {number} zoomDiff - Amount to increase zoom by
   */
  const zoomIn = (zoomDiff = viewportConfig.defaultZoomIn) => {
    if (!canZoomIn.value) return

    // Send event
    useSendEvent().sendEvent('buttonClicked', null, 'zoomIn', {
      zoomDiff: zoomDiff,
    })

    let newZoom = viewportStore.zoomLevel + zoomDiff
    newZoom = clamp(newZoom, viewportStore.minZoomLevel, viewportStore.maxZoomLevel)

    viewportStore.setZoomLevel(newZoom)
  }

  /**
   * Decrease zoom level
   *
   * @param {number} zoomDiff - Amount to decrease zoom by
   */
  const zoomOut = (zoomDiff = viewportConfig.defaultZoomOut) => {
    if (!canZoomOut.value) return

    // Send event
    useSendEvent().sendEvent('buttonClicked', null, 'zoomOut', {
      zoomDiff: zoomDiff,
    })

    let newZoom = viewportStore.zoomLevel - zoomDiff
    newZoom = clamp(newZoom, viewportStore.minZoomLevel, viewportStore.maxZoomLevel)

    viewportStore.setZoomLevel(newZoom)
  }

  /**
   * Reset zoom and pan to defaults
   */
  const resetZoom = () => {
    // Send event
    useSendEvent().sendEvent('buttonClicked', null, 'resetZoom', {})

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
    let zoomDiff = 0.01
    if (event.ctrlKey || event.metaKey) {
      zoomDiff = 0.1
    }

    if (event.deltaY < 0) {
      zoomIn(zoomDiff)
    } else if (event.deltaY > 0) {
      zoomOut(zoomDiff)
    }
  }

  /**
   * Just fill input but not apply
   */
  const onZoomInput = (event) => {
    const inputValue = event.target.value

    if (inputValue === '' || inputValue === '-') {
      zoomLevelInput.value = inputValue
      return
    }
    const newZoom = Number(inputValue)
    if (!Number.isNaN(newZoom)) zoomLevelInput.value = round(newZoom)
  }

  /**
   * Apply zoom level (Enter/blur)
   */
  const applyZoomFromInput = () => {
    let newZoom = Number(zoomLevelInput.value)
    if (Number.isNaN(newZoom)) {
      // ak nezmysel, vráť pôvodné
      zoomLevelInput.value = lastSyncedZoomInput.value
      return
    }

    newZoom = clamp(newZoom, viewportStore.minZoomLevel * 100, viewportStore.maxZoomLevel * 100)

    zoomLevelInput.value = newZoom
    lastSyncedZoomInput.value = newZoom
    viewportStore.setZoomLevel(newZoom / 100)
  }

  /**
   * Revert zoom input to last synced value
   */
  const revertZoomInput = () => {
    zoomLevelInput.value = lastSyncedZoomInput.value
  }

  /**
   * Toggle zoom mode
   * @param {string} mode - The zoom mode to set
   */
  const toggleZoomMode = (mode) => {
    if (mode === viewportStore.zoomMode) return

    viewportStore.zoomMode = mode
  }

  const setNewTextWidth = (newWidth) => {
    textWidth.value = newWidth
    viewportStore.textWidth = newWidth
  }

  const resetTextWidth = () => {
    viewportStore.textWidth = viewportConfig.defaultTextWidth
    textWidth.value = viewportStore.textWidth
  }

  return {
    zoomLevel: zoomLevelInput,
    zoomIn,
    zoomOut,
    wheelZoom,
    resetZoom,
    canZoomIn,
    canZoomOut,
    onZoomInput,
    applyZoomFromInput,
    revertZoomInput,
    toggleZoomMode,
    textWidth,
    setNewTextWidth,
    resetTextWidth,
  }
}
