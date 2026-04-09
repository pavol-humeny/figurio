/**
 * @file: useCropTool.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing the crop tool in the editor, including logic for crop box manipulation, position constraints, manual and automatic cropping, and synchronization of crop parameters with external components.
 */
import { useMath } from '@/composables/common/useMath'
import { computed, onMounted, ref, watch } from 'vue'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useToastModal } from '../modals/useToastModal'
import { editorConfig } from '@/config/editorConfig'
import { useImagePipeline } from '../editor/useImagePipeline'
import { useApi } from '@/composables/common/useApi'
import { useConsole } from '@/composables/common/useConsole.js'
const { addUserEvent } = useApi()
const { log, warn } = useConsole()

/**
 * Reactive state of the crop box used for user interactions
 * @type {import('vue').Ref<{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   dragging: boolean,
 *   resizing: boolean,
 *   resizeDir: string,
 *   startX: number,
 *   startY: number
 * }>}
 */
const cropBox = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  dragging: false,
  resizing: false,
  resizeDir: '',
  startX: 0,
  startY: 0,
})

/**
 * Whether to suppress automatic crop reset on image changes when applying rasterization
 */
const suppressCropReset = ref(false)

/**
 * Manual indents for the crop box
 */
const manualIndents = ref({
  topIndent: 0,
  rightIndent: 0,
  bottomIndent: 0,
  leftIndent: 0,
  topIndentMin: 0,
  topIndentMax: Infinity,
  rightIndentMin: 0,
  rightIndentMax: Infinity,
  bottomIndentMin: 0,
  bottomIndentMax: Infinity,
  leftIndentMin: 0,
  leftIndentMax: Infinity,
})

/**
 * Last canny crop box used for auto crop calculations
 */
const lastCannyCrop = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

/**
 * Internal float accumulators for width/height (avoid rounding drift)
 */
const widthAccumulator = ref(0)
const heightAccumulator = ref(0)

/**
 * Crop sensitivity level for auto crop
 */
const cropSensitivityLevel = ref(2)

/**
 * Logic for crop tool functionality, including crop box manipulation and position constraints
 *
 * @param {object} imageStore - Store containing image state and metadata
 * @param {object} viewportStore - Store managing viewport state
 * @param {object} editorStore - Store for currently selected tool/tab
 * @param {object} historyStore - Store for undo/redo history
 * @param {object} uiStore - Store for UI state
 * @param {function} t - Translation function (vue-i18n)
 */
export function useCropTool(imageStore, viewportStore, editorStore, historyStore, uiStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()
  const { clamp, round } = useMath()
  const { renderUpTo, getEffectiveCanvas } = useImagePipeline(imageStore, uiStore)

  /**
   * Update last canny crop to current crop box
   */
  const updateLastCannyCrop = () => {
    lastCannyCrop.value.width = cropBox.value.width
    lastCannyCrop.value.height = cropBox.value.height
    lastCannyCrop.value.x = cropBox.value.x
    lastCannyCrop.value.y = cropBox.value.y
  }

  /**
   * Whether the fit crop was already applied
   */
  const fitCropApplied = ref(false)

  // -------------------------------
  // Manual crop
  // -------------------------------

  /**
   * Whether the manual adjustments are linked (all sides change together)
   */
  const isManualAdjustmentsLinked = ref(false)

  /**
   * Old manual indents for comparison when one is changed
   */
  const oldManualIndents = ref({ ...manualIndents.value })

  const calculateMaxMinIndents = () => {
    const totalWidth = imageStore.fileDimensions.width
    const totalHeight = imageStore.fileDimensions.height

    const top = manualIndents.value.topIndent
    const right = manualIndents.value.rightIndent
    const bottom = manualIndents.value.bottomIndent
    const left = manualIndents.value.leftIndent

    if (isManualAdjustmentsLinked.value) {
      // Helper to compute min for a single indent
      const getMin = (value, others) => {
        // If any other indent is less than or equal to 0, min is 0
        return others.some((v) => v <= 0) ? value : 0
      }

      manualIndents.value.topIndentMin = getMin(top, [right, bottom, left])
      manualIndents.value.rightIndentMin = getMin(right, [top, bottom, left])
      manualIndents.value.bottomIndentMin = getMin(bottom, [top, right, left])
      manualIndents.value.leftIndentMin = getMin(left, [top, right, bottom])
    } else {
      manualIndents.value.topIndentMin = 0
      manualIndents.value.rightIndentMin = 0
      manualIndents.value.bottomIndentMin = 0
      manualIndents.value.leftIndentMin = 0
    }
    // Set max so that the image size is not exceeded
    manualIndents.value.topIndentMax =
      totalHeight - manualIndents.value.bottomIndent - editorConfig.minCropSize
    manualIndents.value.rightIndentMax =
      totalWidth - manualIndents.value.leftIndent - editorConfig.minCropSize
    manualIndents.value.bottomIndentMax =
      totalHeight - manualIndents.value.topIndent - editorConfig.minCropSize
    manualIndents.value.leftIndentMax =
      totalWidth - manualIndents.value.rightIndent - editorConfig.minCropSize

    if (isManualAdjustmentsLinked.value) {
      // Update max values if width or height is on min size
      const currentWidth = totalWidth - left - right
      const currentHeight = totalHeight - top - bottom

      if (currentWidth <= editorConfig.minCropSize) {
        manualIndents.value.topIndentMax = manualIndents.value.topIndent
        manualIndents.value.bottomIndentMax = manualIndents.value.bottomIndent
      } else if (currentHeight <= editorConfig.minCropSize) {
        manualIndents.value.leftIndentMax = manualIndents.value.leftIndent
        manualIndents.value.rightIndentMax = manualIndents.value.rightIndent
      }
    }
  }

  /**
   * Watch for changes in isManualAdjustmentsLinked and recalculate max/min indents
   */
  watch(isManualAdjustmentsLinked, () => {
    calculateMaxMinIndents()
  })

  /**
   * Update all indents if they are linked and one was changed
   */
  const manualIndentsWereChangedManually = async () => {
    if (isManualAdjustmentsLinked.value) {
      // Find which indent was changed
      let changedEdge = null
      let delta = 0

      const edges = ['topIndent', 'rightIndent', 'bottomIndent', 'leftIndent']
      // Check which edge changed
      for (let edge of edges) {
        if (manualIndents.value[edge] > oldManualIndents.value[edge]) {
          changedEdge = edge
          delta = 1
          break
        } else if (manualIndents.value[edge] < oldManualIndents.value[edge]) {
          changedEdge = edge
          delta = -1
          break
        }
      }

      // No edge changed (should not happen)
      if (!changedEdge) {
        updateLastCannyCrop()
        return
      }

      // Check if any other linked indent would exceed min/max
      const otherEdges = edges.filter((e) => e !== changedEdge)
      let exceeded = false
      otherEdges.forEach((edge) => {
        const tmp = manualIndents.value[edge] + delta
        const min = manualIndents.value[edge + 'Min']
        const max = manualIndents.value[edge + 'Max']
        if (tmp < min || tmp > max) exceeded = true
      })

      // If any other linked indent would exceed min/max, recalculate and return
      if (exceeded) {
        calculateMaxMinIndents()
        return
      }

      // Apply delta to all other linked edges
      otherEdges.forEach((edge) => {
        manualIndents.value[edge] += delta
      })

      oldManualIndents.value = { ...manualIndents.value }
    }

    calculateMaxMinIndents()

    updateLastCannyCrop()
  }

  /**
   * Watch for changes in manualIndents and recalculate cropBox
   */
  watch(
    manualIndents,
    (newIndents) => {
      cropBox.value.x = newIndents.leftIndent
      cropBox.value.y = newIndents.topIndent
      cropBox.value.width =
        imageStore.fileDimensions.width - newIndents.rightIndent - newIndents.leftIndent
      cropBox.value.height =
        imageStore.fileDimensions.height - newIndents.bottomIndent - newIndents.topIndent
    },
    { deep: true },
  )

  /**
   * Watch for changes in image dimensions and update crop box accordingly
   */
  watch(
    () => imageStore.fileDimensions,
    (fileDimensions) => {
      if (suppressCropReset.value) return

      if (fileDimensions.width && fileDimensions.height) {
        cropBox.value.width = fileDimensions.width
        cropBox.value.height = fileDimensions.height
        cropBox.value.x = 0
        cropBox.value.y = 0

        fitCropApplied.value = false

        // Set max for indents
        manualIndents.value.topIndentMax = fileDimensions.height
        manualIndents.value.rightIndentMax = fileDimensions.width
        manualIndents.value.bottomIndentMax = fileDimensions.height
        manualIndents.value.leftIndentMax = fileDimensions.width

        widthAccumulator.value = cropBox.value.width
        heightAccumulator.value = cropBox.value.height

        // Last canny crop reset
        updateLastCannyCrop()
      }
    },
    { immediate: true, deep: true },
  )

  /**
   * Maximum allowed crop position based on image dimensions
   */
  const maxCropPositionX = computed(() => {
    return imageStore.fileDimensions.width - editorConfig.minCropSize
  })
  const maxCropPositionY = computed(() => {
    return imageStore.fileDimensions.height - editorConfig.minCropSize
  })

  /**
   * Position of the crop box relative to the image
   */
  const cropPositionX = computed({
    get: () => cropBox.value.x,
    set: (value) => {
      cropBox.value.x = round(clamp(value, 0, maxCropPositionX.value))
    },
  })
  const cropPositionY = computed({
    get: () => cropBox.value.y,
    set: (value) => {
      cropBox.value.y = round(clamp(value, 0, maxCropPositionY.value))
    },
  })

  /**
   * Temporary refs to store crop x and y for syncing with external components
   */
  const tmpCropX = ref(cropBox.value.x)
  const tmpCropY = ref(cropBox.value.y)

  /**
   * Watch for changes in crop x and y to update temporary refs
   */
  watch(
    () => cropBox.value.x,
    (value) => {
      tmpCropX.value = value
    },
  )
  watch(
    () => cropBox.value.y,
    (value) => {
      tmpCropY.value = value
    },
  )

  /**
   * Ref for crop width and height input field (used for syncing external components)
   */
  const widthInputRef = ref(null)
  const heightInputRef = ref(null)

  /**
   * Ref for crop position inputs field
   */
  const positionXInputRef = ref(null)
  const positionYInputRef = ref(null)

  /**
   * Whether width and height should be linked to preserve aspect ratio
   */
  const isDimensionsLinked = ref(true)

  /**
   * Maximum crop width and height based on current image dimensions and position
   */
  const maxCropWidth = computed(() => {
    const availableWidth = imageStore.fileDimensions.width - cropBox.value.x

    const availableHeight = imageStore.fileDimensions.height - cropBox.value.y

    if (!isDimensionsLinked.value) {
      return availableWidth
    }

    const aspectRatio = widthAccumulator.value / heightAccumulator.value

    // width limited by horizontal bound
    const widthFromWidth = availableWidth

    // width limited by vertical bound (via height constraint)
    const widthFromHeight = availableHeight * aspectRatio

    return round(Math.min(widthFromWidth, widthFromHeight))
  })

  const maxCropHeight = computed(() => {
    const availableWidth = imageStore.fileDimensions.width - cropBox.value.x

    const availableHeight = imageStore.fileDimensions.height - cropBox.value.y

    if (!isDimensionsLinked.value) {
      return availableHeight
    }

    const aspectRatio = heightAccumulator.value / widthAccumulator.value

    const heightFromHeight = availableHeight
    const heightFromWidth = availableWidth * aspectRatio

    return round(Math.min(heightFromHeight, heightFromWidth))
  })

  /**
   * Minimum crop width and height based on editorConfig and aspect ratio if dimensions are linked
   */
  const minCropWidth = computed(() => {
    if (isDimensionsLinked.value) {
      const aspectRatio = cropBox.value.width / cropBox.value.height
      const heightBasedMinWidth = round(editorConfig.minCropSize * aspectRatio)
      return Math.max(editorConfig.minCropSize, heightBasedMinWidth)
    } else {
      return editorConfig.minCropSize
    }
  })

  const minCropHeight = computed(() => {
    if (isDimensionsLinked.value) {
      const aspectRatio = cropBox.value.height / cropBox.value.width
      const widthBasedMinHeight = round(editorConfig.minCropSize * aspectRatio)
      return Math.max(editorConfig.minCropSize, widthBasedMinHeight)
    } else {
      return editorConfig.minCropSize
    }
  })

  /**
   * Computed properties for crop width and height with setters to update crop box
   */
  const cropWidth = computed({
    get: () => cropBox.value.width,
    set: (value) => {
      cropBox.value.width = round(clamp(value, 0, maxCropWidth.value))
    },
  })
  const cropHeight = computed({
    get: () => cropBox.value.height,
    set: (value) => {
      cropBox.value.height = round(clamp(value, 0, maxCropHeight.value))
    },
  })

  /**
   * Temporary refs to store crop width and height for syncing with external components
   */
  const tmpCropWidth = ref(cropBox.value.width)
  const tmpCropHeight = ref(cropBox.value.height)

  /**
   * Watch for changes in crop width and height to update temporary refs
   */
  watch(
    () => cropBox.value.width,
    (value) => {
      tmpCropWidth.value = value
    },
  )
  watch(
    () => cropBox.value.height,
    (value) => {
      tmpCropHeight.value = value
    },
  )

  /**
   * Update crop dimensions based on input values
   * @param {'width'|'height'} key - Dimension to update
   * @param {number} value - New dimension value
   */
  const updateDimension = (key, value) => {
    const originalWidth = widthAccumulator.value
    const originalHeight = heightAccumulator.value

    if (key === 'width') {
      const clampedWidth = clamp(value, minCropWidth.value, maxCropWidth.value)

      if (isDimensionsLinked.value && originalWidth > 0) {
        const aspectRatio = originalHeight / originalWidth

        widthAccumulator.value = clampedWidth
        heightAccumulator.value = clamp(
          clampedWidth * aspectRatio,
          minCropHeight.value,
          maxCropHeight.value,
        )
      } else {
        widthAccumulator.value = clampedWidth
      }
    }

    if (key === 'height') {
      const clampedHeight = clamp(value, minCropHeight.value, maxCropHeight.value)

      if (isDimensionsLinked.value && originalHeight > 0) {
        const aspectRatio = originalWidth / originalHeight

        heightAccumulator.value = clampedHeight
        widthAccumulator.value = clamp(
          clampedHeight * aspectRatio,
          minCropWidth.value,
          maxCropWidth.value,
        )
      } else {
        heightAccumulator.value = clampedHeight
      }
    }

    // až teraz round pre UI
    cropBox.value.width = round(widthAccumulator.value)
    cropBox.value.height = round(heightAccumulator.value)

    updateLastCannyCrop()
  }

  /**
   * Update crop position based on input values
   * @param {'x'|'y'} key - Position to update
   * @param {number} value - New position value
   */
  const updatePosition = (key, value) => {
    if (key === 'x') {
      cropBox.value.x = round(clamp(value, 0, maxCropPositionX.value))
      if (cropBox.value.x + cropBox.value.width > imageStore.fileDimensions.width) {
        cropBox.value.width = imageStore.fileDimensions.width - cropBox.value.x
      }
    } else if (key === 'y') {
      cropBox.value.y = round(clamp(value, 0, maxCropPositionY.value))
      if (cropBox.value.y + cropBox.value.height > imageStore.fileDimensions.height) {
        cropBox.value.height = imageStore.fileDimensions.height - cropBox.value.y
      }
    }
    // nextTick(() => {
    //   positionXInputRef.value.setValue(cropPositionX.value)
    //   positionYInputRef.value.setValue(cropPositionY.value)
    // })

    updateLastCannyCrop()
  }

  /**
   * Get pointer coordinates from mouse or touch event.
   * @param {MouseEvent|TouchEvent} event
   * @returns {{x:number,y:number}|null}
   */
  const getPointerPosition = (event) => {
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY }
    }

    if (event.changedTouches && event.changedTouches.length > 0) {
      return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }
    }

    if ('clientX' in event && 'clientY' in event) {
      return { x: event.clientX, y: event.clientY }
    }

    return null
  }

  /**
   * Start panning the crop box.
   * @param {MouseEvent|TouchEvent} event - Pointer event
   */
  const startPan = (event) => {
    const isTouch = event.type?.startsWith('touch')
    if (!isTouch && event.button === 1) return
    if (event.cancelable) event.preventDefault()

    const pointer = getPointerPosition(event)
    if (!pointer) return

    cropBox.value.dragging = true
    cropBox.value.startX = pointer.x
    cropBox.value.startY = pointer.y

    let remainingDx = 0
    let remainingDy = 0

    const onPointerMove = (e) => {
      if (e.cancelable) e.preventDefault()
      const nextPointer = getPointerPosition(e)
      if (!nextPointer) return

      // If not pressing left mouse button during mouse move, end dragging (prevents stuck crop box when mouse is released outside of window)
      if (e.type.startsWith('mouse') && (e.buttons & 1) === 0) {
        onPointerUp()
        return
      }

      // Compute raw delta + remaining for smooth movement
      let rawDx = (nextPointer.x - cropBox.value.startX) / viewportStore.realZoomLevel + remainingDx
      let rawDy = (nextPointer.y - cropBox.value.startY) / viewportStore.realZoomLevel + remainingDy

      // Round to whole pixels
      const dx = Math.round(rawDx)
      const dy = Math.round(rawDy)

      // Save remaining for next move
      remainingDx = rawDx - dx
      remainingDy = rawDy - dy

      cropBox.value.x = clamp(
        cropBox.value.x + dx,
        0,
        imageStore.fileDimensions.width - cropBox.value.width,
      )

      cropBox.value.y = clamp(
        cropBox.value.y + dy,
        0,
        imageStore.fileDimensions.height - cropBox.value.height,
      )

      cropBox.value.startX = nextPointer.x
      cropBox.value.startY = nextPointer.y
    }

    const onPointerUp = () => {
      cropBox.value.dragging = false

      // Round crop box
      cropBox.value.x = round(cropBox.value.x)
      cropBox.value.y = round(cropBox.value.y)

      document.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('mouseup', onPointerUp)
      document.removeEventListener('touchmove', onPointerMove)
      document.removeEventListener('touchend', onPointerUp)
      document.removeEventListener('touchcancel', onPointerUp)

      updateLastCannyCrop()
    }

    document.addEventListener('mousemove', onPointerMove)
    document.addEventListener('mouseup', onPointerUp)
    document.addEventListener('touchmove', onPointerMove, { passive: false })
    document.addEventListener('touchend', onPointerUp)
    document.addEventListener('touchcancel', onPointerUp)
  }

  /**
   * Start resizing the crop box from a specific direction
   * @param {MouseEvent|TouchEvent} e - Pointer event
   * @param {'top'|'bottom'|'left'|'right'|'top-left'|'top-right'|'bottom-left'|'bottom-right'} direction - Resize direction
   */
  const startResize = (e, direction) => {
    if (e.cancelable) e.preventDefault()
    e.stopPropagation()

    const startPointer = getPointerPosition(e)
    if (!startPointer) return

    cropBox.value.resizing = true
    cropBox.value.resizeDir = direction
    cropBox.value.startX = startPointer.x
    cropBox.value.startY = startPointer.y

    let remainingDx = 0
    let remainingDy = 0

    // Store the absolute initial state at the moment the user starts resizing
    const initialX = cropBox.value.x
    const initialY = cropBox.value.y
    const initialWidth = cropBox.value.width
    const initialHeight = cropBox.value.height
    const initialAspectRatio = initialWidth / initialHeight
    const initialRight = initialX + initialWidth
    const initialBottom = initialY + initialHeight

    // Store starting pointer position for Shift calculations
    const startMouseX = startPointer.x


    /**
     * Handle pointer move during resizing
     */
    const onPointerMove = (ev) => {
      if (ev.cancelable) ev.preventDefault()
      const pointer = getPointerPosition(ev)
      if (!pointer) return

      const dx = (pointer.x - cropBox.value.startX) / viewportStore.realZoomLevel + remainingDx
      const dy = (pointer.y - cropBox.value.startY) / viewportStore.realZoomLevel + remainingDy

      const totalDx = (pointer.x - startMouseX) / viewportStore.realZoomLevel
      const shiftDelta = totalDx

      // Round to whole pixels
      const dxNorm = Math.round(dx)
      const dyNorm = Math.round(dy)

      // Save remaining values for smooth dragging
      remainingDx = dx - dxNorm
      remainingDy = dy - dyNorm

      const minValue = editorConfig.minCropSize

      const altNow = ev.altKey || ev.metaKey
      const shiftNow = ev.shiftKey

      let isShiftKey = shiftNow
      let isAltKey = altNow

      if (direction === 'topright') {
        let newWidth
        let newHeight
        let newX
        let newY

        const originalX = cropBox.value.x
        const originalY = cropBox.value.y
        const originalWidth = cropBox.value.width
        const originalHeight = cropBox.value.height

        const imgW = imageStore.fileDimensions.width
        const imgH = imageStore.fileDimensions.height

        if (isAltKey && !isShiftKey) {
          // Resize from center diagonally
          let tmpX = originalX - dxNorm
          let tmpWidth = originalWidth + 2 * dxNorm

          let tmpY = originalY + dyNorm
          let tmpHeight = originalHeight - 2 * dyNorm

          newX = tmpX
          newWidth = tmpWidth
          newY = tmpY
          newHeight = tmpHeight

          // Horizontal bounds
          if (newX < 0) {
            newX = 0
            newWidth = originalWidth + 2 * originalX
          }

          if (newX + newWidth > imgW) {
            const diff = imgW - (originalX + originalWidth)
            newX = originalX - diff
            newWidth = originalWidth + 2 * diff
          }

          // Vertical bounds
          if (newY < 0) {
            newY = 0
            newHeight = originalHeight + 2 * originalY
          }

          if (newY + newHeight > imgH) {
            const diff = imgH - (originalY + originalHeight)
            newY = originalY - diff
            newHeight = originalHeight + 2 * diff
          }

          // Minimum constraints
          if (newWidth <= minValue) {
            newWidth = minValue
            newX = originalX + originalWidth - minValue
          }

          if (newHeight <= minValue) {
            newHeight = minValue
            newY = originalY + originalHeight - minValue
          }
        } else {
          // Normal: right and top edges move
          const originalBottom = originalY + originalHeight

          newX = originalX

          if (isShiftKey) {
            const desiredWidth = initialWidth + shiftDelta
            const maxWidth = Math.min(imgW - initialX, initialBottom * initialAspectRatio)
            newWidth = Math.min(Math.max(desiredWidth, minValue), maxWidth)
            newHeight = newWidth / initialAspectRatio
            newY = initialBottom - newHeight
            newX = initialX
          } else {
            newWidth = originalWidth + dxNorm
            newY = originalY + dyNorm
            newHeight = originalHeight - dyNorm

            // Horizontal bounds
            if (newX + newWidth > imgW) {
              newWidth = imgW - originalX
            }

            if (newWidth <= minValue) {
              newWidth = minValue
            }

            // Vertical bounds
            if (newY < 0) {
              newY = 0
              newHeight = originalBottom - newY
            }

            if (newHeight <= minValue) {
              newHeight = minValue
              newY = originalBottom - minValue
            }
          }
        }

        cropBox.value.width = newWidth
        cropBox.value.height = newHeight
        cropBox.value.x = newX
        cropBox.value.y = newY
      }

      if (direction === 'bottomright') {
        let newWidth
        let newHeight
        let newX
        let newY

        const originalX = cropBox.value.x
        const originalY = cropBox.value.y
        const originalWidth = cropBox.value.width
        const originalHeight = cropBox.value.height

        const imgW = imageStore.fileDimensions.width
        const imgH = imageStore.fileDimensions.height

        if (isAltKey && !isShiftKey) {
          // Resize from center
          newX = originalX - dxNorm
          newWidth = originalWidth + 2 * dxNorm
          newY = originalY - dyNorm
          newHeight = originalHeight + 2 * dyNorm

          // Horizontal bounds
          if (newX < 0) {
            newX = 0
            newWidth = originalWidth + 2 * originalX
          }
          if (newX + newWidth > imgW) {
            const diff = imgW - (originalX + originalWidth)
            newX = originalX - diff
            newWidth = originalWidth + 2 * diff
          }

          // Vertical bounds
          if (newY < 0) {
            newY = 0
            newHeight = originalHeight + 2 * originalY
          }
          if (newY + newHeight > imgH) {
            const diff = imgH - (originalY + originalHeight)
            newY = originalY - diff
            newHeight = originalHeight + 2 * diff
          }

          // Minimum constraints
          if (newWidth <= minValue) {
            newWidth = minValue
            newX = originalX + originalWidth / 2 - minValue / 2
          }
          if (newHeight <= minValue) {
            newHeight = minValue
            newY = originalY + originalHeight / 2 - minValue / 2
          }
        } else {
          // Normal resize from bottom right
          newX = originalX
          newY = originalY

          if (isShiftKey) {
            const desiredWidth = initialWidth + shiftDelta
            const maxWidth = Math.min(imgW - initialX, (imgH - initialY) * initialAspectRatio)
            newWidth = Math.min(Math.max(desiredWidth, minValue), maxWidth)
            newHeight = newWidth / initialAspectRatio
            newX = initialX
            newY = initialY
          } else {
            // Free resize
            newWidth = originalWidth + dxNorm
            newHeight = originalHeight + dyNorm

            // Apply bounds checks
            if (newX + newWidth > imgW) newWidth = imgW - newX
            if (newWidth <= minValue) newWidth = minValue

            if (newY + newHeight > imgH) newHeight = imgH - newY
            if (newHeight <= minValue) newHeight = minValue
          }
        }

        cropBox.value.width = newWidth
        cropBox.value.height = newHeight
        cropBox.value.x = newX
        cropBox.value.y = newY
      }

      if (direction === 'topleft') {
        let newWidth, newHeight, newX, newY
        const originalX = cropBox.value.x
        const originalY = cropBox.value.y
        const originalWidth = cropBox.value.width
        const originalHeight = cropBox.value.height
        const originalRight = originalX + originalWidth
        const originalBottom = originalY + originalHeight

        const imgW = imageStore.fileDimensions.width
        const imgH = imageStore.fileDimensions.height

        if (isAltKey && !isShiftKey) {
          // Resize from center symmetrically
          newX = originalX + dxNorm
          newWidth = originalWidth - 2 * dxNorm
          newY = originalY + dyNorm
          newHeight = originalHeight - 2 * dyNorm

          // Boundary checks for Alt resize
          if (newX < 0) {
            newX = 0
            newWidth = originalWidth + 2 * originalX
          }
          if (newX + newWidth > imgW) {
            const diff = imgW - originalRight
            newX = originalX - diff
            newWidth = originalWidth + 2 * diff
          }
          if (newY < 0) {
            newY = 0
            newHeight = originalHeight + 2 * originalY
          }
          if (newY + newHeight > imgH) {
            const diff = imgH - originalBottom
            newY = originalY - diff
            newHeight = originalHeight + 2 * diff
          }

          // Minimum size constraints
          if (newWidth <= minValue) {
            newWidth = minValue
            newX = originalX + originalWidth / 2 - minValue / 2
          }
          if (newHeight <= minValue) {
            newHeight = minValue
            newY = originalY + originalHeight / 2 - minValue / 2
          }
        } else {
          // Normal resize: left and top edges move
          if (isShiftKey) {
            const desiredWidth = initialWidth - shiftDelta
            const maxWidth = Math.min(initialRight, initialBottom * initialAspectRatio)
            newWidth = Math.min(Math.max(desiredWidth, minValue), maxWidth)
            newHeight = newWidth / initialAspectRatio
            newX = initialRight - newWidth
            newY = initialBottom - newHeight
          } else {
            // Free resize
            newX = originalX + dxNorm
            newY = originalY + dyNorm
            newWidth = originalWidth - dxNorm
            newHeight = originalHeight - dyNorm

            // Apply bounds and minimums
            if (newX < 0) {
              newX = 0
              newWidth = originalRight
            }
            if (newWidth <= minValue) {
              newWidth = minValue
              newX = originalRight - minValue
            }
            if (newY < 0) {
              newY = 0
              newHeight = originalBottom
            }
            if (newHeight <= minValue) {
              newHeight = minValue
              newY = originalBottom - minValue
            }
          }
        }
        cropBox.value.width = newWidth
        cropBox.value.height = newHeight
        cropBox.value.x = newX
        cropBox.value.y = newY
      }

      if (direction === 'bottomleft') {
        let newWidth, newHeight, newX, newY
        const originalX = cropBox.value.x
        const originalY = cropBox.value.y
        const originalWidth = cropBox.value.width
        const originalHeight = cropBox.value.height
        const originalRight = originalX + originalWidth

        const imgW = imageStore.fileDimensions.width
        const imgH = imageStore.fileDimensions.height

        if (isAltKey && !isShiftKey) {
          // Resize from center symmetrically
          newX = originalX + dxNorm
          newWidth = originalWidth - 2 * dxNorm
          newY = originalY - dyNorm
          newHeight = originalHeight + 2 * dyNorm

          // Boundary checks
          if (newX < 0) {
            newX = 0
            newWidth = originalWidth + 2 * originalX
          }
          if (newX + newWidth > imgW) {
            const diff = imgW - originalRight
            newX = originalX - diff
            newWidth = originalWidth + 2 * diff
          }
          // Vertical boundary check for Alt
          if (newY < 0) {
            newY = 0
            newHeight = originalHeight + 2 * originalY
          }
          if (newY + newHeight > imgH) {
            const diff = imgH - (originalY + originalHeight)
            newY = originalY - diff
            newHeight = originalHeight + 2 * diff
          }

          // Minimum size constraints
          if (newWidth <= minValue) {
            newWidth = minValue
            newX = originalX + originalWidth / 2 - minValue / 2
          }
          if (newHeight <= minValue) {
            newHeight = minValue
            newY = originalY + originalHeight / 2 - minValue / 2
          }
        } else {
          // Normal resize: left and bottom edges move
          newY = originalY
          if (isShiftKey) {
            const desiredWidth = initialWidth - shiftDelta
            const maxWidth = Math.min(initialRight, (imgH - initialY) * initialAspectRatio)
            newWidth = Math.min(Math.max(desiredWidth, minValue), maxWidth)
            newHeight = newWidth / initialAspectRatio
            newX = initialRight - newWidth
            newY = initialY
          } else {
            newX = originalX + dxNorm
            newWidth = originalWidth - dxNorm
            newHeight = originalHeight + dyNorm

            // Apply bounds
            if (newX < 0) {
              newX = 0
              newWidth = originalRight
            }
            if (newWidth <= minValue) {
              newWidth = minValue
              newX = originalRight - minValue
            }
            if (newY + newHeight > imgH) {
              newHeight = imgH - originalY
            }
            if (newHeight <= minValue) {
              newHeight = minValue
            }
          }
        }
        cropBox.value.width = newWidth
        cropBox.value.height = newHeight
        cropBox.value.x = newX
        cropBox.value.y = newY
      }

      if (direction === 'right') {
        let newWidth
        let newX

        if (isAltKey) {
          const tmpX = cropBox.value.x - dxNorm
          const tmpWidth = cropBox.value.width + 2 * dxNorm

          const originalX = cropBox.value.x
          const originalWidth = cropBox.value.width

          newX = tmpX
          newWidth = tmpWidth

          // Left edge out of bounds
          if (tmpX < 0) {
            const diff = originalX
            newX = 0
            newWidth = originalWidth + 2 * diff
          }

          // Right edge out of bounds
          if (tmpX + tmpWidth > imageStore.fileDimensions.width) {
            const diff = imageStore.fileDimensions.width - (originalX + originalWidth)
            newX = originalX - diff
            newWidth = originalWidth + 2 * diff
          }

          // Minimum width reached
          if (newWidth <= minValue) {
            newWidth = minValue
            newX = cropBox.value.x + cropBox.value.width - minValue
          }
        } else {
          newWidth = cropBox.value.width + dxNorm
          newX = cropBox.value.x

          // Right edge out of bounds
          if (newX + newWidth > imageStore.fileDimensions.width) {
            newWidth = imageStore.fileDimensions.width - cropBox.value.x
          }

          // Minimum width reached
          if (newWidth <= minValue) {
            newWidth = minValue
          }

          newX = cropBox.value.x
        }

        cropBox.value.width = newWidth
        cropBox.value.x = newX
      }

      if (direction === 'left') {
        let newWidth
        let newX

        if (isAltKey) {
          // ALT: resize from center => left moves -dx, right moves +dx
          // When dragging LEFT handle, dxNorm < 0 means expanding, dxNorm > 0 means shrinking
          const tmpX = cropBox.value.x + dxNorm
          const tmpWidth = cropBox.value.width - 2 * dxNorm

          const originalX = cropBox.value.x
          const originalWidth = cropBox.value.width

          newX = tmpX
          newWidth = tmpWidth

          // Left edge out of bounds
          if (tmpX < 0) {
            const diff = originalX
            newX = 0
            newWidth = originalWidth + 2 * diff
          }

          // Right edge out of bounds
          if (tmpX + tmpWidth > imageStore.fileDimensions.width) {
            const diff = imageStore.fileDimensions.width - (originalX + originalWidth)
            newX = originalX - diff
            newWidth = originalWidth + 2 * diff
          }

          // Minimum width reached
          if (newWidth <= minValue) {
            newWidth = minValue
            // Keep right edge fixed at original right edge
            newX = originalX + originalWidth - minValue
          }
        } else {
          // Normal: left edge moves, right stays fixed
          const originalRight = cropBox.value.x + cropBox.value.width

          newX = cropBox.value.x + dxNorm
          newWidth = cropBox.value.width - dxNorm

          // Left edge out of bounds
          if (newX < 0) {
            newX = 0
            newWidth = originalRight - newX
          }

          // Minimum width reached (keep right edge fixed)
          if (newWidth <= minValue) {
            newWidth = minValue
            newX = originalRight - minValue
          }
        }

        cropBox.value.width = newWidth
        cropBox.value.x = newX
      }

      if (direction === 'bottom') {
        let newHeight
        let newY

        if (isAltKey) {
          // Resize from center vertically
          const tmpY = cropBox.value.y - dyNorm
          const tmpHeight = cropBox.value.height + 2 * dyNorm

          const originalY = cropBox.value.y
          const originalHeight = cropBox.value.height

          newY = tmpY
          newHeight = tmpHeight

          // Top edge out of bounds
          if (tmpY < 0) {
            const diff = originalY
            newY = 0
            newHeight = originalHeight + 2 * diff
          }

          // Bottom edge out of bounds
          if (tmpY + tmpHeight > imageStore.fileDimensions.height) {
            const diff = imageStore.fileDimensions.height - (originalY + originalHeight)
            newY = originalY - diff
            newHeight = originalHeight + 2 * diff
          }

          // Minimum height reached
          if (newHeight <= minValue) {
            newHeight = minValue
            newY = cropBox.value.y + cropBox.value.height - minValue
          }
        } else {
          // Normal: bottom edge moves, top stays fixed
          newHeight = cropBox.value.height + dyNorm
          newY = cropBox.value.y

          // Bottom edge out of bounds
          if (newY + newHeight > imageStore.fileDimensions.height) {
            newHeight = imageStore.fileDimensions.height - cropBox.value.y
          }

          // Minimum height reached
          if (newHeight <= minValue) {
            newHeight = minValue
          }

          newY = cropBox.value.y
        }

        cropBox.value.height = newHeight
        cropBox.value.y = newY
      }

      if (direction === 'top') {
        let newHeight
        let newY

        if (isAltKey) {
          // Resize from center vertically
          // When dragging TOP handle, dyNorm < 0 means expanding, dyNorm > 0 means shrinking
          const tmpY = cropBox.value.y + dyNorm
          const tmpHeight = cropBox.value.height - 2 * dyNorm

          const originalY = cropBox.value.y
          const originalHeight = cropBox.value.height

          newY = tmpY
          newHeight = tmpHeight

          // Top edge out of bounds
          if (tmpY < 0) {
            const diff = originalY
            newY = 0
            newHeight = originalHeight + 2 * diff
          }

          // Bottom edge out of bounds
          if (tmpY + tmpHeight > imageStore.fileDimensions.height) {
            const diff = imageStore.fileDimensions.height - (originalY + originalHeight)
            newY = originalY - diff
            newHeight = originalHeight + 2 * diff
          }

          // Minimum height reached
          if (newHeight <= minValue) {
            newHeight = minValue
            // Keep bottom edge fixed at original bottom edge
            newY = originalY + originalHeight - minValue
          }
        } else {
          // Normal: top edge moves, bottom stays fixed
          const originalBottom = cropBox.value.y + cropBox.value.height

          newY = cropBox.value.y + dyNorm
          newHeight = cropBox.value.height - dyNorm

          // Top edge out of bounds
          if (newY < 0) {
            newY = 0
            newHeight = originalBottom - newY
          }

          // Minimum height reached
          if (newHeight <= minValue) {
            newHeight = minValue
            newY = originalBottom - minValue
          }
        }

        cropBox.value.height = newHeight
        cropBox.value.y = newY
      }

      cropBox.value.startX = pointer.x
      cropBox.value.startY = pointer.y
    }

    const onPointerUp = () => {
      cropBox.value.resizing = false
      cropBox.value.resizeDir = ''

      // Round crop box
      cropBox.value.x = round(cropBox.value.x)
      cropBox.value.y = round(cropBox.value.y)
      cropBox.value.width = round(cropBox.value.width)
      cropBox.value.height = round(cropBox.value.height)

      widthAccumulator.value = cropBox.value.width
      heightAccumulator.value = cropBox.value.height

      document.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('mouseup', onPointerUp)
      document.removeEventListener('touchmove', onPointerMove)
      document.removeEventListener('touchend', onPointerUp)
      document.removeEventListener('touchcancel', onPointerUp)

      updateLastCannyCrop()
    }

    document.addEventListener('mousemove', onPointerMove)
    document.addEventListener('mouseup', onPointerUp)
    document.addEventListener('touchmove', onPointerMove, { passive: false })
    document.addEventListener('touchend', onPointerUp)
    document.addEventListener('touchcancel', onPointerUp)
  }

  // -------------------------------
  // Auto crop
  // -------------------------------

  /**
   * Threshold for auto cropping
   */
  // const autoCropThreshold = ref(editorConfig.autoCropThreshold)
  const autoCropThresholdWasChanged = ref(false)

  /**
   * Whether to apply auto crop from base image or current crop
   */
  const useBaseImage = ref(false)

  /**
   * Watch crop box and recalculate indents
   */
  watch(
    cropBox,
    (newCropBox) => {
      manualIndents.value.topIndent = round(newCropBox.y)
      manualIndents.value.rightIndent =
        imageStore.fileDimensions.width - round(newCropBox.x + newCropBox.width)
      manualIndents.value.bottomIndent =
        imageStore.fileDimensions.height - round(newCropBox.y + newCropBox.height)
      manualIndents.value.leftIndent = round(newCropBox.x)

      // Change max indents
      manualIndents.value.topIndentMax = newCropBox.y + newCropBox.height
      manualIndents.value.rightIndentMax = imageStore.fileDimensions.width - newCropBox.x
      manualIndents.value.bottomIndentMax = imageStore.fileDimensions.height - newCropBox.y
      manualIndents.value.leftIndentMax = newCropBox.x + newCropBox.width

      // Also set oldManualIndents to current manualIndents when cropBox changes
      oldManualIndents.value = { ...manualIndents.value }

      calculateMaxMinIndents()
    },
    {
      deep: true,
    },
  )

  /**
   * Watch indents and recalculate cropBox
   */
  const recalculateCropBox = () => {
    cropBox.value.x = manualIndents.value.leftIndent
    cropBox.value.y = manualIndents.value.topIndent
    cropBox.value.width =
      imageStore.fileDimensions.width -
      manualIndents.value.leftIndent -
      manualIndents.value.rightIndent
    cropBox.value.height =
      imageStore.fileDimensions.height -
      manualIndents.value.topIndent -
      manualIndents.value.bottomIndent
  }

  /**
   * Check if the pixel color matches the target color within a threshold.
   * @param {number} index - The pixel index in the image data.
   * @param {Object} target - The target color object with r, g, b, a properties.
   * @param {number} threshold - The color matching threshold.
   * @param {Uint8ClampedArray} imageData - The image data array.
   * @returns {boolean} - True if the pixel color matches the target color, false otherwise.
   */

  const trimmedSides = { left: false, right: false, top: false, bottom: false }

  /* global cv */
  /**
   * Calculate the auto crop box with edge smoothing to reduce noise at borders.
   * Uses Canny + filled contours + adaptive edge trimming.
   * @param {boolean} useBaseImage - Whether to mask with previous crop
   * @param {number} sensitivity - higher = more aggressive trimming
   * @returns {Object|null} cropRect {x, y, width, height} or null
   */
  const calculateAutoCropBoxCanny = async (useBaseImage, useEffectiveCanvas) => {
    const scale = 1

    const img = useEffectiveCanvas
      ? await getEffectiveCanvas(imageStore.imageOperations.length - 1)
      : imageStore.getRenderedImage({ t, renderCall: false })

    if (!img) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width = img.width * scale
    canvas.height = img.height * scale

    // Draw base image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    // Merge overlay into the same canvas
    if (imageStore.needMergeOverlay && imageStore.overlayImage) {
      ctx.drawImage(imageStore.overlayImage, 0, 0, canvas.width, canvas.height)
    }

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const { data, width: imgWidth, height: imgHeight } = imgData

    // Convert canvas to OpenCV Mat
    const src = cv.imread(canvas)
    let gray = new cv.Mat()
    let edges = new cv.Mat()

    // Grayscale + blur
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)
    cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT)

    const level = cropSensitivityLevel.value

    // Base thresholds
    const baseLower = 1
    const baseUpper = 20

    // Sensitivity multiplier
    const sensitivityMultiplier = {
      1: 0.2, // Less sensitive (crop less aggressively)
      2: 1.0, // Normal sensitivity
      3: 5.0, // More sensitive (crop more aggressively)
    }[level]

    // Final thresholds
    const lower = baseLower * sensitivityMultiplier
    const upper = baseUpper * sensitivityMultiplier

    cv.Canny(gray, edges, lower, upper)

    // Mask edges if not using base image
    if (lastCannyCrop.value && !useBaseImage) {
      const mask = new cv.Mat.zeros(edges.rows, edges.cols, edges.type())

      const rect = new cv.Rect(
        lastCannyCrop.value.x * scale,
        lastCannyCrop.value.y * scale,
        lastCannyCrop.value.width * scale,
        lastCannyCrop.value.height * scale,
      )

      const roi = mask.roi(rect)
      roi.setTo(new cv.Scalar(255))
      roi.delete()
      cv.bitwise_and(edges, mask, edges)
      mask.delete()
    }

    // Find contours
    const contours = new cv.MatVector()
    const hierarchy = new cv.Mat()
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)

    // Create filled mask
    let maskFilled = new cv.Mat.zeros(edges.rows, edges.cols, cv.CV_8UC1)
    for (let i = 0; i < contours.size(); i++) {
      cv.drawContours(maskFilled, contours, i, new cv.Scalar(255), -1)
    }

    // Morphological opening to remove small noise
    const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(1, 1))
    cv.morphologyEx(maskFilled, maskFilled, cv.MORPH_OPEN, kernel)
    kernel.delete()

    // Initial bounding box
    let xMin = maskFilled.cols,
      yMin = maskFilled.rows,
      xMax = 0,
      yMax = 0
    for (let y = 0; y < maskFilled.rows; y++) {
      for (let x = 0; x < maskFilled.cols; x++) {
        if (maskFilled.ucharPtr(y, x)[0] > 0) {
          xMin = Math.min(xMin, x)
          yMin = Math.min(yMin, y)
          xMax = Math.max(xMax, x)
          yMax = Math.max(yMax, y)
        }
      }
    }

    let cropRect = { x: 0, y: 0, width: img.width, height: img.height }
    if (xMax >= xMin && yMax >= yMin) {
      cropRect = {
        x: Math.floor(xMin / scale),
        y: Math.floor(yMin / scale),
        width: Math.ceil((xMax - xMin + 1) / scale),
        height: Math.ceil((yMax - yMin + 1) / scale),
      }
    }

    lastCannyCrop.value = { ...cropRect }

    /**
     * Get pixel color at (x, y), returns [r, g, b, a]
     */
    const getPixel = (x, y) => {
      if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight) return [0, 0, 0, 255]
      const idx = (y * imgWidth + x) * 4
      return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
    }

    // Convert color [r,g,b] to intensity (brightness)
    const getIntensity = ([r, g, b]) => r * 0.299 + g * 0.587 + b * 0.114

    /**
     * Compute average dual contrast for a given edge:
     * returns { inner1Contrast, inner2Contrast }
     */
    const getDualContrastForSide = (side) => {
      const diffs1 = [] // inner1 vs outer
      const diffs2 = [] // inner2 vs outer

      switch (side) {
        case 'left':
          for (let i = 0; i < cropRect.height; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x, cropRect.y + i))
            const inner2 = getIntensity(getPixel(cropRect.x + 1, cropRect.y + i))
            const outer = getIntensity(getPixel(cropRect.x - 1, cropRect.y + i))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break

        case 'right':
          for (let i = 0; i < cropRect.height; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x + cropRect.width - 1, cropRect.y + i))
            const inner2 = getIntensity(getPixel(cropRect.x + cropRect.width - 2, cropRect.y + i))
            const outer = getIntensity(getPixel(cropRect.x + cropRect.width, cropRect.y + i))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break

        case 'top':
          for (let i = 0; i < cropRect.width; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x + i, cropRect.y))
            const inner2 = getIntensity(getPixel(cropRect.x + i, cropRect.y + 1))
            const outer = getIntensity(getPixel(cropRect.x + i, cropRect.y - 1))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break

        case 'bottom':
          for (let i = 0; i < cropRect.width; i++) {
            const inner1 = getIntensity(getPixel(cropRect.x + i, cropRect.y + cropRect.height - 1))
            const inner2 = getIntensity(getPixel(cropRect.x + i, cropRect.y + cropRect.height - 2))
            const outer = getIntensity(getPixel(cropRect.x + i, cropRect.y + cropRect.height))
            diffs1.push(Math.abs(inner1 - outer))
            diffs2.push(Math.abs(inner2 - outer))
          }
          break
      }

      const inner1Contrast = diffs1.reduce((a, b) => a + b, 0) / diffs1.length
      const inner2Contrast = diffs2.reduce((a, b) => a + b, 0) / diffs2.length

      return { inner1Contrast, inner2Contrast }
    }

    /**
     * Adaptively trim one side based on two contrast values
     */
    const trimEdgeAdaptive = (side) => {
      const { inner1Contrast, inner2Contrast } = getDualContrastForSide(side)

      const c1 = inner1Contrast / 255
      const c2 = inner2Contrast / 255

      // Compute ratio 
      const ratio = c2 > c1 ? c2 / c1 : c1 / c2

      // Base range of possible thresholds for ratio
      const minRatio = 1.2
      const maxRatio = 10
      const threshold = minRatio + (maxRatio - minRatio)

      log(
        `${side} contrast1: ${c1.toFixed(3)} contrast2: ${c2.toFixed(3)} ratio: ${ratio.toFixed(
          3,
        )} threshold: ${threshold.toFixed(3)}`,
      )

      // If ratio exceeds threshold trim
      if (ratio >= threshold) {
        warn(`${side}  trimming`)
        switch (side) {
          case 'left':
            cropRect.x += 1
            cropRect.width -= 1
            trimmedSides.left = true
            break
          case 'right':
            cropRect.width -= 1
            trimmedSides.right = true
            break
          case 'top':
            cropRect.y += 1
            cropRect.height -= 1
            trimmedSides.top = true
            break
          case 'bottom':
            cropRect.height -= 1
            trimmedSides.bottom = true
            break
        }
      }
    }

    // Apply for all edges only if specific side changed or sensitivity was changed
    if (cropBox.value.x !== cropRect.x || (autoCropThresholdWasChanged.value && !trimmedSides.left))
      trimEdgeAdaptive('left')

    if (
      cropBox.value.x + cropBox.value.width !== cropRect.x + cropRect.width ||
      (autoCropThresholdWasChanged.value && !trimmedSides.right)
    )
      trimEdgeAdaptive('right')
    if (cropBox.value.y !== cropRect.y || (autoCropThresholdWasChanged.value && !trimmedSides.top))
      trimEdgeAdaptive('top')
    if (
      cropBox.value.y + cropBox.value.height !== cropRect.y + cropRect.height ||
      (autoCropThresholdWasChanged.value && !trimmedSides.bottom)
    )
      trimEdgeAdaptive('bottom')

    autoCropThresholdWasChanged.value = false

    // Clean up
    src.delete()
    gray.delete()
    edges.delete()
    contours.delete()
    hierarchy.delete()
    maskFilled.delete()

    // Enforce minimum crop size and keep it inside image bounds
    if (cropRect.width < editorConfig.minCropSize) {
      cropRect.width = editorConfig.minCropSize
    }
    if (cropRect.height < editorConfig.minCropSize) {
      cropRect.height = editorConfig.minCropSize
    }

    // Keep inside image bounds (prefer keeping x,y)
    if (cropRect.x + cropRect.width > imgWidth) {
      cropRect.x = imgWidth - cropRect.width
    }

    if (cropRect.y + cropRect.height > imgHeight) {
      cropRect.y = imgHeight - cropRect.height
    }

    log('Final crop rect:', cropRect)

    return cropRect
  }

  /**
   * Fit the crop box to the content
   */
  const fitCrop = async () => {
    const newCropBox = await calculateAutoCropBoxCanny(useBaseImage.value, false)

    if (!newCropBox) return

    if (
      cropBox.value.x === newCropBox.x &&
      cropBox.value.y === newCropBox.y &&
      cropBox.value.width === newCropBox.width &&
      cropBox.value.height === newCropBox.height
    ) {
      showToastModal(
        'info',
        t('tools.crop.settings.general.sameCropBoxAfterFit.title'),
        t('tools.crop.settings.general.sameCropBoxAfterFit.message'),
      )
    }

    cropBox.value = newCropBox
    fitCropApplied.value = true
  }

  //----------------------------------
  // Reset
  //----------------------------------

  /**
   * Check if the crop box can be reset
   */
  const cropCanBeReset = computed(() => {
    return (
      cropBox.value.x !== 0 ||
      cropBox.value.y !== 0 ||
      cropBox.value.width !== imageStore.fileDimensions.width ||
      cropBox.value.height !== imageStore.fileDimensions.height
    )
  })

  /**
   * Reset the crop box to its initial state
   */
  const resetCrop = () => {
    cropBox.value = {
      x: 0,
      y: 0,
      width: imageStore.fileDimensions.width,
      height: imageStore.fileDimensions.height,
    }

    widthAccumulator.value = cropBox.value.width
    heightAccumulator.value = cropBox.value.height

    fitCropApplied.value = false

    updateLastCannyCrop()
  }

  // -------------------------------
  // Crop apply
  // -------------------------------
  /**
   * Apply the auto crop in preset
   */
  const getAutoCropBox = async () => {
    return await calculateAutoCropBoxCanny(true, true)
  }

  /**
   * Apply the crop operation
   */
  const applyCrop = async () => {
    if (editorStore.selectedToolKey !== 'crop') return
    if (editorStore.isModalOpenFlag) return

    // Check if crop box is same as image dimensions
    if (
      cropBox.value.x === 0 &&
      cropBox.value.y === 0 &&
      cropBox.value.width === imageStore.fileDimensions.width &&
      cropBox.value.height === imageStore.fileDimensions.height
    ) {
      showToastModal(
        'info',
        t('tools.crop.settings.general.cropBoxIsSameAsOriginalImage.title'),
        t('tools.crop.settings.general.cropBoxIsSameAsOriginalImage.message'),
      )
      return
    }

    // Check if crop box is valid
    if (
      cropBox.value.x < 0 ||
      cropBox.value.y < 0 ||
      cropBox.value.width <= 0 ||
      cropBox.value.height <= 0 ||
      cropBox.value.x + cropBox.value.width > imageStore.fileDimensions.width ||
      cropBox.value.y + cropBox.value.height > imageStore.fileDimensions.height
    ) {
      showToastModal(
        'warning',
        t('tools.crop.settings.general.invalidCropBox.title'),
        t('tools.crop.settings.general.invalidCropBox.message'),
      )
      return
    }

    if (imageStore.needRasterization) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        const result = await imageStore.rasterize('editor', {}, t)

        imageStore.addImageOperation({
          type: 'rasterize',
          params: {
            overlay: result.overlay,
          },
          cost: 'high',
          affectsGeometry: true,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterize',
          settings: {},
        })

        suppressCropReset.value = true

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

        suppressCropReset.value = false
      } else {
        return
      }
    }

    imageStore.addImageOperation({
      type: 'crop',
      params: {
        x: cropBox.value.x,
        y: cropBox.value.y,
        width: cropBox.value.width,
        height: cropBox.value.height,
      },
      cost: 'high',
      affectsGeometry: true,
    })

    addUserEvent('applyOperation', {
      tool: 'crop',
      settings: { cropBox: { ...cropBox.value } },
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    historyStore.push(imageStore.getSnapshot(t))

    // Center image after crop
    viewportStore.shouldFitToScreen = true
  }

  /**
   * Show crop box on mount
   */
  onMounted(() => {
    showCropBox()
  })

  /**
   * Whether to show the crop box overlay
   */
  const isVisibleCropBox = computed({
    get: () => editorStore.toolsConfig.crop.isVisibleCropBox,
    set: (value) => {
      editorStore.toolsConfig.crop.isVisibleCropBox = value
    },
  })

  /**
   * Show crop box
   */
  const showCropBox = () => {
    editorStore.toolsConfig.crop.isVisibleCropBox = true
  }

  /**
   * Hide crop box
   */
  const hideCropBox = () => {
    editorStore.toolsConfig.crop.isVisibleCropBox = false
  }

  return {
    startPan,
    startResize,
    cropWidth,
    maxCropWidth,
    widthInputRef,
    tmpCropWidth,
    cropHeight,
    maxCropHeight,
    heightInputRef,
    tmpCropHeight,
    updateDimension,
    isDimensionsLinked,
    cropPositionX,
    cropPositionY,
    maxCropPositionX,
    maxCropPositionY,
    updatePosition,
    positionXInputRef,
    positionYInputRef,
    cropBox,
    applyCrop,
    resetCrop,
    cropCanBeReset,
    showCropBox,
    hideCropBox,
    isVisibleCropBox,
    // Auto crop
    useBaseImage,
    fitCrop,
    manualIndents,
    recalculateCropBox,
    fitCropApplied,
    getAutoCropBox,
    tmpCropX,
    tmpCropY,
    isManualAdjustmentsLinked,
    manualIndentsWereChangedManually,
    cropSensitivityLevel,
    minCropHeight,
    minCropWidth,
  }
}
