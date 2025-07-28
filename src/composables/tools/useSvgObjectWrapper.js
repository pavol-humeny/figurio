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
   * Reactive variable to track the index of the active resizer
   */
  const activeResizerIndex = ref(null)

  /**
   * Watch for changes in the selected tool and reset the selected SVG object when the tool changes
   */
  watch(
    () => editorStore.selectedToolKey,
    () => {
      imageStore.selectedSvgObjectId = null
    },
  )

  const ratio = ref(1)

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

      // RECTANGLE
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

      // ELLIPSE
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

      // LINE
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

      const i = imageStore.svgObjects.findIndex((o) => o.id === object.value.id)
      if (i !== -1) imageStore.svgObjects[i].attrs = { ...attrs }
      return
    }

    // DRAG
    if (!isDragging.value) return

    // Rectangle and text
    if ('x' in attrs && 'y' in attrs) {
      if (tag === 'text' && textBBox.value) {
        const newTextX = clamp(
          textBBox.value.x + dx,
          0,
          imageStore.fileDimensions.width - textBBox.value.width,
        )
        const newTextY = clamp(
          textBBox.value.y + dy,
          0,
          imageStore.fileDimensions.height - textBBox.value.height,
        )
        attrs.x = newTextX
        attrs.y = newTextY - textBBox.value.y + attrs.y
        textBBox.value.x = newTextX
        textBBox.value.y = newTextY
      } else {
        attrs.x = clamp(attrs.x + dx, 0, imageStore.fileDimensions.width - attrs.width)
        attrs.y = clamp(attrs.y + dy, 0, imageStore.fileDimensions.height - attrs.height)
      }
    }
    // Ellipse
    else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
      attrs.cx = clamp(attrs.cx + dx, 0 + attrs.rx, imageStore.fileDimensions.width - attrs.rx)
      attrs.cy = clamp(attrs.cy + dy, 0 + attrs.ry, imageStore.fileDimensions.height - attrs.ry)
    }
    // Line
    else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      const maxX = imageStore.fileDimensions.width
      const maxY = imageStore.fileDimensions.height

      let newX1 = attrs.x1 + dx
      let newY1 = attrs.y1 + dy
      let newX2 = attrs.x2 + dx
      let newY2 = attrs.y2 + dy

      // Uprav každú súradnicu individuálne, aby nešla mimo
      const clampedX1 = clamp(newX1, 0, maxX)
      const clampedY1 = clamp(newY1, 0, maxY)
      const clampedX2 = clamp(newX2, 0, maxX)
      const clampedY2 = clamp(newY2, 0, maxY)

      // Ak sa aspoň jedna súradnica zmenila kvôli clamping, zmeň posun, inak nastav priamo
      const adjustedDx1 = clampedX1 - attrs.x1
      const adjustedDy1 = clampedY1 - attrs.y1
      const adjustedDx2 = clampedX2 - attrs.x2
      const adjustedDy2 = clampedY2 - attrs.y2

      // Použi minimálny spoločný posun
      const finalDx = Math.abs(adjustedDx1) < Math.abs(adjustedDx2) ? adjustedDx1 : adjustedDx2
      const finalDy = Math.abs(adjustedDy1) < Math.abs(adjustedDy2) ? adjustedDy1 : adjustedDy2

      // Posuň obidva body o rovnaký posun (aby čiara ostala konzistentná)
      attrs.x1 += finalDx
      attrs.y1 += finalDy
      attrs.x2 += finalDx
      attrs.y2 += finalDy
    }

    const i = imageStore.svgObjects.findIndex((o) => o.id === object.value.id)
    if (i !== -1) imageStore.svgObjects[i].attrs = { ...attrs }
  }

  /**
   * Mouse up handler for stopping the drag operation
   */
  const onMouseUp = () => {
    const isActive = isDragging.value || activeResizerIndex.value !== null
    if (!isActive) return

    isDragging.value = false
    activeResizerIndex.value = null
    historyStore.push(imageStore.getSnapshot(t))
    isHightLighted.value = false

    remainingDx.value = 0
    remainingDy.value = 0
  }

  /**
   * Global click handler to deselect the SVG object when clicking outside
   * @param {MouseEvent} e - Mouse event
   */
  const onGlobalClick = (e) => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (!e.target.closest('g')) imageStore.selectedSvgObjectId = null
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

    // Circle
    // if (tag === 'circle') {
    //   const cx = attrs.cx || 0,
    //     cy = attrs.cy || 0,
    //     r = attrs.r || 0
    //   return [
    //     { x: cx - r, y: cy - r, cursor: 'nwse-resize' },
    //     { x: cx + r, y: cy - r, cursor: 'nesw-resize' },
    //     { x: cx + r, y: cy + r, cursor: 'nwse-resize' },
    //     { x: cx - r, y: cy + r, cursor: 'nesw-resize' },
    //   ]
    // }

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
  }
}
