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
    if (isSelected.value) {
      return 'move'
    } else {
      return 'pointer'
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

  /**
   * Whether icon should be inside of element
   */
  const isControlIconInside = ref(false)

  /**
   * Move icon inside object when they are outside image boundaries
   */
  watch(
    () => object.value,
    () => {
      const { top, left } = getTransformedBoundingBox(object.value)

      isControlIconInside.value =
        top - controlIconSize.value < 0 || left - controlIconSize.value < 0
    },
    { deep: true },
  )

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
      if (newId !== object.value.id) {
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
   * Starting mouse position when rotation begins
   */
  const startMouseX = ref(0)
  const startMouseY = ref(0)
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
  const onObjectMouseUp = () => {
    console.log('mouseup')
    if (!isSelected.value) {
      console.log('selecting:', object.value.id, editorStore.selectedToolKey, object.value.class)
      if (editorStore.selectedToolKey === object.value.class) {
        if (object.value.class === 'magnifyArea') {
          // Always select source
          console.log(object.value)
          if (object.value.subClass === 'magnify-source') {
            imageStore.selectedSvgObjectId = object.value.id
          } else {
            imageStore.selectedSvgObjectId = object.value.linkedSourceId
          }
        } else {
          imageStore.selectedSvgObjectId = object.value.id
        }
        editorStore.previousToolKey = ''
      }
    }
  }

  /**
   * Mouse down handler for resizer handles
   * @param {MouseEvent} event - Mouse event
   * @param {number} index - Index of the resizer handle (0-3 for rectangle, 0-1 for line)
   * This will set the active resizer index
   */
  const onMouseDownResizer = (event, index) => {
    console.log('mousedown resizer')
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
    console.log('mousedown drag')
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
    console.log('mousedown rotate')
    if (!areSvgObjectOperationsEnabled.value || !isSelected.value) return

    const rect = viewportStore.viewportContentRect
    const mouseX = (event.clientX - rect.left) / viewportStore.realZoomLevel
    const mouseY = (event.clientY - rect.top) / viewportStore.realZoomLevel

    const { attrs } = object.value

    // Save start mouse position
    startMouseX.value = mouseX
    startMouseY.value = mouseY

    // Save original object angle
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
    let newAngle = angle % 360
    if (newAngle > 180) newAngle -= 360
    if (newAngle < -180) newAngle += 360

    return newAngle
  }

  /**
   * Mouse move handler for dragging, resizing and rotating the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseMove = (event) => {
    const isActive = isDragging.value || activeResizerIndex.value !== null || isRotating.value
    if (!isActive) return

    // Only left mouse button
    if (event.buttons !== 1) return

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

      // Vector from center to start mouse position
      const startVectorX = startMouseX.value - cx
      const startVectorY = startMouseY.value - cy
      const startVectorAngle = Math.atan2(startVectorY, startVectorX)

      // Vector from center to current mouse position
      const currentVectorX = mouseX - cx
      const currentVectorY = mouseY - cy
      const currentVectorAngle = Math.atan2(currentVectorY, currentVectorX)

      // Delta angle between start and current vector
      let angleDelta = (currentVectorAngle - startVectorAngle) * (180 / Math.PI)

      if (angleDelta > 180) angleDelta -= 360
      if (angleDelta < -180) angleDelta += 360

      // Apply sensitivity and original angle
      let finalAngle = round(originalAngle.value + angleDelta * rotationSensitivity.value)
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
      const minSize = 2
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
        } else if (activeResizerIndex.value === 4) {
          // Top (middle)
          let newH = attrs.height - dy
          let newY = bottom - newH

          // Prevent resizing when resizer is on the top edge
          if (attrs.y <= 0 && dy < 0) newH = attrs.height

          if (newY > bottom - minSize) {
            newY = bottom - minSize
            newH = bottom - newY
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, left, right, newY, bottom)
            newY += snap.dy
            newH = bottom - newY
            showResizeGuideLine(snap, { left, right, top: newY, bottom })
          }

          applyRect(left, newY, right - left, newH)
        } else if (activeResizerIndex.value === 5) {
          // Bottom (middle)
          let newH = attrs.height + dy

          if (attrs.y + newH > maxH) {
            newH = maxH - attrs.y
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, left, right, top, top + newH)
            newH += snap.dy
            showResizeGuideLine(snap, { left, right, top, bottom: top + newH })
          }

          applyRect(left, top, right - left, newH)
        } else if (activeResizerIndex.value === 6) {
          // Left (middle)
          let newW = attrs.width - dx
          let newX = right - newW

          // Prevent resizing when resizer is on the left edge
          if (attrs.x <= 0 && dx < 0) newW = attrs.width

          if (newX > right - minSize) {
            newX = right - minSize
            newW = right - newX
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, newX, right, top, bottom)
            newX += snap.dx
            newW = right - newX
            showResizeGuideLine(snap, { left: newX, right, top, bottom })
          }

          applyRect(newX, top, newW, bottom - top)
        } else if (activeResizerIndex.value === 7) {
          // Right (middle)
          let newW = attrs.width + dx

          if (attrs.x + newW > maxW) {
            newW = maxW - attrs.x
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(object.value, left, left + newW, top, bottom)
            newW += snap.dx
            showResizeGuideLine(snap, { left, right: left + newW, top, bottom })
          }

          applyRect(left, top, newW, bottom - top)
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
        } else if (activeResizerIndex.value === 4) {
          // Top (middle)
          let newRy = attrs.ry - dy
          let newCy = attrs.cy + dy

          // Prevent resizing when resizer is on the top edge
          if (attrs.cy - attrs.ry <= 0 && dy < 0) {
            newRy = attrs.ry
            newCy = attrs.cy
          }

          if (newRy <= minSize) {
            newRy = minSize
            newCy = attrs.cy + (attrs.ry - newRy)
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              attrs.cx - newRy,
              attrs.cx + newRy,
              newCy - newRy,
              attrs.cy + attrs.ry,
            )
            newCy += snap.dy
            newRy = attrs.ry - (newCy - (attrs.cy - attrs.ry))
            showResizeGuideLine(snap, {
              left: attrs.cx - attrs.rx,
              right: attrs.cx + attrs.rx,
              top: newCy - newRy,
              bottom: attrs.cy + attrs.ry,
            })
          }

          applyEllipse(attrs.cx, newCy, attrs.rx, newRy)
        } else if (activeResizerIndex.value === 5) {
          // Bottom (middle)
          let newRy = attrs.ry + dy
          let newCy = attrs.cy + dy

          // Prevent resizing when resizer is on the bottom edge
          if (attrs.cy + attrs.ry >= maxH && dy > 0) {
            newRy = attrs.ry
            newCy = attrs.cy
          }

          if (newRy <= minSize) {
            newRy = minSize
            newCy = attrs.cy - (attrs.ry - newRy)
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              attrs.cx - attrs.rx,
              attrs.cx + attrs.rx,
              attrs.cy - attrs.ry,
              newCy + newRy,
            )
            newCy += snap.dy
            newRy = attrs.ry + (newCy - attrs.cy)
            showResizeGuideLine(snap, {
              left: attrs.cx - attrs.rx,
              right: attrs.cx + attrs.rx,
              top: attrs.cy - attrs.ry,
              bottom: newCy + newRy,
            })
          }

          applyEllipse(attrs.cx, newCy, attrs.rx, newRy)
        } else if (activeResizerIndex.value === 6) {
          // Left (middle)
          let newRx = attrs.rx - dx
          let newCx = attrs.cx + dx

          // Prevent resizing when resizer is on the left edge
          if (attrs.cx - attrs.rx <= 0 && dx < 0) {
            newRx = attrs.rx
            newCx = attrs.cx
          }

          if (newRx <= minSize) {
            newRx = minSize
            newCx = attrs.cx + (attrs.rx - newRx)
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              newCx - newRx,
              attrs.cx + attrs.rx,
              attrs.cy - attrs.ry,
              attrs.cy + attrs.ry,
            )
            newCx += snap.dx
            newRx = attrs.rx - (newCx - (attrs.cx - attrs.rx))
            showResizeGuideLine(snap, {
              left: newCx - newRx,
              right: attrs.cx + attrs.rx,
              top: attrs.cy - attrs.ry,
              bottom: attrs.cy + attrs.ry,
            })
          }

          applyEllipse(newCx, attrs.cy, newRx, attrs.ry)
        } else if (activeResizerIndex.value === 7) {
          // Right (middle)
          let newRx = attrs.rx + dx
          let newCx = attrs.cx + dx

          // Prevent resizing when resizer is on the right edge
          if (attrs.cx + attrs.rx >= maxW && dx > 0) {
            newRx = attrs.rx
            newCx = attrs.cx
          }

          if (newRx <= minSize) {
            newRx = minSize
            newCx = attrs.cx - (attrs.rx - newRx)
          }

          if (isCtrlKey && onlyOneKeyPressed) {
            const snap = getSnapOffsetToEdges(
              object.value,
              attrs.cx - attrs.rx,
              newCx + newRx,
              attrs.cy - attrs.ry,
              attrs.cy + attrs.ry,
            )
            newCx += snap.dx
            newRx = attrs.rx + (newCx - attrs.cx)
            showResizeGuideLine(snap, {
              left: attrs.cx - attrs.rx,
              right: newCx + newRx,
              top: attrs.cy - attrs.ry,
              bottom: attrs.cy + attrs.ry,
            })
          }

          applyEllipse(newCx, attrs.cy, newRx, attrs.ry)
        }

        isSymmetricalObject.value = attrs.rx === attrs.ry
      }
      // Line
      if (tag === 'line') {
        const applyLine = (keyX, keyY, newX, newY) => {
          const otherX = keyX === 'x1' ? attrs.x2 : attrs.x1
          const otherY = keyY === 'y1' ? attrs.y2 : attrs.y1
          const len = pythagorean(newX - otherX, newY - otherY)

          if (len >= minSize) {
            attrs[keyX] = newX
            attrs[keyY] = newY
          }
        }

        switch (activeResizerIndex.value) {
          // Corner resizers
          case 0: // top-left
          case 1: // bottom-right
          case 2: // bottom-left
          case 3: // top-right
            {
              const keyX =
                activeResizerIndex.value === 0 || activeResizerIndex.value === 2 ? 'x1' : 'x2'
              const keyY =
                activeResizerIndex.value === 0 || activeResizerIndex.value === 3 ? 'y1' : 'y2'

              let newX = clamp(attrs[keyX] + dx, 0, maxW)
              let newY = clamp(attrs[keyY] + dy, 0, maxH)

              const otherX = keyX === 'x1' ? attrs.x2 : attrs.x1
              const otherY = keyY === 'y1' ? attrs.y2 : attrs.y1

              if (keepRatio) {
                console.log('keep ratio line')
                // Opposite point (pivot)
                const dx = newX - otherX
                const dy = newY - otherY

                // Original length
                const origLen = pythagorean(attrs.x2 - attrs.x1, attrs.y2 - attrs.y1)

                // New length
                const newLen = pythagorean(dx, dy)

                // Scale factor
                const scale = newLen / origLen

                // New coordinates – pivot + (scale * original vector)
                const vx = (keyX === 'x1' ? attrs.x1 : attrs.x2) - otherX
                const vy = (keyY === 'y1' ? attrs.y1 : attrs.y2) - otherY

                newX = otherX + vx * scale
                newY = otherY + vy * scale
              }

              // Snap
              if (isCtrlKey && onlyOneKeyPressed) {
                let left = newX >= otherX ? otherX : newX
                let right = newX < otherX ? otherX : newX
                let top = newY >= otherY ? otherY : newY
                let bottom = newY < otherY ? otherY : newY

                const snap = getSnapOffsetToEdges(object.value, left, right, top, bottom)
                newX += snap.dx
                newY += snap.dy
                showResizeGuideLine(snap, { left, right, top, bottom })
              }

              applyLine(keyX, keyY, newX, newY)
            }
            break

          // Side resizers
          case 4: // Top
            {
              let newY = clamp(attrs.y1 + dy, 0, maxH)

              if (isCtrlKey && onlyOneKeyPressed) {
                const snap = getSnapOffsetToEdges(object.value, attrs.x1, attrs.x2, newY, newY)
                newY += snap.dy
                showResizeGuideLine(snap, {
                  left: attrs.x1,
                  right: attrs.x2,
                  top: newY,
                  bottom: newY,
                })
              }

              applyLine('x1', 'y1', attrs.x1, newY)
            }
            break
          case 5: // Bottom
            {
              let newY = clamp(attrs.y2 + dy, 0, maxH)
              if (isCtrlKey && onlyOneKeyPressed) {
                const snap = getSnapOffsetToEdges(object.value, attrs.x1, attrs.x2, newY, newY)
                newY += snap.dy
                showResizeGuideLine(snap, {
                  left: attrs.x1,
                  right: attrs.x2,
                  top: newY,
                  bottom: newY,
                })
              }
              applyLine('x2', 'y2', attrs.x2, newY)
            }
            break
          case 6: // Left
            {
              let newX = clamp(attrs.x1 + dx, 0, maxW)
              if (isCtrlKey && onlyOneKeyPressed) {
                const snap = getSnapOffsetToEdges(object.value, newX, newX, attrs.y1, attrs.y2)
                newX += snap.dx
                showResizeGuideLine(snap, {
                  left: newX,
                  right: newX,
                  top: attrs.y1,
                  bottom: attrs.y2,
                })
              }
              applyLine('x1', 'y1', newX, attrs.y1)
            }
            break
          case 7: // right-middle -> x only
            {
              let newX = clamp(attrs.x2 + dx, 0, maxW)
              if (isCtrlKey && onlyOneKeyPressed) {
                const snap = getSnapOffsetToEdges(object.value, newX, newX, attrs.y1, attrs.y2)
                newX += snap.dx
                showResizeGuideLine(snap, {
                  left: newX,
                  right: newX,
                  top: attrs.y1,
                  bottom: attrs.y2,
                })
              }
              applyLine('x2', 'y2', newX, attrs.y2)
            }
            break
        }

        isSymmetricalObject.value =
          (attrs.x1 === attrs.x2 || attrs.y1 === attrs.y2) &&
          pythagorean(attrs.x1 - attrs.x2, attrs.y1 - attrs.y2) > minSize
      }
    }

    // DRAG
    if (isDragging.value) {
      let offsetX = dx
      let offsetY = dy

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
    const minSideSize = resizerSize.value * 2

    // Rectangle
    if (tag === 'rect') {
      const x = attrs.x || 0,
        y = attrs.y || 0,
        w = attrs.width || 0,
        h = attrs.height || 0

      return [
        // Corners - circle
        { type: 'circle', x, y, cursor: 'nwse-resize', visible: true },
        { type: 'circle', x: x + w, y, cursor: 'nesw-resize', visible: true },
        { type: 'circle', x, y: y + h, cursor: 'nesw-resize', visible: true },
        { type: 'circle', x: x + w, y: y + h, cursor: 'nwse-resize', visible: true },

        // Top
        {
          type: 'rect',
          x: x + w / 2,
          y,
          cursor: 'ns-resize',
          width: resizerSize.value,
          height: resizerSize.value / 2,
          visible: w > minSideSize,
        },
        // Bottom
        {
          type: 'rect',
          x: x + w / 2,
          y: y + h,
          cursor: 'ns-resize',
          width: resizerSize.value,
          height: resizerSize.value / 2,
          visible: w > minSideSize,
        },
        // Left
        {
          type: 'rect',
          x,
          y: y + h / 2,
          cursor: 'ew-resize',
          width: resizerSize.value / 2,
          height: resizerSize.value,
          visible: h > minSideSize,
        },
        // Right
        {
          type: 'rect',
          x: x + w,
          y: y + h / 2,
          cursor: 'ew-resize',
          width: resizerSize.value / 2,
          height: resizerSize.value,
          visible: h > minSideSize,
        },
      ]
    }

    // Ellipse
    if (tag === 'ellipse') {
      const cx = attrs.cx || 0,
        cy = attrs.cy || 0,
        rx = attrs.rx || 0,
        ry = attrs.ry || 0

      return [
        // Corners - circle
        { type: 'circle', x: cx - rx, y: cy - ry, cursor: 'nwse-resize', visible: true },
        { type: 'circle', x: cx + rx, y: cy - ry, cursor: 'nesw-resize', visible: true },
        { type: 'circle', x: cx + rx, y: cy + ry, cursor: 'nwse-resize', visible: true },
        { type: 'circle', x: cx - rx, y: cy + ry, cursor: 'nesw-resize', visible: true },

        // Top
        {
          type: 'rect',
          x: cx,
          y: cy - ry,
          cursor: 'ns-resize',
          width: resizerSize.value,
          height: resizerSize.value / 2,
          visible: rx * 2 > minSideSize,
        },
        // Bottom
        {
          type: 'rect',
          x: cx,
          y: cy + ry,
          cursor: 'ns-resize',
          width: resizerSize.value,
          height: resizerSize.value / 2,
          visible: rx * 2 > minSideSize,
        },
        // Left
        {
          type: 'rect',
          x: cx - rx,
          y: cy,
          cursor: 'ew-resize',
          width: resizerSize.value / 2,
          height: resizerSize.value,
          visible: ry * 2 > minSideSize,
        },
        // Right
        {
          type: 'rect',
          x: cx + rx,
          y: cy,
          cursor: 'ew-resize',
          width: resizerSize.value / 2,
          height: resizerSize.value,
          visible: ry * 2 > minSideSize,
        },
      ]
    }

    // Text
    if (tag === 'text' && object.value.textBBox) {
      const { x, y, width, height } = object.value.textBBox
      return [
        { x, y, cursor: 'move', visible: true },
        { x: x + width, y, cursor: 'move', visible: true },
        { x, y: y + height, cursor: 'move', visible: true },
        { x: x + width, y: y + height, cursor: 'move', visible: true },
      ]
    }

    // Line
    if (tag === 'line') {
      const { x1, y1, x2, y2 } = attrs
      const midX = (x1 + x2) / 2
      const midY = (y1 + y2) / 2
      const dx = Math.abs(x2 - x1)
      const dy = Math.abs(y2 - y1)

      return [
        // Corners - circle
        { type: 'circle', x: x1, y: y1, cursor: 'nwse-resize', visible: true },
        { type: 'circle', x: x2, y: y2, cursor: 'nwse-resize', visible: true },
        { type: 'circle', x: x1, y: y2, cursor: 'nesw-resize', visible: true },
        { type: 'circle', x: x2, y: y1, cursor: 'nesw-resize', visible: true },

        // Top
        {
          type: 'rect',
          x: midX,
          y: y1,
          cursor: 'ns-resize',
          width: resizerSize.value,
          height: resizerSize.value / 2,
          visible: dx > minSideSize,
        },
        // Bottom
        {
          type: 'rect',
          x: midX,
          y: y2,
          cursor: 'ns-resize',
          width: resizerSize.value,
          height: resizerSize.value / 2,
          visible: dx > minSideSize,
        },
        // Left
        {
          type: 'rect',
          x: x1,
          y: midY,
          cursor: 'ew-resize',
          width: resizerSize.value / 2,
          height: resizerSize.value,
          visible: dy > minSideSize,
        },
        // Right
        {
          type: 'rect',
          x: x2,
          y: midY,
          cursor: 'ew-resize',
          width: resizerSize.value / 2,
          height: resizerSize.value,
          visible: dy > minSideSize,
        },
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
    isRotating,
    cursorOnSvgObject,
    isInMultiSelection,
    isControlIconInside,
    onObjectMouseUp,
  }
}
