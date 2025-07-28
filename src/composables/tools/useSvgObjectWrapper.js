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
   * Reactive variables for dragging the SVG object
   */
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)

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
  }

  const onMouseDownResizer = (event, index) => {
    if (!areSvgObjectOperationsEnabled.value || !isSelected.value) return
    activeResizerIndex.value = index
    startX.value = event.clientX
    startY.value = event.clientY
    event.stopPropagation()
  }

  /**
   * Mouse move handler for dragging the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseMove = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return
    if (!isSelected.value) return

    let dx = (event.clientX - startX.value) / viewportStore.realZoomLevel
    let dy = (event.clientY - startY.value) / viewportStore.realZoomLevel
    startX.value = event.clientX
    startY.value = event.clientY

    const { tag, attrs } = object.value

    // RESIZE
    if (activeResizerIndex.value !== null) {
      const minSize = 1

      const keepRatio = event.shiftKey

      // RECT
      if (tag === 'rect') {
        // const ratio = attrs.width / attrs.height
        if (activeResizerIndex.value === 0) {
          if (keepRatio) {
            const originalRight = attrs.x + attrs.width
            const originalBottom = attrs.y + attrs.height
            const newWidth = attrs.width - dx
            const newHeight = newWidth / ratio.value

            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = originalRight - newWidth
              attrs.y = originalBottom - newHeight
            }
          } else {
            const newWidth = attrs.width - dx
            const newHeight = attrs.height - dy
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.x += dx
              attrs.y += dy
              attrs.width = newWidth
              attrs.height = newHeight
            }
          }
        } else if (activeResizerIndex.value === 1) {
          const left = attrs.x
          const bottom = attrs.y + attrs.height
          if (keepRatio) {
            const newWidth = attrs.width + dx
            const newHeight = newWidth / ratio.value
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = left
              attrs.y = bottom - newHeight
            }
          } else {
            const newWidth = attrs.width + dx
            const newHeight = attrs.height - dy
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = left
              attrs.y = bottom - newHeight
            }
          }
        } else if (activeResizerIndex.value === 2) {
          const right = attrs.x + attrs.width
          const top = attrs.y
          if (keepRatio) {
            const newWidth = attrs.width - dx
            const newHeight = newWidth / ratio.value
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = right - newWidth
              attrs.y = top
            }
          } else {
            const newWidth = attrs.width - dx
            const newHeight = attrs.height + dy
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = right - newWidth
              attrs.y = top
            }
          }
        } else if (activeResizerIndex.value === 3) {
          const left = attrs.x
          const top = attrs.y
          if (keepRatio) {
            const newWidth = attrs.width + dx
            const newHeight = newWidth / ratio.value
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = left
              attrs.y = top
            }
          } else {
            const newWidth = attrs.width + dx
            const newHeight = attrs.height + dy
            if (newWidth >= minSize && newHeight >= minSize) {
              attrs.width = newWidth
              attrs.height = newHeight
              attrs.x = left
              attrs.y = top
            }
          }
        }
      }

      // ELLIPSE
      if (tag === 'ellipse') {
        // Because it change radius from both sides, we need to divide dx and dy by 2
        dx = dx / 2
        dy = dy / 2

        if (activeResizerIndex.value === 0) {
          const right = attrs.cx + attrs.rx
          const bottom = attrs.cy + attrs.ry
          if (keepRatio) {
            const newRx = attrs.rx - dx
            const newRy = newRx / ratio.value
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = right - newRx
              attrs.cy = bottom - newRy
            }
          } else {
            const newRx = attrs.rx - dx
            const newRy = attrs.ry - dy
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = right - newRx
              attrs.cy = bottom - newRy
            }
          }
        } else if (activeResizerIndex.value === 1) {
          const left = attrs.cx - attrs.rx
          const bottom = attrs.cy + attrs.ry
          if (keepRatio) {
            const newRx = attrs.rx + dx
            const newRy = newRx / ratio.value
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = left + newRx
              attrs.cy = bottom - newRy
            }
          } else {
            const newRx = attrs.rx + dx
            const newRy = attrs.ry - dy
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = left + newRx
              attrs.cy = bottom - newRy
            }
          }
        } else if (activeResizerIndex.value === 2) {
          const left = attrs.cx - attrs.rx
          const top = attrs.cy - attrs.ry
          if (keepRatio) {
            const newRx = attrs.rx + dx
            const newRy = newRx / ratio.value
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = left + newRx
              attrs.cy = top + newRy
            }
          } else {
            const newRx = attrs.rx + dx
            const newRy = attrs.ry + dy
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = left + newRx
              attrs.cy = top + newRy
            }
          }
        } else if (activeResizerIndex.value === 3) {
          const right = attrs.cx + attrs.rx
          const top = attrs.cy - attrs.ry
          if (keepRatio) {
            const newRx = attrs.rx - dx
            const newRy = newRx / ratio.value
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = right - newRx
              attrs.cy = top + newRy
            }
          } else {
            const newRx = attrs.rx - dx
            const newRy = attrs.ry + dy
            if (newRx >= minSize && newRy >= minSize) {
              attrs.rx = newRx
              attrs.ry = newRy
              attrs.cx = right - newRx
              attrs.cy = top + newRy
            }
          }
        }
      }

      // LINE
      if (tag === 'line') {
        const { x1, y1, x2, y2 } = attrs

        const minLength = 2

        if (activeResizerIndex.value === 0) {
          const newX1 = x1 + dx
          const newY1 = y1 + dy
          const newLength = pythagorean(newX1 - x2, newY1 - y2)
          if (newLength >= minLength) {
            attrs.x1 = newX1
            attrs.y1 = newY1
          }
        } else if (activeResizerIndex.value === 1) {
          const newX2 = x2 + dx
          const newY2 = y2 + dy
          const newLength = pythagorean(newX2 - x1, newY2 - y1)
          if (newLength >= minLength) {
            attrs.x2 = newX2
            attrs.y2 = newY2
          }
        }
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
          0 - textBBox.value.width / 2,
          imageStore.fileDimensions.width - textBBox.value.width / 2,
        )
        const newTextY = clamp(
          textBBox.value.y + dy,
          0 - textBBox.value.height / 2,
          imageStore.fileDimensions.height - textBBox.value.height / 2,
        )
        attrs.x = newTextX
        attrs.y = newTextY - textBBox.value.y + attrs.y
        textBBox.value.x = newTextX
        textBBox.value.y = newTextY
      } else {
        attrs.x = clamp(
          attrs.x + dx,
          0 - attrs.width / 2,
          imageStore.fileDimensions.width - attrs.width / 2,
        )
        attrs.y = clamp(
          attrs.y + dy,
          0 - attrs.height / 2,
          imageStore.fileDimensions.height - attrs.height / 2,
        )
      }
    }
    // Circle
    // else if ('cx' in attrs && 'cy' in attrs) {
    //   attrs.cx = clamp(attrs.cx + dx, 0, imageStore.fileDimensions.width)
    //   attrs.cy = clamp(attrs.cy + dy, 0, imageStore.fileDimensions.height)
    // }
    // Ellipse
    else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
      attrs.cx = clamp(attrs.cx + dx, 0, imageStore.fileDimensions.width)
      attrs.cy = clamp(attrs.cy + dy, 0, imageStore.fileDimensions.height)
    }
    // Line
    else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      attrs.x1 += dx
      attrs.y1 += dy
      attrs.x2 += dx
      attrs.y2 += dy
    }

    const i = imageStore.svgObjects.findIndex((o) => o.id === object.value.id)
    if (i !== -1) imageStore.svgObjects[i].attrs = { ...attrs }
  }

  /**
   * Mouse down handler for dragging the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseDownDrag = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (isSelected.value) {
      isDragging.value = true
      startX.value = event.clientX
      startY.value = event.clientY
      event.stopPropagation()
    }
  }

  /**
   * Mouse up handler for stopping the drag operation
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseUp = () => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (isDragging.value || activeResizerIndex.value !== null) {
      isDragging.value = false
      activeResizerIndex.value = null
      historyStore.push(imageStore.getSnapshot(t))
    }
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
   * Get the size of the resizers for the SVG object
   * @returns {number} Size of the resizers
   */
  const resizerSize = computed(() => {
    const base = imageStore.fileDimensions?.width || 500
    return Math.max(1, base / 100) / viewportStore.realZoomLevel
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
  }
}
