export function useSvgFunctions() {
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

  return {
    getObjectCenter,
  }
}
