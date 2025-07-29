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
  const { clamp, pythagorean } = useMath()

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
  const isHightLighted = ref(false)

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
  const textBBox = ref(null)

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

    if (object.value.tag === 'rect') {
      ratio.value = object.value.attrs.width / object.value.attrs.height
    } else if (object.value.tag === 'ellipse') {
      ratio.value = object.value.attrs.rx / object.value.attrs.ry
    } else {
      ratio.value = 1
    }

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

    let rawDx = (event.clientX - startX.value) / viewportStore.realZoomLevel + remainingDx.value
    let rawDy = (event.clientY - startY.value) / viewportStore.realZoomLevel + remainingDy.value

    // Round to whole pixels
    let dx = Math.trunc(rawDx)
    let dy = Math.trunc(rawDy)

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

          const newX = right - newW
          const newY = bottom - newH
          applyRect(newX, newY, right - newX, bottom - newY)
        } else if (activeResizerIndex.value === 1) {
          // Top-right
          const newW = attrs.width + dx
          let newH = keepRatio ? newW / ratio.value : attrs.height - dy

          // Do not change height if resizer is on the right edge
          if (attrs.y <= 0 && dy < 0) {
            newH = attrs.height
          }

          const newX = left
          const newY = bottom - newH
          applyRect(newX, newY, newW, bottom - newY)
        } else if (activeResizerIndex.value === 2) {
          // Bottom-right
          let newW = attrs.width - dx
          const newH = keepRatio ? newW / ratio.value : attrs.height + dy

          // Do not change width if resizer is on the left edge
          if (attrs.x <= 0 && dx < 0) {
            newW = attrs.width
          }

          const newX = right - newW
          const newY = top
          applyRect(newX, newY, right - newX, newH)
        } else if (activeResizerIndex.value === 3) {
          // Bottom-left
          const newW = attrs.width + dx
          const newH = keepRatio ? newW / ratio.value : attrs.height + dy
          const newX = left
          const newY = top
          applyRect(newX, newY, newW, newH)
        }

        isHightLighted.value = attrs.width === attrs.height
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

          console.log('x', attrs.cx, 'y', attrs.cy, 'rx', attrs.rx, 'ry', attrs.ry)
          console.log('newRx', newRx, 'newRy', newRy)

          // Do not change radius if resizer is on the left edge
          if (attrs.cx - attrs.rx <= 0 && dx < 0) {
            newRx = attrs.rx
          }

          // Do not change radius if resizer is on the top edge
          if (attrs.cy - attrs.ry <= 0 && dy < 0) {
            newRy = attrs.ry
          }

          const newCx = right - newRx
          const newCy = bottom - newRy
          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 1) {
          // Top-right
          const left = attrs.cx - attrs.rx
          const bottom = attrs.cy + attrs.ry
          let newRx = attrs.rx + dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry - dy

          // Do not change radius if resizer is on the right edge
          if (attrs.cx + attrs.rx >= maxW && dx > 0) {
            newRx = attrs.rx
          }

          // Do not change radius if resizer is on the top edge
          if (attrs.cy - attrs.ry <= 0 && dy < 0) {
            newRy = attrs.ry
          }

          const newCx = left + newRx
          const newCy = bottom - newRy
          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 2) {
          console.log('bottom-right')
          // Bottom-right
          const left = attrs.cx - attrs.rx
          const top = attrs.cy - attrs.ry
          let newRx = attrs.rx + dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry + dy

          // Do not change radius if resizer is on the bottom edge
          if (attrs.cy + attrs.ry >= maxH && dy > 0) {
            newRy = attrs.ry
          }

          // Do not change radius if resizer is on the right edge
          if (attrs.cx + attrs.rx >= maxW && dx > 0) {
            newRx = attrs.rx
          }

          const newCx = left + newRx
          const newCy = top + newRy
          applyEllipse(newCx, newCy, newRx, newRy)
        } else if (activeResizerIndex.value === 3) {
          // Bottom-left
          const right = attrs.cx + attrs.rx
          const top = attrs.cy - attrs.ry
          let newRx = attrs.rx - dx
          let newRy = keepRatio ? newRx / ratio.value : attrs.ry + dy

          // Do not change radius if resizer is on the bottom edge
          if (attrs.cy + attrs.ry >= maxH && dy > 0) {
            newRy = attrs.ry
          }

          // Do not change radius if resizer is on the right edge
          if (attrs.cx - attrs.rx <= 0 && dx < 0) {
            newRx = attrs.rx
          }

          const newCx = right - newRx
          const newCy = top + newRy
          applyEllipse(newCx, newCy, newRx, newRy)
        }

        isHightLighted.value = attrs.rx === attrs.ry
      }
      // Line
      if (tag === 'line') {
        const minLength = 2
        const maxX = imageStore.fileDimensions.width
        const maxY = imageStore.fileDimensions.height

        if (activeResizerIndex.value === 0 || activeResizerIndex.value === 1) {
          const keyX = activeResizerIndex.value === 0 ? 'x1' : 'x2'
          const keyY = activeResizerIndex.value === 0 ? 'y1' : 'y2'
          const otherX = activeResizerIndex.value === 0 ? attrs.x2 : attrs.x1
          const otherY = activeResizerIndex.value === 0 ? attrs.y2 : attrs.y1

          let newX = clamp(attrs[keyX] + dx, 0, maxX)
          let newY = clamp(attrs[keyY] + dy, 0, maxY)
          const len = pythagorean(newX - otherX, newY - otherY)

          if (len >= minLength) {
            attrs[keyX] = newX
            attrs[keyY] = newY
          }
        }

        isHightLighted.value =
          (attrs.x1 === attrs.x2 || attrs.y1 === attrs.y2) &&
          pythagorean(attrs.x1 - attrs.x2, attrs.y1 - attrs.y2) > minLength
      }

      object.value.attrs = { ...attrs }
    }

    // DRAG
    if (isDragging.value) {
      // Rectangle and text
      if ('x' in attrs && 'y' in attrs) {
        if (tag === 'text' && textBBox.value) {
          attrs.x += dx
          attrs.y += dy

          textBBox.value.x = textBBox.value.x + dx
          textBBox.value.y = textBBox.value.y + dy
        } else {
          attrs.x += dx
          attrs.y += dy
        }
      }
      // Ellipse
      else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
        attrs.cx += dx
        attrs.cy += dy
      }
      // Line
      else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
        attrs.x1 += dx
        attrs.y1 += dy
        attrs.x2 += dx
        attrs.y2 += dy
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
    isHightLighted.value = false

    remainingDx.value = 0
    remainingDy.value = 0

    historyStore.push(imageStore.getSnapshot(t))
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
    if (tag === 'text' && textBBox.value) {
      const { x, y, width, height } = textBBox.value
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
      textBBox.value = {
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
    isHightLighted,
    objectInfo,
    activeResizerIndex,
    isDragging,
    showResizers,
  }
}
