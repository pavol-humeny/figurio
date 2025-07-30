import { computed } from 'vue'

export function useSvgObjects(imageStore, historyStore, t) {
  /**
   * Move the selected object by a specified offset in global coordinates (ignores rotation)
   * @param {number} dx - Offset in X direction
   * @param {number} dy - Offset in Y direction
   */
  const moveObjectBy = (dx, dy, local = false) => {
    if (imageStore.selectedSvgObjectId === null) return
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    if (!object) return

    const { attrs, tag, textBBox } = object

    const transform = attrs.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
    const angle = match ? parseFloat(match[1]) : 0

    if (local) {
      const rad = (angle * Math.PI) / 180
      dx = dx * Math.cos(rad) - dy * Math.sin(rad)
      dy = dx * Math.sin(rad) + dy * Math.cos(rad)
    }

    // Move object
    if ('x' in attrs && 'y' in attrs) {
      attrs.x += dx
      attrs.y += dy

      if (tag === 'text' && textBBox) {
        textBBox.x += dx
        textBBox.y += dy
      }
    } else if ('cx' in attrs && 'cy' in attrs) {
      attrs.cx += dx
      attrs.cy += dy
    } else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      attrs.x1 += dx
      attrs.x2 += dx
      attrs.y1 += dy
      attrs.y2 += dy
    }

    // If rotation, just update center
    if (match) {
      let cx = 0,
        cy = 0
      if ('x' in attrs && 'y' in attrs && 'width' in attrs && 'height' in attrs) {
        cx = attrs.x + attrs.width / 2
        cy = attrs.y + attrs.height / 2
      } else if ('cx' in attrs && 'cy' in attrs) {
        cx = attrs.cx
        cy = attrs.cy
      } else if ('x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
        cx = (attrs.x1 + attrs.x2) / 2
        cy = (attrs.y1 + attrs.y2) / 2
      } else if (tag === 'text' && textBBox) {
        cx = textBBox.x + textBBox.width / 2
        cy = textBBox.y + textBBox.height / 2
      }

      attrs.transform = `rotate(${angle}, ${cx}, ${cy})`
    }

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Move the selected object one pixel to the left (global)
   */
  const moveObjectLeftGlobal = () => moveObjectBy(-1, 0, false)

  /**
   * Move the selected object one pixel to the right (global)
   */
  const moveObjectRightGlobal = () => moveObjectBy(1, 0, false)

  /**
   * Move the selected object one pixel up (global)
   */
  const moveObjectUpGlobal = () => moveObjectBy(0, -1, false)

  /**
   * Move the selected object one pixel down (global)
   */
  const moveObjectDownGlobal = () => moveObjectBy(0, 1, false)

  /**
   * Move the selected object one pixel to the left (local)
   */
  const moveObjectLeftLocal = () => moveObjectBy(-1, 0, true)

  /**
   * Move the selected object one pixel to the right (local)
   */
  const moveObjectRightLocal = () => moveObjectBy(1, 0, true)

  /**
   * Move the selected object one pixel up (local)
   */
  const moveObjectUpLocal = () => moveObjectBy(0, -1, true)

  /**
   * Move the selected object one pixel down (local)
   */
  const moveObjectDownLocal = () => moveObjectBy(0, 1, true)

  /**
   * Delete selected SVG object
   */
  const deleteSelectedSvgObject = (t) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = imageStore.getIndexOfSelectedSvgObject()
    if (i !== -1) {
      imageStore.svgObjects.splice(i, 1)
      imageStore.selectedSvgObjectId = null
    }

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Move the selected SVG object forward
   */
  const moveSelectedSvgObjectForward = (t) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = imageStore.getIndexOfSelectedSvgObject()
    if (i !== -1 && i < imageStore.svgObjects.length - 1) {
      const temp = imageStore.svgObjects[i]
      imageStore.svgObjects[i] = imageStore.svgObjects[i + 1]
      imageStore.svgObjects[i + 1] = temp
    }

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Move the selected SVG object backward
   */
  const moveSelectedSvgObjectBackward = (t) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = imageStore.getIndexOfSelectedSvgObject()
    if (i !== -1 && i > 0) {
      const temp = imageStore.svgObjects[i]
      imageStore.svgObjects[i] = imageStore.svgObjects[i - 1]
      imageStore.svgObjects[i - 1] = temp
    }

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Compute display info for current SVG object (position and size)
   */
  const selectedObjectInfo = computed(() => {
    console.log('Computing selected object info...')
    const selectedId = imageStore.selectedSvgObjectId
    if (selectedId === null) return null

    const object = imageStore.getSvgObjectById(selectedId)
    if (!object || !object.attrs) return null

    const { tag, attrs, textBBox } = object

    const transform = attrs.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
    const angle = match ? parseFloat(match[1]) : 0

    if (tag === 'rect') {
      return {
        width: Math.round(Number(attrs.width) || 0),
        height: Math.round(Number(attrs.height) || 0),
        angle,
      }
    } else if (tag === 'ellipse') {
      return {
        width: Math.round((Number(attrs.rx) || 0) * 2),
        height: Math.round((Number(attrs.ry) || 0) * 2),
        angle,
      }
    } else if (tag === 'line') {
      return {
        width: Math.round((Number(attrs.x2) || 0) - (Number(attrs.x1) || 0)),
        height: Math.round((Number(attrs.y2) || 0) - (Number(attrs.y1) || 0)),
        angle,
      }
    } else if (tag === 'text' && textBBox) {
      return {
        width: Math.round(textBBox.width),
        height: Math.round(textBBox.height),
        angle,
      }
    }

    return { angle }
  })

  return {
    moveObjectLeftLocal,
    moveObjectRightLocal,
    moveObjectUpLocal,
    moveObjectDownLocal,
    moveObjectLeftGlobal,
    moveObjectRightGlobal,
    moveObjectUpGlobal,
    moveObjectDownGlobal,
    deleteSelectedSvgObject,
    moveSelectedSvgObjectForward,
    moveSelectedSvgObjectBackward,
    selectedObjectInfo,
  }
}
