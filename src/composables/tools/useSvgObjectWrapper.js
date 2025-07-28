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

    // Zaokrúhlený posun v pixeloch (celé čísla)
    let dx = Math.trunc(rawDx)
    let dy = Math.trunc(rawDy)

    // Zvyšok si odlož na ďalší posun
    remainingDx.value = rawDx - dx
    remainingDy.value = rawDy - dy

    // Posledná pozícia kurzora
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

        // Highlight the object if it is a square
        if (attrs.width === attrs.height) {
          isHightLighted.value = true
        } else {
          isHightLighted.value = false
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

        // Highlight the object if it is a circle
        if (attrs.rx === attrs.ry) {
          isHightLighted.value = true
        } else {
          isHightLighted.value = false
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

        // Highlight the object if it is a horizontal or vertical line
        if ((x1 === x2 || y1 === y2) && pythagorean(x1 - x2, y1 - y2) > minLength) {
          isHightLighted.value = true
        } else {
          isHightLighted.value = false
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
    // Ellipse
    else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
      attrs.cx = clamp(attrs.cx + dx, 0, imageStore.fileDimensions.width)
      attrs.cy = clamp(attrs.cy + dy, 0, imageStore.fileDimensions.height)
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
  }
}
