import { editorConfig } from '@/config/editorConfig'
import { useMath } from '../common/useMath'

/**
 * Logic for handling SVG object snapping
 * @param {*} imageStore - Store containing SVG objects and image dimensions
 * @returns {{
 *   getObjectCenter: Function to compute center of an SVG object
 *   rotatePoint: Function to rotate a point around a center
 *  getTransformedBoundingBox: Function to get bounding box with rotation
 *  getSnapEdgeTargets: Function to get snap targets from other objects
 * getSnapOffsetToEdges: Function to compute snap offsets to edges
 * }}
 */
export function useSvgFunctions(imageStore) {
  const { round } = useMath()

  /**
   * Compute the transformed center (cx, cy) considering object rotation
   * @param {Object} object - SVG object with tag, attrs, and optionally textBBox
   * @returns {{cx: number, cy: number}} Center coordinates in global coordinates
   */
  const getObjectCenter = (object) => {
    const { tag, attrs, textBBox } = object
    let cx = 0
    let cy = 0

    // --- Basic center without rotation ---
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

    // --- Adjust center by rotation transform ---
    const match = attrs.transform?.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
    if (match) {
      const angle = parseFloat(match[1]) * (Math.PI / 180)
      const rotCx = parseFloat(match[2])
      const rotCy = parseFloat(match[3])

      // Rotate point (cx, cy) around (rotCx, rotCy)
      const dx = cx - rotCx
      const dy = cy - rotCy
      const rotatedX = rotCx + dx * Math.cos(angle) - dy * Math.sin(angle)
      const rotatedY = rotCy + dx * Math.sin(angle) + dy * Math.cos(angle)

      cx = round(rotatedX)
      cy = round(rotatedY)

      console.log('Rotated center:', { cx, cy })
    }

    return { cx, cy }
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
   * @param {Object} object - SVG object
   * @returns {{left: number, right: number, top: number, bottom: number}}
   */
  const getTransformedBoundingBox = (object) => {
    const attrs = object.attrs
    const transform = attrs.transform || ''
    const match = transform.match(/rotate\((-?\d+\.?\d*),\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/)

    const angle = match ? parseFloat(match[1]) : 0
    const cx = match ? parseFloat(match[2]) : 0
    const cy = match ? parseFloat(match[3]) : 0

    let corners = []

    // RECT
    if ('x' in attrs && 'y' in attrs && 'width' in attrs && 'height' in attrs) {
      corners = [
        rotatePoint(attrs.x, attrs.y, cx, cy, angle),
        rotatePoint(attrs.x + attrs.width, attrs.y, cx, cy, angle),
        rotatePoint(attrs.x, attrs.y + attrs.height, cx, cy, angle),
        rotatePoint(attrs.x + attrs.width, attrs.y + attrs.height, cx, cy, angle),
      ]
    }

    // ELLIPSE
    else if ('cx' in attrs && 'cy' in attrs && 'rx' in attrs && 'ry' in attrs) {
      corners = [
        rotatePoint(attrs.cx - attrs.rx, attrs.cy - attrs.ry, cx, cy, angle),
        rotatePoint(attrs.cx + attrs.rx, attrs.cy - attrs.ry, cx, cy, angle),
        rotatePoint(attrs.cx - attrs.rx, attrs.cy + attrs.ry, cx, cy, angle),
        rotatePoint(attrs.cx + attrs.rx, attrs.cy + attrs.ry, cx, cy, angle),
      ]
    }

    // LINE
    else if ('x1' in attrs && 'y1' in attrs && 'x2' in attrs && 'y2' in attrs) {
      corners = [
        rotatePoint(attrs.x1, attrs.y1, cx, cy, angle),
        rotatePoint(attrs.x2, attrs.y2, cx, cy, angle),
      ]
    }

    // TEXT (requires precomputed bounding box!)
    else if (object.tag === 'text' && object.textBBox) {
      const bBox = object.textBBox
      corners = [
        rotatePoint(bBox.x, bBox.y, cx, cy, angle),
        rotatePoint(bBox.x + bBox.width, bBox.y, cx, cy, angle),
        rotatePoint(bBox.x, bBox.y + bBox.height, cx, cy, angle),
        rotatePoint(bBox.x + bBox.width, bBox.y + bBox.height, cx, cy, angle),
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
   * Get snap edge targets (with rotation applied), including image borders
   * @returns {Array<{left: number, right: number, top: number, bottom: number}>}
   */
  const getSnapEdgeTargets = (object) => {
    const targets = [...(imageStore.svgObjects || []), ...(imageStore.blurObjects || [])]
      .filter((o) => o.id !== object.id)
      .map((o) => {
        const bbox = getTransformedBoundingBox(o)
        if (!bbox) return null
        return {
          ...bbox,
          cx: (bbox.left + bbox.right) / 2, // center X
          cy: (bbox.top + bbox.bottom) / 2, // center Y
        }
      })
      .filter(Boolean)

    const imgWidth = imageStore.fileDimensions.width
    const imgHeight = imageStore.fileDimensions.height

    // Add image border as edge target
    targets.push({
      left: 0,
      right: imgWidth,
      top: 0,
      bottom: imgHeight,
      cx: imgWidth / 2,
      cy: imgHeight / 2,
    })

    return targets
  }

  /**
   * Snap to nearest edges (left, right, top, bottom) if overlapping in opposite axis
   * @param {number} left - current left edge
   * @param {number} right - current right edge
   * @param {number} top - current top edge
   * @param {number} bottom - current bottom edge
   * @returns {{dx: number, dy: number}}
   */
  const getSnapOffsetToEdges = (object, left, right, top, bottom, snapTargets = []) => {
    const threshold =
      imageStore.getSmallerImageDimension() * editorConfig.snapEdgeThresholdCoefficient

    const targets = []

    const edgeTargets = getSnapEdgeTargets(object)

    targets.push(...edgeTargets)
    targets.push(...snapTargets)

    const objCenter = getObjectCenter(object)
    let bestDx = null
    let bestDy = null

    console.log('object center for snapping:', objCenter)

    for (const t of targets) {
      const verticalOverlap = !(bottom < t.top || top > t.bottom)
      const horizontalOverlap = !(right < t.left || left > t.right)

      // X
      if (
        (verticalOverlap || !editorConfig.needObjectOverlapToSnap) &&
        editorConfig.snapOnlyWhenOverlapping
      ) {
        const candidatesX = [
          { offset: t.left - left, edge: 'left' },
          { offset: t.right - left, edge: 'left' },
          { offset: t.left - right, edge: 'right' },
          { offset: t.right - right, edge: 'right' },
          { offset: t.cx - objCenter.cx, edge: 'centerX' }, // center X snap
        ]
        for (const c of candidatesX) {
          if (
            Math.abs(c.offset) <= threshold &&
            (bestDx === null || Math.abs(c.offset) < Math.abs(bestDx.offset))
          ) {
            bestDx = c
          }
        }
      }

      // Y
      if (
        (horizontalOverlap || !editorConfig.needObjectOverlapToSnap) &&
        editorConfig.snapOnlyWhenOverlapping
      ) {
        const candidatesY = [
          { offset: t.top - top, edge: 'top' },
          { offset: t.bottom - top, edge: 'top' },
          { offset: t.top - bottom, edge: 'bottom' },
          { offset: t.bottom - bottom, edge: 'bottom' },
          { offset: t.cy - objCenter.cy, edge: 'centerY' }, // center Y snap
        ]
        for (const c of candidatesY) {
          if (
            Math.abs(c.offset) <= threshold &&
            (bestDy === null || Math.abs(c.offset) < Math.abs(bestDy.offset))
          ) {
            bestDy = c
          }
        }
      }
    }

    return {
      dx: bestDx ? bestDx.offset : 0,
      dy: bestDy ? bestDy.offset : 0,
      snappedEdgeX: bestDx ? bestDx.edge : null,
      snappedEdgeY: bestDy ? bestDy.edge : null,
    }
  }

  return {
    getObjectCenter,
    rotatePoint,
    getTransformedBoundingBox,
    getSnapEdgeTargets,
    getSnapOffsetToEdges,
  }
}
