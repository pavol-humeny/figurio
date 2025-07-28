import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'

/**
 * Whether interactive SVG object operations are allowed
 * Can be toggled globally (e.g. from tools)
 */
const areSvgObjectOperationsEnabled = ref(true)

/**
 * Logic for interactive SVG object
 * @param {Object} object - SVG object (with id, tag, attrs)
 */
export function useSvgObjectWrapper(object, imageStore, viewportStore) {
  const isSelected = computed(
    () => imageStore.selectedSvgObjectId === object.id && areSvgObjectOperationsEnabled.value,
  )
  const isDragging = ref(false)
  const startX = ref(0)
  const startY = ref(0)

  const textRef = ref(null)
  const textBBox = ref(null)

  const onMouseDown = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return

    imageStore.selectedSvgObjectId = object.id
    startX.value = event.clientX
    startY.value = event.clientY
    event.stopPropagation()
  }

  const onMouseMove = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return
    if (!isSelected.value || !isDragging.value) return

    const dx = (event.clientX - startX.value) / viewportStore.realZoomLevel
    const dy = (event.clientY - startY.value) / viewportStore.realZoomLevel
    startX.value = event.clientX
    startY.value = event.clientY

    const attrs = object.attrs
    if ('x' in attrs && 'y' in attrs) {
      attrs.x += dx
      attrs.y += dy
    } else if ('cx' in attrs && 'cy' in attrs) {
      attrs.cx += dx
      attrs.cy += dy
    } else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      attrs.x1 += dx
      attrs.y1 += dy
      attrs.x2 += dx
      attrs.y2 += dy
    }

    const i = imageStore.svgObjects.findIndex((o) => o.id === object.id)
    if (i !== -1) imageStore.svgObjects[i].attrs = { ...attrs }

    if (object.tag === 'text' && textBBox.value) {
      textBBox.value.x += dx
      textBBox.value.y += dy
    }
  }

  const onMouseDownDrag = (event) => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (isSelected.value) {
      isDragging.value = true
      startX.value = event.clientX
      startY.value = event.clientY
      event.stopPropagation()
    }
  }

  const onMouseUp = () => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (isDragging.value) isDragging.value = false
  }

  const onGlobalClick = (e) => {
    if (!areSvgObjectOperationsEnabled.value) return

    if (!e.target.closest('g')) imageStore.selectedSvgObjectId = null
  }

  // /**
  //  * Delete currently selected SVG object
  //  */
  // const deleteSelectedSvgObject = () => {
  //   if (!areSvgObjectOperationsEnabled.value) return
  //   if (!imageStore.selectedSvgObjectId) return

  //   const i = imageStore.getIndexOfSelectedSvgObject()
  //   if (i !== -1) {
  //     imageStore.svgObjects.splice(i, 1)
  //     imageStore.selectedSvgObjectId = null
  //   }
  // }

  // /**
  //  * Move currently selected SVG object forward
  //  */
  // const moveSelectedSvgObjectForward = () => {
  //   if (!areSvgObjectOperationsEnabled.value) return
  //   if (!imageStore.selectedSvgObjectId) return

  //   const i = imageStore.getIndexOfSelectedSvgObject()

  //   if (i !== -1 && i < imageStore.svgObjects.length - 1) {
  //     const obj = imageStore.svgObjects.splice(i, 1)[0]
  //     imageStore.svgObjects.splice(i + 1, 0, obj)
  //   }
  // }

  // /**
  //  * Move currently selected SVG object backward
  //  */
  // const moveSelectedSvgObjectBackward = () => {
  //   if (!areSvgObjectOperationsEnabled.value) return
  //   if (!imageStore.selectedSvgObjectId) return

  //   const i = imageStore.getIndexOfSelectedSvgObject()

  //   if (i > 0) {
  //     const obj = imageStore.svgObjects.splice(i, 1)[0]
  //     imageStore.svgObjects.splice(i - 1, 0, obj)
  //   }
  // }

  const getResizerPositions = () => {
    const { tag, attrs } = object
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

  const resizerSize = computed(() => {
    const base = imageStore.fileDimensions?.width || 500
    return Math.max(2, base / 100)
  })

  watchEffect(() => {
    if (object.tag === 'text' && textRef.value) {
      const bbox = textRef.value.getBBox()
      textBBox.value = {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
      }
    }
  })

  onMounted(() => {
    window.addEventListener('click', onGlobalClick)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  })

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
  }
}
