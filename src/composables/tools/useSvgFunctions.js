import { editorConfig } from '@/config/editorConfig'

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
  /**
   * Compute the center point (cx, cy) of the given object based on its tag and attributes
   * @param {Object} object - SVG object with tag, attrs, and optionally textBBox
   * @returns {{cx: number, cy: number}} Center coordinates
   */
  const getObjectCenter = (object) => {
    const { tag, attrs, textBBox } = object

    if ('x' in attrs && 'y' in attrs && 'width' in attrs && 'height' in attrs) {
      return {
        cx: attrs.x + attrs.width / 2,
        cy: attrs.y + attrs.height / 2,
      }
    } else if ('cx' in attrs && 'cy' in attrs) {
      return {
        cx: attrs.cx,
        cy: attrs.cy,
      }
    } else if ('x1' in attrs && 'x2' in attrs && 'y1' in attrs && 'y2' in attrs) {
      return {
        cx: (attrs.x1 + attrs.x2) / 2,
        cy: (attrs.y1 + attrs.y2) / 2,
      }
    } else if (tag === 'text' && textBBox) {
      return {
        cx: textBBox.x + textBBox.width / 2,
        cy: textBBox.y + textBBox.height / 2,
      }
    }

    return { cx: 0, cy: 0 }
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
    const targets = imageStore.svgObjects
      .filter((o) => o.id !== object.id)
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

  /**
   * Snap to nearest edges (left, right, top, bottom) if overlapping in opposite axis
   * @param {number} left - current left edge
   * @param {number} right - current right edge
   * @param {number} top - current top edge
   * @param {number} bottom - current bottom edge
   * @returns {{dx: number, dy: number}}
   */
  const getSnapOffsetToEdges = (object, left, right, top, bottom) => {
    const threshold =
      imageStore.getSmallerImageDimension() * editorConfig.snapEdgeThresholdCoefficient

    const targets = getSnapEdgeTargets(object)

    let dx = 0
    let dy = 0
    let snappedEdgeX = null
    let snappedEdgeY = null

    for (const t of targets) {
      const verticalOverlap = !(bottom < t.top || top > t.bottom)
      const horizontalOverlap = !(right < t.left || left > t.right)

      if (verticalOverlap && editorConfig.snapOnlyWhenOverlapping) {
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

      if (horizontalOverlap && editorConfig.snapOnlyWhenOverlapping) {
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

  return {
    getObjectCenter,
    rotatePoint,
    getTransformedBoundingBox,
    getSnapEdgeTargets,
    getSnapOffsetToEdges,
  }
}
