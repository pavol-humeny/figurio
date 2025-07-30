export function useSvgObjects(imageStore, historyStore, t) {
  /**
   * Move the selected object by a specified offset in global coordinates (ignores rotation)
   * @param {number} dx - Offset in X direction
   * @param {number} dy - Offset in Y direction
   */
  const moveObjectBy = (dx, dy) => {
    if (imageStore.selectedSvgObjectId === null) return
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    if (!object) return

    const { attrs, tag, textBBox } = object

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
    const transform = attrs.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
    if (match) {
      const angle = parseFloat(match[1])

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
   * Move the selected object one pixel to the left
   */
  const moveObjectLeft = () => moveObjectBy(-1, 0)

  /**
   * Move the selected object one pixel to the right
   */
  const moveObjectRight = () => moveObjectBy(1, 0)

  /**
   * Move the selected object one pixel up
   */
  const moveObjectUp = () => moveObjectBy(0, -1)

  /**
   * Move the selected object one pixel down
   */
  const moveObjectDown = () => moveObjectBy(0, 1)

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

  return {
    moveObjectLeft,
    moveObjectRight,
    moveObjectUp,
    moveObjectDown,
    deleteSelectedSvgObject,
    moveSelectedSvgObjectForward,
    moveSelectedSvgObjectBackward,
  }
}
