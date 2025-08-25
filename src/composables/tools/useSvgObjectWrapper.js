import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useMath } from '../common/useMath'
import { editorConfig } from '@/config/editorConfig'
import { useSvgObjects } from './useSvgObjects'
import { useSvgFunctions } from './useSvgFunctions'
import { useMagnifyAreaTool } from './useMagnifyAreaTool'
import { viewportConfig } from '@/config/viewportConfig'

/**
 * Logic for interactive SVG object
 * @param {Object} object - SVG object (with id, tag, attrs)
 * @param {Object} imageStore - Store for image data
 * @param {Object} viewportStore - Store for viewport data
 * @param {Object} editorStore - Store for editor state
 * @returns {Object} Composable with reactive properties and methods for SVG object interaction
 */
export function useSvgObjectWrapper(
  objectId,
  imageStore,
  viewportStore,
  editorStore,
  historyStore,
  uiStore,
  t,
) {
  const { deleteSelectedSvgObjects } = useSvgObjects(
    imageStore,
    historyStore,
    viewportStore,
    editorStore,
    uiStore,
    t,
  )
  const { clamp, pythagorean, round } = useMath()
  const { getObjectCenter, getTransformedBoundingBox, getSnapOffsetToEdges } =
    useSvgFunctions(imageStore)

  const { generateMagnifyPattern } = useMagnifyAreaTool(imageStore, historyStore, editorStore, t)

  /**
   * Style of cursor when hovering over the SVG object
   */
  const cursorOnSvgObject = computed(() => {
    if (editorStore.selectedToolKey === 'select') {
      return 'pointer'
    } else if (isSelected.value) {
      return 'move'
    } else {
      return 'default'
    }
  })

  /**
   * Reactive reference to track if the mouse was moved during interaction
   */
  const mouseWasMoved = ref(false)

  /**
   * Reactive reference to the SVG object
   */
  const object = computed(() => {
    return imageStore.getSvgObjectById(objectId)
  })

  /**
   * Whether SVG object operations are allowed
   * Can be toggled globally
   */
  const areSvgObjectOperationsEnabled = computed(() => {
    return editorStore.selectedToolKey === object.value.class
  })

  /**
   * Whether the SVG object is currently selected
   */
  const isSelected = computed(() => imageStore.selectedSvgObjectId === object.value.id)

  const isInMultiSelection = computed(() => {
    return (
      imageStore.selectedSvgObjectIds.includes(object.value.id) &&
      imageStore.selectedSvgObjectId === null
    )
  })

  /**
   * Watch for changes in the selection state
   */
  watch(isSelected, (newValue) => {
    editorStore.setIsSvgObjectSelected(newValue)
  })

  /**
   * Reactive variable to track if the SVG object is highlighted
   */
  const isSymmetricalObject = ref(false)

  // ---------------------------
  // Dimensions and styles of UI elements
  // ---------------------------
  /**
   * Size of the resizer handles
   */
  const resizerSize = computed(() => {
    return Math.max(viewportConfig.cropHandleSize / viewportStore.realZoomLevel, 5)
  })

  /**
   * Size of the border for the resizer handles
   */
  const resizerBorderSize = computed(() => {
    return Math.max(resizerSize.value * viewportConfig.cropHandleBorderMultiplier, 1)
  })

  /**
   * Border width of the bounding box
   */
  const boundingBoxStrokeWidth = computed(() => {
    return Math.max(resizerSize.value * viewportConfig.cropBorderMultiplier, 1)
  })

  /**
   * Size of the control icon for enabling/disabling resizers
   */
  const controlIconSize = computed(() => {
    // Base logical resizer size in screen pixels
    const baseSize = 10
    const zoomAdjusted = baseSize / viewportStore.realZoomLevel

    const max = imageStore.getSmallerImageDimension() * 0.05 // 5% of the smaller dimension

    return Math.max(
      round(2 * clamp(zoomAdjusted, 4, max) * editorConfig.resizerMultiplier * 1.5),
      20,
    )

    // return Math.max(viewportConfig.cropHandleSize / viewportStore.realZoomLevel, 6) * 2
  })

  // ---------------------------
  // Dragging
  // ---------------------------
  /**
   * Reactive variables for dragging the SVG object
   */
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)

  /**
   * Reactive variables to track remaining dx and dy for smooth dragging
   */
  const remainingDx = ref(0)
  const remainingDy = ref(0)

  // ---------------------------
  // Text
  // ---------------------------
  /**
   * Reference to the text element for text objects
   * Used to calculate bounding box for text objects
   */
  const textRef = ref(null)

  // ---------------------------
  // Resizers
  // ---------------------------
  /**
   * Reactive variable to track the aspect ratio of the SVG object
   * Used for maintaining aspect ratio while resizing
   */
  const ratio = ref(1)
  /**
   * Reactive variable to track the index of the active resizer
   */
  const activeResizerIndex = ref(null)
  /**
   * Variable to track if resizers should be shown
   */
  const showResizers = ref(false)

  /**
   * Hide resizers when tool is switched
   */
  watch(
    () => editorStore.selectedToolKey,
    () => {
      showResizers.value = false
    },
  )

  /**
   * Hide resizers when object is deselected
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId === null) {
        showResizers.value = false
      }
    },
  )

  /**
   * Temporary variable to store rotation angle while resizing
   */
  const tmpAngle = ref(0)

  // ---------------------------
  // Rotation
  // ---------------------------
  /**
   * Whether the user is currently rotating the object
   */
  const isRotating = ref(false)
  /**
   * Absolute starting angle of mouse and center when rotation begins
   */
  const startAngle = ref(0)
  /**
   * Original angle of the object before rotation starts
   */
  const originalAngle = ref(0)
  /**
   * Angle snapping tolerance in degrees
   * If the rotation angle is within this threshold of a multiple of 45°, it will snap
   */
  const angleSnapTolerance = ref(editorConfig.angleSnapTolerance)
  /**
   * Rotation sensitivity multiplier
   * Higher = rotates faster, lower = slower
   */
  const rotationSensitivity = ref(editorConfig.rotationSensitivity)

  /**
   * Watch for changes in the showResizers state and update the SVG object's transform accordingly
   */
  watch(
    () => showResizers.value,
    (newValue) => {
      editorStore.isSvgObjectResizing = showResizers.value

      const { attrs } = object.value
      if (object.value.tag !== 'line') {
        if (newValue) {
          // Save and reset rotate
          const transform = attrs.transform || ''
          const match = transform.match(/rotate\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/)
          tmpAngle.value = match ? parseFloat(match[1]) : 0

          const { cx, cy } = getObjectCenter(object.value)

          object.value.attrs.transform = `rotate(${0}, ${cx}, ${cy})`
        } else {
          // Restore rotation
          if (tmpAngle.value !== 0) {
            const { cx, cy } = getObjectCenter(object.value)

            attrs.transform = `rotate(${tmpAngle.value}, ${cx}, ${cy})`
          }
        }
      }
    },
  )

  /**
   * Toggle resizers on double-click (if not text)
   * @returns {boolean} - Whether the SVG object should be resizable
   */
  const onObjectDoubleClick = () => {
    if (isSelected.value) {
      if (object.value.tag === 'text') {
        return
      }
      showResizers.value = !showResizers.value
    } else {
      imageStore.selectedSvgObjectId = object.value.id
      editorStore.previousToolKey = ''
    }
  }

  /**
   * Mouse down handler for resizer handles
   * @param {MouseEvent} event - Mouse event
   * @param {number} index - Index of the resizer handle (0-3 for rectangle, 0-1 for line)
   * This will set the active resizer index
   */
  const onMouseDownResizer = (event, index) => {
    if (!areSvgObjectOperationsEnabled.value || !isSelected.value) return
    activeResizerIndex.value = index
    startX.value = event.clientX
    startY.value = event.clientY
    event.stopPropagation()

    if (object.value.tag === 'rect') {
      ratio.value = object.value.attrs.width / object.value.attrs.height
    } else if (object.value.tag === 'ellipse') {
      ratio.value = object.value.attrs.rx / object.value.attrs.ry
    } else {
      ratio.value = 1
    }
  }

  /**
   * Mouse down handler for dragging the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseDownDrag = (event) => {
    if (!areSvgObjectOperationsEnabled.value || !isSelected.value) return

    isDragging.value = true
    startX.value = event.clientX
    startY.value = event.clientY
    event.stopPropagation()
  }

  /**
   * Mouse down handler for rotation
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseDownRotate = (event) => {
    if (!areSvgObjectOperationsEnabled.value || !isSelected.value) return

    const rect = viewportStore.viewportContentRect
    const mouseX = (event.clientX - rect.left) / viewportStore.realZoomLevel
    const mouseY = (event.clientY - rect.top) / viewportStore.realZoomLevel

    const { attrs } = object.value

    const { cx, cy } = getObjectCenter(object.value)

    const dx = mouseX - cx
    const dy = mouseY - cy
    startAngle.value = Math.atan2(dy, dx) * (180 / Math.PI)

    const match = attrs.transform?.match(/rotate\((-?\d+\.?\d*)/)
    originalAngle.value = match ? parseFloat(match[1]) : 0

    isRotating.value = true
    event.stopPropagation()
  }

  /**
   * Update the rotation transform of the SVG object
   * This is called after resizing or dragging to ensure the rotation is centered correctly
   */
  const updateRotationTransform = () => {
    const { attrs } = object.value
    const match = attrs.transform?.match(/rotate\((-?\d+\.?\d*),?([^)]*)\)/)

    if (!match) return

    const currentAngle = parseFloat(match[1])

    const { cx, cy } = getObjectCenter(object.value)

    attrs.transform = `rotate(${currentAngle}, ${cx}, ${cy})`
  }

  /**
   * Normalize angle to the range [-180, 180]
   * @param {number} angle - Angle in degrees
   * @returns {number}
   */
  const normalizeAngle = (angle) => {
    let a = angle % 360
    if (a > 180) a -= 360
    if (a < -180) a += 360
    return a
  }

  /**
   * Mouse move handler for dragging, resizing and rotating the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseMove = (event) => {
    const isActive = isDragging.value || activeResizerIndex.value !== null || isRotating.value
    if (!isActive) return

    mouseWasMoved.value = true

    const isCtrlKey = event.ctrlKey || event.metaKey
    const isShiftKey = event.shiftKey

    const onlyOneKeyPressed = isCtrlKey !== isShiftKey

    if (!isCtrlKey) {
      viewportStore.guideLine = null
    }

    let rawDx = (event.clientX - startX.value) / viewportStore.realZoomLevel + remainingDx.value
    let rawDy = (event.clientY - startY.value) / viewportStore.realZoomLevel + remainingDy.value

    // Round to whole pixels
    let dx = round(rawDx)
    let dy = round(rawDy)

    // Save remaining dx and dy for smooth dragging
    remainingDx.value = rawDx - dx
    remainingDy.value = rawDy - dy

    const { tag, attrs } = object.value

    // ROTATE
    if (isRotating.value) {
      const rect = viewportStore.viewportContentRect
      const mouseX = (event.clientX - rect.left) / viewportStore.realZoomLevel
      const mouseY = (event.clientY - rect.top) / viewportStore.realZoomLevel

      const { attrs } = object.value

      const { cx, cy } = getObjectCenter(object.value)

      const dx = mouseX - cx
      const dy = mouseY - cy
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI)

      let angleDelta = currentAngle - startAngle.value

      // Normalize delta to [-180, 180]
      if (angleDelta > 180) angleDelta -= 360
      if (angleDelta < -180) angleDelta += 360

      let finalAngle = round(originalAngle.value + angleDelta * rotationSensitivity.value, 1)
      finalAngle = normalizeAngle(finalAngle)

      // Snap to closest multiple of 45° if Ctrl/Meta is held
      if (isCtrlKey && onlyOneKeyPressed) {
        const snapped = Math.round(finalAngle / 45) * 45
        if (Math.abs(finalAngle - snapped) <= angleSnapTolerance.value) {
          finalAngle = normalizeAngle(snapped)

          // Set guide line to the snapped angle
          viewportStore.guideLine = {
            x: cx,
            y: cy,
            angle: finalAngle,
          }
        } else {
          viewportStore.guideLine = null
        }
      }

      attrs.transform = `rotate(${finalAngle}, ${cx}, ${cy})`
    }

    // Last cursor position
    startX.value = event.clientX
    startY.value = event.clientY

    // RESIZE
    if (activeResizerIndex.value !== null) {
      const minSize = 1
      const keepRatio = isShiftKey && onlyOneKeyPressed
      const maxW = imageStore.fileDimensions.width
      const maxH = imageStore.fileDimensions.height

      // Rectangle
      if (tag === 'rect') {
        const right = attrs.x + attrs.width
        const bottom = attrs.y + attrs.height
        const left = attrs.x
        const top = attrs.y

        const applyRect = (newX, newY, newW, newH) => {
          attrs.x = clamp(newX, 0, maxW)
          attrs.y = clamp(newY, 0, maxH)
          attrs.width = clamp(newW, minSize, maxW - attrs.x)
          attrs.height = clamp(newH, minSize, maxH - attrs.y)
        }

        if (activeResizerIndex.value === 0) {
          // Top-left
          let newW = attrs.width - dx
          let newH = keepRatio ? newW / ratio.value : attrs.height - dy

          // Prevent resizing when resizer is on the top/left edge
          if (keepRatio && (attrs.x <= 0 || attrs.y <= 0)) return
          if (attrs.x <= 0 && dx < 0) newW = attrs.width
          if (attrs.y <= 0 && dy < 0) newH = attrs.height

          let newX = right - newW
          let newY = bottom - newH

          // Clamp newY so height never becomes 0
          if (newY > bottom - minSize) {
            newY = bottom - minSize
            newH = bottom - newY
          }
          // Clamp newX so width never becomes 0
          if (newX > right - minSize) {
            newX = right - minSize
            newW = right - newX
          }

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, newX, right, newY, bottom)

            newX += snap.dx
            newY += snap.dy
            newW = right - newX
            newH = bottom - newY

            showResizeGuideLine(snap, { left: newX, right: right, top: newY, bottom: bottom })
          }

          applyRect(newX, newY, newW, newH)
        } else if (activeResizerIndex.value === 1) {
          // Top-right
          let newW = attrs.width + dx
          let newH = keepRatio ? newW / ratio.value : attrs.height - dy

          // Prevent resizing when resizer is on the top/right edge
          if (keepRatio && (attrs.y <= 0 || attrs.x + attrs.width >= maxW)) return
          if (attrs.y <= 0 && dy < 0) newH = attrs.height
          if (attrs.x >= maxW && dx > 0) newW = attrs.width

          const newX = left
          let newY = bottom - newH

          // Clamp newY so height never becomes 0
          if (newY > bottom - minSize) {
            newY = bottom - minSize
            newH = bottom - newY
          }

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, newX, newX + newW, newY, bottom)

            newW += snap.dx
            newY += snap.dy
            newH = bottom - newY

            showResizeGuideLine(snap, { left: newX, right: newX + newW, top: newY, bottom: bottom })
          }

          applyRect(newX, newY, newW, bottom - newY)
        } else if (activeResizerIndex.value === 2) {
          // Bottom-left
          let newW = attrs.width - dx
          let newH = keepRatio ? newW / ratio.value : attrs.height + dy

          // Prevent resizing when resizer is on the left/bottom edge
          if (keepRatio && (attrs.x <= 0 || attrs.y + attrs.height >= maxH)) return
          if (attrs.x <= 0 && dx < 0) newW = attrs.width
          if (attrs.y >= maxH && dy > 0) newH = attrs.height

          let newX = right - newW
          const newY = top

          // Clamp newX so width never becomes 0
          if (newX > right - minSize) {
            newX = right - minSize
            newW = right - newX
          }

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, newX, right, newY, newY + newH)

            newX += snap.dx
            newH += snap.dy

            showResizeGuideLine(snap, { left: newX, right: right, top: newY, bottom: newY + newH })
          }

          applyRect(newX, newY, right - newX, newH)
        } else if (activeResizerIndex.value === 3) {
          // Bottom-right
          let newW = attrs.width + dx
          let newH = keepRatio ? newW / ratio.value : attrs.height + dy

          // Prevent resizing when resizer is on the right/bottom edge
          if (keepRatio && (attrs.x + attrs.width >= maxW || attrs.y + attrs.height >= maxH)) return

          const newX = left
          const newY = top

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey && onlyOneKeyPressed) {
            const bottomBeforeSnap = newY + newH

            const snap = getSnapOffsetToEdges(object.value, newX, newX + newW, newY, newY + newH)

            newW += snap.dx

            showResizeGuideLine(snap, {
              left: newX,
              right: newX + newW,
              top: newY,
              bottom: newY + newH,
            })

            if (snap.dy !== 0) {
              const newBottom = bottomBeforeSnap + snap.dy
              newH = newBottom - newY
            }
            // newH += snap.dy
          }

          applyRect(newX, newY, newW, newH)
        }

        isSymmetricalObject.value = round(attrs.width) === round(attrs.height)
      }
      // Ellipse
      if (tag === 'ellipse') {
        dx /= 2
        dy /= 2
        const applyEllipse = (newCx, newCy, newRx, newRy) => {
          newRx = clamp(newRx, minSize, Math.min(newCx, maxW - newCx))
          newRy = clamp(newRy, minSize, Math.min(newCy, maxH - newCy))
          attrs.cx = clamp(newCx, newRx, maxW - newRx)
          attrs.cy = clamp(newCy, newRy, maxH - newRy)
          attrs.rx = newRx
          attrs.ry = newRy
        }

        if (activeResizerIndex.value === 0) {
          // Top-left
          const right = attrs.cx + attrs.rx
          const bottom = attrs.cy + attrs.ry
          let newRx = attrs.rx - dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry - dy

          // Prevent resizing when resizer is on the top/left edge
          if (keepRatio && (attrs.cy - attrs.ry <= 0 || attrs.cx - attrs.rx <= 0)) return
          if (attrs.cx - attrs.rx <= 0 && dx < 0) newRx = attrs.rx
          if (attrs.cy - attrs.ry <= 0 && dy < 0) newRy = attrs.ry

          let newCx = right - newRx
          let newCy = bottom - newRy

          // Clamp rx to prevent moving when size is minimal
          if (newRx <= minSize) {
            newRx = minSize
            newCx = right - newRx
          }
          // Clamp ry to prevent moving when size is minimal
          if (newRy <= minSize) {
            newRy = minSize
            newCy = bottom - newRy
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            // Predict new bbox before applying
            const snap = getSnapOffsetToEdges(
              object.value,
              newCx - attrs.rx,
              newCx + attrs.rx,
              newCy - attrs.ry,
              newCy + attrs.ry,
            )

            // Snap only position, not size (to avoid jitter)
            newCx += snap.dx
            newCy += snap.dy

            // If snapped, reset size to original to avoid unintended resize
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry

            showResizeGuideLine(snap, {
              left: newCx - newRx,
              right: newCx + newRx,
              top: newCy - newRy,
              bottom: newCy + newRy,
            })
          }

          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 1) {
          // Top-right
          const left = attrs.cx - attrs.rx
          const bottom = attrs.cy + attrs.ry
          let newRx = attrs.rx + dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry - dy

          // Prevent resizing when resizer is on the top/right edge
          if (keepRatio && (attrs.cy - attrs.ry <= 0 || attrs.cx + attrs.rx >= maxW)) return
          if (attrs.cx + attrs.rx >= maxW && dx > 0) newRx = attrs.rx
          if (attrs.cy - attrs.ry <= 0 && dy < 0) newRy = attrs.ry

          let newCx = left + newRx
          let newCy = bottom - newRy

          // Clamp ry to prevent moving when size is minimal
          if (newRy <= minSize) {
            newRy = minSize
            newCy = bottom - newRy
          }
          // Clamp rx to prevent moving when size is minimal
          if (newRx <= minSize) {
            newRx = minSize
            newCx = left + newRx
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              newCx - attrs.rx,
              newCx + attrs.rx,
              newCy - attrs.ry,
              newCy + attrs.ry,
            )

            newCx += snap.dx
            newCy += snap.dy
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry

            showResizeGuideLine(snap, {
              left: newCx - newRx,
              right: newCx + newRx,
              top: newCy - newRy,
              bottom: newCy + newRy,
            })
          }

          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 2) {
          // Bottom-right
          const left = attrs.cx - attrs.rx
          const top = attrs.cy - attrs.ry
          let newRx = attrs.rx + dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry + dy

          if (keepRatio && (attrs.cy + attrs.ry >= maxH || attrs.cx + attrs.rx >= maxW)) return
          if (attrs.cx + attrs.rx >= maxW && dx > 0) newRx = attrs.rx
          if (attrs.cy + attrs.ry >= maxH && dy > 0) newRy = attrs.ry

          let newCx = left + newRx
          let newCy = top + newRy

          // Clamp ry to prevent moving when size is minimal
          if (newRy <= minSize) {
            newRy = minSize
            newCy = top + newRy
          }
          // Clamp rx to prevent moving when size is minimal
          if (newRx <= minSize) {
            newRx = minSize
            newCx = left + newRx
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              newCx - attrs.rx,
              newCx + attrs.rx,
              newCy - attrs.ry,
              newCy + attrs.ry,
            )

            newCx += snap.dx
            newCy += snap.dy
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry

            showResizeGuideLine(snap, {
              left: newCx - newRx,
              right: newCx + newRx,
              top: newCy - newRy,
              bottom: newCy + newRy,
            })
          }

          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 3) {
          // Bottom-left
          const right = attrs.cx + attrs.rx
          const top = attrs.cy - attrs.ry
          let newRx = attrs.rx - dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry + dy

          if (keepRatio && (attrs.cy + attrs.ry >= maxH || attrs.cx - attrs.rx <= 0)) return
          if (attrs.cx - attrs.rx <= 0 && dx < 0) newRx = attrs.rx
          if (attrs.cy + attrs.ry >= maxH && dy > 0) newRy = attrs.ry

          let newCx = right - newRx
          let newCy = top + newRy

          // Clamp rx to prevent moving when size is minimal
          if (newRx <= minSize) {
            newRx = minSize
            newCx = right - newRx
          }
          // Clamp ry to prevent moving when size is minimal
          if (newRy <= minSize) {
            newRy = minSize
            newCy = top + newRy
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              newCx - attrs.rx,
              newCx + attrs.rx,
              newCy - attrs.ry,
              newCy + attrs.ry,
            )

            newCx += snap.dx
            newCy += snap.dy
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry

            showResizeGuideLine(snap, {
              left: newCx - newRx,
              right: newCx + newRx,
              top: newCy - newRy,
              bottom: newCy + newRy,
            })
          }

          applyEllipse(newCx, newCy, newRx, newRy)
        }

        isSymmetricalObject.value = attrs.rx === attrs.ry
      }
      // Line
      if (tag === 'line') {
        const minLength = 2
        const maxX = imageStore.fileDimensions.width
        const maxY = imageStore.fileDimensions.height

        const applyLine = (keyX, keyY, newX, newY) => {
          const otherX = keyX === 'x1' ? attrs.x2 : attrs.x1
          const otherY = keyY === 'y1' ? attrs.y2 : attrs.y1
          const len = pythagorean(newX - otherX, newY - otherY)

          if (len >= minLength) {
            attrs[keyX] = newX
            attrs[keyY] = newY
          }
        }

        if (activeResizerIndex.value === 0 || activeResizerIndex.value === 1) {
          const keyX = activeResizerIndex.value === 0 ? 'x1' : 'x2'
          const keyY = activeResizerIndex.value === 0 ? 'y1' : 'y2'

          let newX = clamp(attrs[keyX] + dx, 0, maxX)
          let newY = clamp(attrs[keyY] + dy, 0, maxY)

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, newX, newX, newY, newY)

            // Snap only position
            newX += snap.dx
            newY += snap.dy

            showResizeGuideLine(snap, {
              left: newX,
              right: newX,
              top: newY,
              bottom: newY,
            })
          }

          applyLine(keyX, keyY, newX, newY)
        }

        isSymmetricalObject.value =
          (attrs.x1 === attrs.x2 || attrs.y1 === attrs.y2) &&
          pythagorean(attrs.x1 - attrs.x2, attrs.y1 - attrs.y2) > minLength
      }
    }

    // DRAG
    if (isDragging.value) {
      let offsetX = dx
      let offsetY = dy

      // TODO - toto je bez riesenia prichytavania ak je objekt otoceny (okrem obdlznika tam to uze je)
      // if (isCtrlKey) {
      //   if ('x' in attrs && 'y' in attrs && tag !== 'text') {
      //     const bbox = getTransformedBoundingBox(object.value)
      //     if (bbox) {
      //       const snap = getSnapOffsetToEdges(
      //         bbox.left + dx,
      //         bbox.right + dx,
      //         bbox.top + dy,
      //         bbox.bottom + dy,
      //       )
      //       offsetX += snap.dx
      //       offsetY += snap.dy
      //     }
      //   } else if (tag === 'text' && object.value.textBBox) {
      //     const bbox = object.value.textBBox
      //     const snap = getSnapOffsetToEdges(
      //       bbox.x + dx,
      //       bbox.x + bbox.width + dx,
      //       bbox.y + dy,
      //       bbox.y + bbox.height + dy,
      //     )
      //     offsetX += snap.dx
      //     offsetY += snap.dy
      //   } else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
      //     const snap = getSnapOffsetToEdges(
      //       attrs.cx - attrs.rx + dx,
      //       attrs.cx + attrs.rx + dx,
      //       attrs.cy - attrs.ry + dy,
      //       attrs.cy + attrs.ry + dy,
      //     )
      //     offsetX += snap.dx
      //     offsetY += snap.dy
      //   } else if ('x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
      //     const xMin = Math.min(attrs.x1, attrs.x2)
      //     const xMax = Math.max(attrs.x1, attrs.x2)
      //     const yMin = Math.min(attrs.y1, attrs.y2)
      //     const yMax = Math.max(attrs.y1, attrs.y2)

      //     const snap = getSnapOffsetToEdges(xMin + dx, xMax + dx, yMin + dy, yMax + dy)
      //     offsetX += snap.dx
      //     offsetY += snap.dy
      //   }
      // }

      if (isCtrlKey && onlyOneKeyPressed) {
        const bbox = getTransformedBoundingBox(object.value)

        if (bbox) {
          const snap = getSnapOffsetToEdges(
            object.value,
            bbox.left + dx,
            bbox.right + dx,
            bbox.top + dy,
            bbox.bottom + dy,
          )
          offsetX += snap.dx
          offsetY += snap.dy

          showResizeGuideLine(snap, bbox)
        }
      }

      // Apply updated offset
      if ('x' in attrs && 'y' in attrs) {
        attrs.x += offsetX
        attrs.y += offsetY

        if (tag === 'text') {
          object.value.textBBox.x += offsetX
          object.value.textBBox.y += offsetY
        }
      } else if ('cx' in attrs && 'cy' in attrs) {
        attrs.cx += offsetX
        attrs.cy += offsetY
      } else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
        attrs.x1 += offsetX
        attrs.y1 += offsetY
        attrs.x2 += offsetX
        attrs.y2 += offsetY
      }
    }

    object.value.attrs = { ...attrs }

    updateRotationTransform()
  }

  /**
   * Mouse up handler for stopping the drag operation
   */
  const onMouseUp = () => {
    const isActive = isDragging.value || activeResizerIndex.value !== null || isRotating.value
    if (!isActive) return

    if (object.value.class === 'magnifyArea') {
      if (object.value.subClass === 'magnify-source') {
        const result = imageStore.getSvgObjectById(object.value.linkedZoomId)
        if (!result) return

        const patternId = `magnify-fill-${result.id}`

        const pattern = generateMagnifyPattern(
          patternId,
          object.value.attrs.cx, // sourceX
          object.value.attrs.cy, // sourceY
          result.attrs.cx, // resultX
          result.attrs.cy, // resultY
        )

        imageStore.addOrReplaceSvgDef(patternId, pattern)
        result.attrs.fill = `url(#${patternId})`
      }
    }

    isDragging.value = false
    activeResizerIndex.value = null
    isSymmetricalObject.value = false
    isRotating.value = false

    viewportStore.guideLine = null

    remainingDx.value = 0
    remainingDy.value = 0

    if (mouseWasMoved.value) {
      historyStore.push(imageStore.getSnapshot(t))
      mouseWasMoved.value = false
    }
  }

  /**
   * Show resize guide line based on snap offsets
   * @param {Object} snap - Snap offsets
   * @param {Object} bbox - Bounding box of the SVG object
   */
  const showResizeGuideLine = (snap, bbox) => {
    if (snap.dx !== 0 || snap.dy !== 0) {
      let gx = null,
        gy = null,
        angle = null

      if (snap.snappedEdgeX) {
        gx = snap.snappedEdgeX === 'left' ? bbox.left : bbox.right
        gy = (bbox.top + bbox.bottom) / 2
        angle = 90
      }
      if (snap.snappedEdgeY) {
        gy = snap.snappedEdgeY === 'top' ? bbox.top : bbox.bottom
        gx = (bbox.left + bbox.right) / 2
        angle = 0
      }

      viewportStore.guideLine = { x: gx, y: gy, angle }
    }
  }

  /**
   * Get positions of resizers for the SVG object
   * Returns an array of objects with x, y coordinates and cursor style
   * @returns {Array} Array of resizer positions
   */
  const getResizerPositions = () => {
    const { tag, attrs } = object.value

    // Rectangle
    if (tag === 'rect') {
      const x = attrs.x || 0,
        y = attrs.y || 0,
        w = attrs.width || 0,
        h = attrs.height || 0
      return [
        { x, y, cursor: 'nwse-resize' },
        { x: x + w, y, cursor: 'nesw-resize' },
        { x, y: y + h, cursor: 'nesw-resize' },
        { x: x + w, y: y + h, cursor: 'nwse-resize' },
      ]
    }

    // Ellipse
    if (tag === 'ellipse') {
      const cx = attrs.cx || 0,
        cy = attrs.cy || 0,
        rx = attrs.rx || 0,
        ry = attrs.ry || 0
      return [
        { x: cx - rx, y: cy - ry, cursor: 'nwse-resize' },
        { x: cx + rx, y: cy - ry, cursor: 'nesw-resize' },
        { x: cx + rx, y: cy + ry, cursor: 'nwse-resize' },
        { x: cx - rx, y: cy + ry, cursor: 'nesw-resize' },
      ]
    }

    // Text
    if (tag === 'text' && object.value.textBBox) {
      const { x, y, width, height } = object.value.textBBox
      return [
        { x, y, cursor: 'move' },
        { x: x + width, y, cursor: 'move' },
        { x, y: y + height, cursor: 'move' },
        { x: x + width, y: y + height, cursor: 'move' },
      ]
    }

    // Line
    if (tag === 'line') {
      const { x1, y1, x2, y2 } = attrs
      return [
        { x: x1, y: y1, cursor: 'move' },
        { x: x2, y: y2, cursor: 'move' },
      ]
    }

    return []
  }

  /**
   * Compute the bounding box of the SVG object based on its resizer positions
   * Returns an object with x, y, width, height properties
   */
  const boundingBox = computed(() => {
    const points = getResizerPositions()
    if (!points.length) return null
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    }
  })

  /**
   * Watch for changes in the text element and update the bounding box accordingly
   */
  watch(
    () => ({
      content: object.value.content,
      fontSize: object.value.attrs['font-size'],
      fontFamily: object.value.attrs['font-family'],
      fill: object.value.attrs.fill,
      fontWeight: object.value.attrs['font-weight'],
      fontStyle: object.value.attrs['font-style'],
      textDecoration: object.value.attrs['text-decoration'],
      letterSpacing: object.value.attrs['letter-spacing'],
      x: object.value.attrs.x,
      y: object.value.attrs.y,
    }),
    () => {
      nextTick(() => {
        if (object.value.tag === 'text' && textRef.value) {
          // if empty text remove
          if (object.value.content.trim() === '') {
            deleteSelectedSvgObjects(t)
            return
          }

          const bbox = textRef.value.getBBox()
          object.value.textBBox = {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
          }
        }
      })
    },
    { deep: false },
  )

  /**
   * Add global event listeners for mouse events
   */
  onMounted(() => {
    // Add initial bounding box if it is text
    if (object.value.tag === 'text' && textRef.value) {
      const bbox = textRef.value.getBBox()
      object.value.textBBox = {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  /**
   * Remove global event listeners when the component is unmounted
   */
  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return {
    textRef,
    isSelected,
    onMouseDownResizer,
    onMouseDownDrag,
    getResizerPositions,
    boundingBox,
    resizerSize,
    resizerBorderSize,
    areSvgObjectOperationsEnabled,
    object,
    isSymmetricalObject,
    activeResizerIndex,
    isDragging,
    showResizers,
    controlIconSize,
    boundingBoxStrokeWidth,
    onMouseDownRotate,
    onObjectDoubleClick,
    isRotating,
    cursorOnSvgObject,
    isInMultiSelection,
  }
}
