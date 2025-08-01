import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useTextTool } from './useTextTool'
import { useShapeTool } from './useShapeTool'
import { editorConfig } from '@/config/editorConfig'
import { useMath } from '../common/useMath'

export function useSvgObjects(imageStore, historyStore, viewportStore, editorStore, t) {
  const { round } = useMath()
  const textTool = useTextTool(imageStore, historyStore, editorStore, t)
  const shapeTool = useShapeTool(editorStore, imageStore, historyStore, t)

  const isDrawing = ref(false)
  const drawingStart = ref({ x: 0, y: 0 })
  const currentDrawingObject = ref(null)

  /**
   * Which cursor to use when hovering over the SVG area
   * @returns {string} - CSS cursor style
   */
  const cursorOnSvgArea = computed(() => {
    return editorStore.selectedToolKey === 'text' && !editorStore.isSvgObjectSelected
      ? 'url(/cursors/textCursor.png) 10 10, auto'
      : 'default'
  })

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
   * Bring the selected SVG object to front
   */
  const bringSelectedSvgObjectToFront = (t) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = imageStore.getIndexOfSelectedSvgObject()
    if (i !== -1 && i < imageStore.svgObjects.length - 1) {
      const obj = imageStore.svgObjects.splice(i, 1)[0]
      imageStore.svgObjects.push(obj)
      historyStore.push(imageStore.getSnapshot(t))
    }
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
      historyStore.push(imageStore.getSnapshot(t))
    }
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
      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Send the selected SVG object to back
   */
  const sendSelectedSvgObjectToBack = (t) => {
    if (imageStore.selectedSvgObjectId === null) return
    const i = imageStore.getIndexOfSelectedSvgObject()
    if (i !== -1 && i > 0) {
      const obj = imageStore.svgObjects.splice(i, 1)[0]
      imageStore.svgObjects.unshift(obj)
      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Compute display info for current SVG object (position and size)
   */
  const selectedObjectInfo = computed(() => {
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

  /**
   * Handle click on the SVG area to add object
   * @param {MouseEvent} event - Click event
   */
  const OnClickImageSvg = (event) => {
    if (event.target.closest('g') || event.target.closest('text')) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = round((event.clientX - rect.left) / viewportStore.realZoomLevel)
    const y = round((event.clientY - rect.top) / viewportStore.realZoomLevel)

    if (editorStore.selectedToolKey === 'text' && !editorStore.isSvgObjectSelected) {
      textTool.addTextObject(x, y)
    }
  }

  const onMouseDownImageSvg = (event) => {
    if (!['blur', 'shape', 'magnifyArea'].includes(editorStore.selectedToolKey)) return

    if (editorStore.isSvgObjectSelected) return

    const objectClass = editorStore.selectedToolKey
    let objectType = editorStore.selectedTabPerTool[objectClass]

    if (objectType === 'rectangle') objectType = 'rect'

    console.log(`Mouse down on SVG with tool: ${objectClass}, objectType: ${objectType}`)

    const rect = viewportStore.viewportContentRect
    const x = round((event.clientX - rect.left - viewportStore.panX) / viewportStore.realZoomLevel)
    const y = round((event.clientY - rect.top - viewportStore.panY) / viewportStore.realZoomLevel)

    drawingStart.value = { x, y }
    isDrawing.value = true

    const id = Date.now()
    const base = {
      id,
      class: objectClass,
      tag: objectType,
      attrs: {},
    }

    let objectFillColor = 'none'
    let objectStrokeColor
    let objectStrokeWidth
    let objectOpacity = 1
    let objectCornerRadius = 0

    if (objectClass === 'shape') {
      const { fillEnabled, fillColor, strokeWidth, strokeColor, opacity, cornerRadius } =
        shapeTool.getShapeAttributes()

      if (fillEnabled) {
        objectFillColor = fillColor
      }
      objectStrokeWidth = strokeWidth
      objectStrokeColor = strokeColor
      objectOpacity = opacity
      objectCornerRadius = cornerRadius
    } else if (objectClass === 'blur') {
      objectFillColor = '#ff0000'
    }

    console.log(
      'objectType',
      objectType,
      'strokeWidth',
      objectStrokeWidth,
      'strokeColor',
      objectStrokeColor,
    )

    if (objectType === 'rect') {
      base.attrs = { x, y, width: 1, height: 1 }
      base.attrs.fill = objectFillColor
      if (objectStrokeWidth > 0) {
        base.attrs['stroke-width'] = objectStrokeWidth
        base.attrs.stroke = objectStrokeColor
      }
      base.attrs.opacity = objectOpacity
      if (objectCornerRadius > 0) {
        base.attrs.rx = objectCornerRadius
      }
    } else if (objectType === 'ellipse') {
      base.attrs = { cx: x, cy: y, rx: 1, ry: 1 }
      base.attrs.fill = objectFillColor
      if (objectStrokeWidth > 0) {
        base.attrs['stroke-width'] = objectStrokeWidth
        base.attrs.stroke = objectStrokeColor
      }
      base.attrs.opacity = objectOpacity
    } else if (objectType === 'line') {
      base.attrs = { x1: x, y1: y, x2: x, y2: y }
      base.attrs['stroke-width'] = objectStrokeWidth
      base.attrs.stroke = objectStrokeColor
      base.attrs.opacity = objectOpacity
    }

    currentDrawingObject.value = base
    imageStore.svgObjects.push(base)
  }

  const onMouseMoveImageSvg = (event) => {
    if (!isDrawing.value || !currentDrawingObject.value) return

    const isCtrlKey = event.ctrlKey || event.metaKey
    const isShiftKey = event.shiftKey

    const onlyOneKeyPressed = isCtrlKey !== isShiftKey

    if (!isCtrlKey) {
      viewportStore.guideLine = null
    }

    const rect = viewportStore.viewportContentRect
    let x = (event.clientX - rect.left - viewportStore.panX) / viewportStore.realZoomLevel
    let y = (event.clientY - rect.top - viewportStore.panY) / viewportStore.realZoomLevel

    let dx = x - drawingStart.value.x
    let dy = y - drawingStart.value.y

    const objectType = currentDrawingObject.value.tag
    const attrs = currentDrawingObject.value.attrs

    // Apply SHIFT for aspect ratio
    if (isShiftKey && onlyOneKeyPressed) {
      const maxDelta = Math.max(Math.abs(dx), Math.abs(dy))
      dx = dx < 0 ? -maxDelta : maxDelta
      dy = dy < 0 ? -maxDelta : maxDelta
      x = drawingStart.value.x + dx
      y = drawingStart.value.y + dy
    }

    // Apply CTRL snap
    if (isCtrlKey && onlyOneKeyPressed) {
      let x1 = drawingStart.value.x
      let y1 = drawingStart.value.y
      let x2 = x
      let y2 = y

      if (objectType !== 'line') {
        x1 = Math.min(drawingStart.value.x, x)
        x2 = Math.max(drawingStart.value.x, x)
        y1 = Math.min(drawingStart.value.y, y)
        y2 = Math.max(drawingStart.value.y, y)
      }

      const snap = getSnapOffsetToEdges(x1, x2, y1, y2)

      x += snap.dx
      y += snap.dy

      // Recalculate deltas (to adjust width and height)
      dx = x - drawingStart.value.x
      dy = y - drawingStart.value.y

      // Show guideline if snapped
      if (snap.dx !== 0 || snap.dy !== 0) {
        let gx = null,
          gy = null,
          angle = null

        if (snap.snappedEdgeX) {
          gx = (snap.snappedEdgeX === 'left' ? x1 : x2) + snap.dx
          gy = (y1 + y2) / 2 + snap.dy
          angle = 90
        }
        if (snap.snappedEdgeY) {
          gy = (snap.snappedEdgeY === 'top' ? y1 : y2) + snap.dy
          gx = (x1 + x2) / 2 + snap.dx
          angle = 0
        }

        viewportStore.guideLine = { x: gx, y: gy, angle }
      } else {
        viewportStore.guideLine = null
      }
    } else {
      viewportStore.guideLine = null
    }

    if (objectType === 'rect') {
      attrs.x = round(Math.min(x, drawingStart.value.x))
      attrs.y = round(Math.min(y, drawingStart.value.y))
      attrs.width = round(Math.abs(dx))
      attrs.height = round(Math.abs(dy))
    } else if (objectType === 'ellipse') {
      attrs.cx = round((x + drawingStart.value.x) / 2)
      attrs.cy = round((y + drawingStart.value.y) / 2)
      attrs.rx = round(Math.abs(dx) / 2)
      attrs.ry = round(Math.abs(dy) / 2)
    } else if (objectType === 'line') {
      attrs.x2 = round(x)
      attrs.y2 = round(y)
    }
  }

  const onMouseUpImageSvg = () => {
    if (isDrawing.value && currentDrawingObject.value) {
      historyStore.push(imageStore.getSnapshot(t))
    }
    isDrawing.value = false
    currentDrawingObject.value = null
    viewportStore.guideLine = null
  }

  onMounted(() => {
    window.addEventListener('mouseup', onMouseUpImageSvg)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mouseup', onMouseUpImageSvg)
  })

  ///////////////////////////////////
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
  const getSnapEdgeTargets = () => {
    const targets = imageStore.svgObjects
      .filter((o) => o.id !== currentDrawingObject.value?.id)
      .map((o) => getTransformedBoundingBox(o))
      .filter(Boolean)

    // Add image border as an extra snap target
    const imgWidth = imageStore.fileDimensions.width
    const imgHeight = imageStore.fileDimensions.height

    targets.push({
      left: 0,
      right: imgWidth,
      top: 0,
      bottom: imgHeight,
    })

    return targets
  }

  const getSnapOffsetToEdges = (left, right, top, bottom) => {
    const threshold =
      imageStore.getSmallerImageDimension() * editorConfig.snapEdgeThresholdCoefficient

    const targets = getSnapEdgeTargets()

    let dx = 0
    let dy = 0
    let snappedEdgeX = null
    let snappedEdgeY = null

    for (const t of targets) {
      const verticalOverlap = !(bottom < t.top || top > t.bottom)
      const horizontalOverlap = !(right < t.left || left > t.right)

      if (verticalOverlap) {
        if (Math.abs(left - t.left) < threshold) {
          dx = t.left - left
          snappedEdgeX = 'left'
        } else if (Math.abs(left - t.right) < threshold) {
          dx = t.right - left
          snappedEdgeX = 'left'
        } else if (Math.abs(right - t.left) < threshold) {
          dx = t.left - right
          snappedEdgeX = 'right'
        } else if (Math.abs(right - t.right) < threshold) {
          dx = t.right - right
          snappedEdgeX = 'right'
        }
      }

      if (horizontalOverlap) {
        if (Math.abs(top - t.top) < threshold) {
          dy = t.top - top
          snappedEdgeY = 'top'
        } else if (Math.abs(top - t.bottom) < threshold) {
          dy = t.bottom - top
          snappedEdgeY = 'top'
        } else if (Math.abs(bottom - t.top) < threshold) {
          dy = t.top - bottom
          snappedEdgeY = 'bottom'
        } else if (Math.abs(bottom - t.bottom) < threshold) {
          dy = t.bottom - bottom
          snappedEdgeY = 'bottom'
        }
      }
    }

    return { dx, dy, snappedEdgeX, snappedEdgeY }
  }

  ///////////////////////////////////

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
    sendSelectedSvgObjectToBack,
    bringSelectedSvgObjectToFront,
    selectedObjectInfo,
    OnClickImageSvg,
    cursorOnSvgArea,
    onMouseDownImageSvg,
    onMouseMoveImageSvg,
    // onMouseUpImageSvg,
  }
}
