import { ref, computed, watchEffect, onMounted, onBeforeUnmount, watch } from 'vue'
import { useMath } from '../common/useMath'
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
  t,
) {
  const { clamp, pythagorean, round } = useMath()

  /**
   * Size of the resizer handles
   */
  const resizerSize = 5

  /**
   * Reactive reference to the SVG object
   */
  const object = computed(() => {
    return imageStore.getSvgObjectById(objectId)
  })

  /**
   * Whether SVG object operations are allowed
   * Can be toggled globally (e.g. from tools)
   */
  const areSvgObjectOperationsEnabled = computed(() => {
    return editorStore.selectedToolKey === object.value.class
  })

  /**
   * Whether the SVG object is currently selected
   */
  const isSelected = computed(
    () => imageStore.selectedSvgObjectId === object.value.id && areSvgObjectOperationsEnabled.value,
  )

  /**
   * Reactive variable to track if the SVG object is highlighted
   */
  const isSymmetricalObject = ref(false)

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

  /**
   * Reference to the text element for text objects
   * Used to calculate bounding box for text objects
   */
  const textRef = ref(null)
  /**
   * Bounding box for text objects
   */
  // const textBBox = ref(null)

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
   * Temporary variable to store rotation angle while resizing
   */
  const tmpAngle = ref(0)

  /**
   * Watch for changes in the showResizers state and update the SVG object's transform accordingly
   */
  watch(
    () => showResizers.value,
    (newValue) => {
      const { attrs } = object.value
      if (newValue) {
        // Save and reset rotate
        const transform = attrs.transform || ''
        const match = transform.match(/rotate\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/)
        tmpAngle.value = match ? parseFloat(match[1]) : 0

        const cx = attrs.x + (attrs.width || 0) / 2
        const cy = attrs.y + (attrs.height || 0) / 2

        object.value.attrs.transform = `rotate(${0}, ${cx}, ${cy})`
      } else {
        // Restore rotation
        if (tmpAngle.value !== 0) {
          const cx = attrs.x + (attrs.width || 0) / 2
          const cy = attrs.y + (attrs.height || 0) / 2
          attrs.transform = `rotate(${tmpAngle.value}, ${cx}, ${cy})`
        }
      }
    },
  )

  /**
   * Watch for changes in the selected tool and reset the selected SVG object when the tool changes
   */
  watch(
    () => editorStore.selectedToolKey,
    () => {
      imageStore.selectedSvgObjectId = null
    },
  )

  /**
   * Mouse event handlers for the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseDown = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return

    imageStore.selectedSvgObjectId = object.value.id
    startX.value = event.clientX
    startY.value = event.clientY
    event.stopPropagation()

    remainingDx.value = 0
    remainingDy.value = 0
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
    if (!areSvgObjectOperationsEnabled.value) return

    imageStore.selectedSvgObjectId = object.value.id
    isDragging.value = true
    startX.value = event.clientX
    startY.value = event.clientY
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

    const centerX = attrs.x + attrs.width / 2
    const centerY = attrs.y + attrs.height / 2

    attrs.transform = `rotate(${currentAngle}, ${centerX}, ${centerY})`
  }

  /**
   * Mouse move handler for dragging the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseMove = (event) => {
    const isActive = isDragging.value || activeResizerIndex.value !== null
    if (!isActive) return

    const isCtrlKey = event.ctrlKey || event.metaKey

    let rawDx = (event.clientX - startX.value) / viewportStore.realZoomLevel + remainingDx.value
    let rawDy = (event.clientY - startY.value) / viewportStore.realZoomLevel + remainingDy.value

    // Round to whole pixels
    let dx = round(rawDx)
    let dy = round(rawDy)

    // Save remaining dx and dy for smooth dragging
    remainingDx.value = rawDx - dx
    remainingDy.value = rawDy - dy

    // Last cursor position
    startX.value = event.clientX
    startY.value = event.clientY

    const { tag, attrs } = object.value

    // RESIZE
    if (activeResizerIndex.value !== null) {
      const minSize = 1
      const keepRatio = event.shiftKey
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

          // Do not change width if resizer is on the left edge
          if (attrs.x <= 0 && dx < 0) {
            newW = attrs.width
          }
          // Do not change height if resizer is on the top edge
          if (attrs.y <= 0 && dy < 0) {
            newH = attrs.height
          }

          let newX = right - newW
          let newY = bottom - newH

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(newX, right, newY, bottom)
            newX += snap.dx
            newY += snap.dy
            newW = right - newX
            newH = bottom - newY
          }

          applyRect(newX, newY, right - newX, bottom - newY)
        } else if (activeResizerIndex.value === 1) {
          // Top-right
          let newW = attrs.width + dx
          let newH = keepRatio ? newW / ratio.value : attrs.height - dy

          // Do not change height if resizer is on the right edge
          if (attrs.y <= 0 && dy < 0) {
            newH = attrs.height
          }

          const newX = left
          let newY = bottom - newH

          // Clamp newY so height never becomes 0
          if (newY > bottom - minSize) {
            newY = bottom - minSize
            newH = bottom - newY
          }

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(newX, newX + newW, newY, bottom)

            newW += snap.dx
            newY += snap.dy
            newH = bottom - newY
          }

          applyRect(newX, newY, newW, bottom - newY)
        } else if (activeResizerIndex.value === 2) {
          // Bottom-left
          let newW = attrs.width - dx
          let newH = keepRatio ? newW / ratio.value : attrs.height + dy

          // Do not change width if resizer is on the left edge
          if (attrs.x <= 0 && dx < 0) {
            newW = attrs.width
          }

          let newX = right - newW
          const newY = top

          // Clamp newX so width never becomes 0
          if (newX > right - minSize) {
            newX = right - minSize
            newW = right - newX
          }

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(newX, right, newY, newY + newH)
            newX += snap.dx
            newH += snap.dy
          }

          applyRect(newX, newY, right - newX, newH)
        } else if (activeResizerIndex.value === 3) {
          // Bottom-right
          let newW = attrs.width + dx
          let newH = keepRatio ? newW / ratio.value : attrs.height + dy

          const newX = left
          const newY = top

          // Snap to edges if Ctrl key is pressed
          if (isCtrlKey) {
            const bottomBeforeSnap = newY + newH

            const snap = getSnapOffsetToEdges(newX, newX + newW, newY, newY + newH)

            newW += snap.dx

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

          if (isCtrlKey) {
            // Predict new bbox before applying
            const snap = getSnapOffsetToEdges(
              newCx - newRx,
              newCx + newRx,
              newCy - newRy,
              newCy + newRy,
            )

            // Snap only position, not size (to avoid jitter)
            newCx += snap.dx
            newCy += snap.dy

            // If snapped, reset size to original to avoid unintended resize
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry
          }

          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 1) {
          // Top-right
          const left = attrs.cx - attrs.rx
          const bottom = attrs.cy + attrs.ry
          let newRx = attrs.rx + dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry - dy

          if (keepRatio && (attrs.cy - attrs.ry <= 0 || attrs.cx + attrs.rx >= maxW)) return
          if (attrs.cx + attrs.rx >= maxW && dx > 0) newRx = attrs.rx
          if (attrs.cy - attrs.ry <= 0 && dy < 0) newRy = attrs.ry

          let newCx = left + newRx
          let newCy = bottom - newRy

          console.log('newCx, newCy', newCx, newCy, 'newRx, newRy', newRx, newRy)

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

          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(
              newCx - newRx,
              newCx + newRx,
              newCy - newRy,
              newCy + newRy,
            )
            newCx += snap.dx
            newCy += snap.dy
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry
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

          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(
              newCx - newRx,
              newCx + newRx,
              newCy - newRy,
              newCy + newRy,
            )
            newCx += snap.dx
            newCy += snap.dy
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry
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

          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(
              newCx - newRx,
              newCx + newRx,
              newCy - newRy,
              newCy + newRy,
            )
            newCx += snap.dx
            newCy += snap.dy
            if (snap.dx !== 0) newRx = attrs.rx
            if (snap.dy !== 0) newRy = attrs.ry
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

          if (isCtrlKey) {
            const snap = getSnapOffsetToEdges(newX, newX, newY, newY)

            // Snap only position
            newX += snap.dx
            newY += snap.dy

            // If snapped, reset length to original
            if (snap.dx !== 0) newX = attrs[keyX]
            if (snap.dy !== 0) newY = attrs[keyY]
          }

          applyLine(keyX, keyY, newX, newY)
        }

        isSymmetricalObject.value =
          (attrs.x1 === attrs.x2 || attrs.y1 === attrs.y2) &&
          pythagorean(attrs.x1 - attrs.x2, attrs.y1 - attrs.y2) > minLength
      }

      object.value.attrs = { ...attrs }
    }

    // DRAG
    if (isDragging.value) {
      let offsetX = dx
      let offsetY = dy

      if (isCtrlKey) {
        if ('x' in attrs && 'y' in attrs && tag !== 'text') {
          const snap = getSnapOffsetToEdges(
            attrs.x + dx,
            attrs.x + attrs.width + dx,
            attrs.y + dy,
            attrs.y + attrs.height + dy,
          )
          offsetX += snap.dx
          offsetY += snap.dy
        } else if (tag === 'text' && object.value.textBBox) {
          const bbox = object.value.textBBox
          const snap = getSnapOffsetToEdges(
            bbox.x + dx,
            bbox.x + bbox.width + dx,
            bbox.y + dy,
            bbox.y + bbox.height + dy,
          )
          offsetX += snap.dx
          offsetY += snap.dy
        } else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
          const snap = getSnapOffsetToEdges(
            attrs.cx - attrs.rx + dx,
            attrs.cx + attrs.rx + dx,
            attrs.cy - attrs.ry + dy,
            attrs.cy + attrs.ry + dy,
          )
          offsetX += snap.dx
          offsetY += snap.dy
        } else if ('x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
          const xMin = Math.min(attrs.x1, attrs.x2)
          const xMax = Math.max(attrs.x1, attrs.x2)
          const yMin = Math.min(attrs.y1, attrs.y2)
          const yMax = Math.max(attrs.y1, attrs.y2)

          const snap = getSnapOffsetToEdges(xMin + dx, xMax + dx, yMin + dy, yMax + dy)
          offsetX += snap.dx
          offsetY += snap.dy
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
    const isActive = isDragging.value || activeResizerIndex.value !== null
    if (!isActive) return

    isDragging.value = false
    activeResizerIndex.value = null
    isSymmetricalObject.value = false

    remainingDx.value = 0
    remainingDy.value = 0

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Rotate a point (x, y) around (cx, cy) by angle in degrees
   * @param {number} x
   * @param {number} y
   * @param {number} cx - center x
   * @param {number} cy - center y
   * @param {number} angle - degrees
   * @returns {{x: number, y: number}}
   */
  const rotatePoint = (x, y, cx, cy, angle) => {
    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    const dx = x - cx
    const dy = y - cy

    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    }
  }

  /**
   * Get transformed bounding box with rotation applied
   * @param {Object} o - SVG object
   * @returns {{left: number, right: number, top: number, bottom: number}}
   */
  const getTransformedBoundingBox = (o) => {
    const a = o.attrs
    const transform = a.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/)

    const angle = match ? parseFloat(match[1]) : 0
    const cx = match ? parseFloat(match[2]) : 0
    const cy = match ? parseFloat(match[3]) : 0

    let corners = []

    // RECT
    if ('x' in a && 'y' in a && 'width' in a && 'height' in a) {
      corners = [
        rotatePoint(a.x, a.y, cx, cy, angle),
        rotatePoint(a.x + a.width, a.y, cx, cy, angle),
        rotatePoint(a.x, a.y + a.height, cx, cy, angle),
        rotatePoint(a.x + a.width, a.y + a.height, cx, cy, angle),
      ]
    }

    // ELLIPSE
    else if ('cx' in a && 'cy' in a && 'rx' in a && 'ry' in a) {
      corners = [
        rotatePoint(a.cx - a.rx, a.cy - a.ry, cx, cy, angle),
        rotatePoint(a.cx + a.rx, a.cy - a.ry, cx, cy, angle),
        rotatePoint(a.cx - a.rx, a.cy + a.ry, cx, cy, angle),
        rotatePoint(a.cx + a.rx, a.cy + a.ry, cx, cy, angle),
      ]
    }

    // LINE
    else if ('x1' in a && 'y1' in a && 'x2' in a && 'y2' in a) {
      corners = [rotatePoint(a.x1, a.y1, cx, cy, angle), rotatePoint(a.x2, a.y2, cx, cy, angle)]
    }

    // TEXT (requires precomputed bounding box!)
    else if (o.tag === 'text' && o.textBBox) {
      const b = o.textBBox
      corners = [
        rotatePoint(b.x, b.y, cx, cy, angle),
        rotatePoint(b.x + b.width, b.y, cx, cy, angle),
        rotatePoint(b.x, b.y + b.height, cx, cy, angle),
        rotatePoint(b.x + b.width, b.y + b.height, cx, cy, angle),
      ]
    }

    if (!corners.length) return null

    const xs = corners.map((p) => p.x)
    const ys = corners.map((p) => p.y)

    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    }
  }

  /**
   * Get snap edge targets (with rotation applied)
   * @returns {Array<{left: number, right: number, top: number, bottom: number}>}
   */
  const getSnapEdgeTargets = () => {
    return imageStore.svgObjects
      .filter((o) => o.id !== object.value.id)
      .map((o) => getTransformedBoundingBox(o))
      .filter(Boolean)
  }

  /**
   * Snap to nearest edges (left, right, top, bottom) if overlapping in opposite axis
   * @param {number} left - current left edge
   * @param {number} right - current right edge
   * @param {number} top - current top edge
   * @param {number} bottom - current bottom edge
   * @param {number} threshold - snap distance
   * @returns {{dx: number, dy: number}}
   */
  const getSnapOffsetToEdges = (left, right, top, bottom, threshold = 2) => {
    const targets = getSnapEdgeTargets()
    let dx = 0
    let dy = 0

    for (const t of targets) {
      const verticalOverlap = !(bottom < t.top || top > t.bottom)
      const horizontalOverlap = !(right < t.left || left > t.right)

      if (verticalOverlap) {
        if (Math.abs(left - t.left) < threshold) dx = t.left - left
        else if (Math.abs(left - t.right) < threshold) dx = t.right - left
        else if (Math.abs(right - t.left) < threshold) dx = t.left - right
        else if (Math.abs(right - t.right) < threshold) dx = t.right - right
      }

      if (horizontalOverlap) {
        if (Math.abs(top - t.top) < threshold) dy = t.top - top
        else if (Math.abs(top - t.bottom) < threshold) dy = t.bottom - top
        else if (Math.abs(bottom - t.top) < threshold) dy = t.top - bottom
        else if (Math.abs(bottom - t.bottom) < threshold) dy = t.bottom - bottom
      }
    }

    return { dx, dy }
  }

  /**
   * Global click handler to deselect the SVG object when clicking outside
   * @param {MouseEvent} e - Mouse event
   */
  const onGlobalClick = (e) => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (!e.target.closest('g')) {
      imageStore.selectedSvgObjectId = null
      showResizers.value = false
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
  watchEffect(() => {
    if (object.value.tag === 'text' && textRef.value) {
      const bbox = textRef.value.getBBox()
      object.value.textBBox = {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
      }
    }
  })

  /**
   * Compute display info for current SVG object (position and size)
   */
  const objectInfo = computed(() => {
    const attrs = object.value.attrs

    if (!attrs) return null

    if (object.value.tag === 'rect') {
      return {
        width: Math.round(attrs.width),
        height: Math.round(attrs.height),
      }
    } else if (object.value.tag === 'ellipse') {
      return {
        width: Math.round(attrs.rx * 2),
        height: Math.round(attrs.ry * 2),
      }
    } else if (object.value.tag === 'line') {
      return {
        width: Math.round(attrs.x2 - attrs.x1),
        height: Math.round(attrs.y2 - attrs.y1),
      }
    }
    return null
  })

  /**
   * Add global event listeners for mouse events
   */
  onMounted(() => {
    window.addEventListener('click', onGlobalClick)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

  /**
   * Remove global event listeners when the component is unmounted
   */
  onBeforeUnmount(() => {
    window.removeEventListener('click', onGlobalClick)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  })

  return {
    textRef,
    isSelected,
    onMouseDown,
    onMouseDownResizer,
    onMouseDownDrag,
    getResizerPositions,
    boundingBox,
    resizerSize,
    areSvgObjectOperationsEnabled,
    object,
    isSymmetricalObject,
    objectInfo,
    activeResizerIndex,
    isDragging,
    showResizers,
  }
}
