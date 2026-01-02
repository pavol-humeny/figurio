import { ref, computed, watch } from 'vue'
import { viewportConfig } from '@/config/viewportConfig'
import { useMath } from '../common/useMath'
import { globalConfig } from '@/config/globalConfig'
import { useApi } from '@/composables/common/useApi'
import { editorConfig } from '@/config/editorConfig'
const { addUserEvent } = useApi()
import { useToastModal } from '../modals/useToastModal'

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
export function useZoomControl(viewportStore, imageStore, t) {
  const { clamp, round } = useMath()
  const { showToastModal } = useToastModal()

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
   * Maximum physical content size in cm
   */
  const maxPhysicalContentSize = computed(() => {
    return viewportStore.maxPhysicalContentSize
  })

  /**
   * Whether zooming in is possible
   */
  const canZoomIn = computed(() => viewportStore.zoomLevel < viewportStore.maxZoomLevel)
  /**
   * Whether zooming out is possible
   */
  const canZoomOut = computed(() => viewportStore.zoomLevel > viewportStore.minZoomLevel)

  /**
   * Current physical content size in cm
   */
  const physicalContentSize = ref(viewportStore.physicalContentSize)

  /**
   * Increase zoom level
   *
   * @param {number} zoomDiff - Amount to increase zoom by
   */
  const zoomIn = (zoomDiff = viewportConfig.defaultZoomIn) => {
    if (!canZoomIn.value) return

    addUserEvent('buttonClicked', { button: 'zoomIn' })

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

    addUserEvent('buttonClicked', { button: 'zoomOut' })

    let newZoom = viewportStore.zoomLevel - zoomDiff
    newZoom = clamp(newZoom, viewportStore.minZoomLevel, viewportStore.maxZoomLevel)

    viewportStore.setZoomLevel(newZoom)
  }

  /**
   * Reset zoom and pan to defaults
   */
  const resetZoom = () => {
    addUserEvent('buttonClicked', { button: 'resetZoom' })

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

    addUserEvent('zoomModeToggle', { zoomMode: mode })

    // If it is physical zoom mode, show info toast for calibration needed
    if (mode === 'physical') {
      // Check if physical zoom was used before
      const physicalZoomUsed = localStorage.getItem(
        `${globalConfig.LOCAL_STORAGE_PREFIX}physicalZoomUsed`,
      )

      if (physicalZoomUsed !== 'true') {
        showToastModal(
          'info',
          t('topPanel.zoomControl.needCalibration.title'),
          t('topPanel.zoomControl.needCalibration.message'),
        )

        // Save to local storage that physical zoom was used
        localStorage.setItem(`${globalConfig.LOCAL_STORAGE_PREFIX}physicalZoomUsed`, 'true')
      }
    }

    imageStore.modificationFlag += 1
    viewportStore.setZoomMode(mode)
  }

  /**
   * Sets a new physical content size in cm
   */
  const setNewPhysicalContentSize = (newWidth) => {
    physicalContentSize.value = newWidth
    viewportStore.setPhysicalContentSize(newWidth)
  }

  /**
   * Resets physical content size to default from config
   */
  const resetPhysicalContentSize = () => {
    viewportStore.setPhysicalContentSize(globalConfig.physicalContentSize)
    physicalContentSize.value = viewportStore.physicalContentSize
  }

  /**
   * Timeout and interval references for hold action
   */
  const holdTimeout = ref(null)
  const holdInterval = ref(null)
  const isHolding = ref(false)

  /**
   * Starts the hold action to continuously call the provided action function
   *
   * @param {Function} action - Function to call repeatedly while holding
   */
  const startHold = (action) => {
    isHolding.value = false

    holdTimeout.value = setTimeout(() => {
      // Holding started
      isHolding.value = true

      // Call immediately in hold mode
      action(0.05)

      // Continue repeatedly
      holdInterval.value = setInterval(() => {
        action(0.05)
      }, editorConfig.holdButtonInterval)
    }, editorConfig.holdButtonTimeout)
  }

  /**
   * Stops the hold action by clearing timeouts and intervals
   */
  const stopHold = () => {
    clearTimeout(holdTimeout.value)
    clearInterval(holdInterval.value)
    holdTimeout.value = null
    holdInterval.value = null
  }

  /**
   * Handle mouseup for zoom buttons
   */
  const handleClickOrHold = (action) => {
    // Stop hold first
    stopHold()

    // If not holding -> normal click
    if (!isHolding.value) {
      action(0.1)
    }

    // Reset flag
    isHolding.value = false
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
    physicalContentSize,
    setNewPhysicalContentSize,
    resetPhysicalContentSize,
    maxPhysicalContentSize,
    startHold,
    stopHold,
    handleClickOrHold,
  }
}
