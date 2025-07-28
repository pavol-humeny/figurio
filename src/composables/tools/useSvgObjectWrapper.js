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
  const { clamp } = useMath()

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
  }

  /**
   * Mouse move handler for dragging the SVG object
   * @param {MouseEvent} event - Mouse event
   */
  const onMouseMove = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return
    if (!isSelected.value || !isDragging.value) return

    const dx = (event.clientX - startX.value) / viewportStore.realZoomLevel
    const dy = (event.clientY - startY.value) / viewportStore.realZoomLevel
    startX.value = event.clientX
    startY.value = event.clientY

    const attrs = object.value.attrs

    let newX
    let newY

    if ('x' in attrs && 'y' in attrs) {
      if (object.value.tag === 'text' && textBBox.value) {
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

        // Adjust y based on baseline offset
        attrs.x = newTextX
        attrs.y = newTextY - textBBox.value.y + attrs.y

        // Update bounding box manually
        textBBox.value.x = newTextX
        textBBox.value.y = newTextY
      } else {
        newX = clamp(
          attrs.x + dx,
          0 - attrs.width / 2,
          imageStore.fileDimensions.width - attrs.width / 2,
        )
        newY = clamp(
          attrs.y + dy,
          0 - attrs.height / 2,
          imageStore.fileDimensions.height - attrs.height / 2,
        )
        attrs.x = newX
        attrs.y = newY
      }
    } else if ('cx' in attrs && 'cy' in attrs) {
      const newCx = clamp(attrs.cx + dx, 0, imageStore.fileDimensions.width)
      const newCy = clamp(attrs.cy + dy, 0, imageStore.fileDimensions.height)

      attrs.cx = newCx
      attrs.cy = newCy
    } else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
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

    if (isDragging.value) {
      isDragging.value = false
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
    if (tag === 'circle') {
      const cx = attrs.cx || 0,
        cy = attrs.cy || 0,
        r = attrs.r || 0
      return [
        { x: cx - r, y: cy - r, cursor: 'nwse-resize' },
        { x: cx + r, y: cy - r, cursor: 'nesw-resize' },
        { x: cx + r, y: cy + r, cursor: 'nwse-resize' },
        { x: cx - r, y: cy + r, cursor: 'nesw-resize' },
      ]
    }
    if (tag === 'text' && textBBox.value) {
      const { x, y, width, height } = textBBox.value
      return [
        { x, y, cursor: 'move' },
        { x: x + width, y, cursor: 'move' },
        { x, y: y + height, cursor: 'move' },
        { x: x + width, y: y + height, cursor: 'move' },
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
    return Math.max(2, base / 100)
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
    onMouseDownDrag,
    getResizerPositions,
    boundingBox,
    resizerSize,
    areSvgObjectOperationsEnabled,
    object,
  }
}
