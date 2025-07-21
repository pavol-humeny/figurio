/**
 * Logic for flipping the image and associated SVG elements
 *
 * @param {object} imageStore - Store containing image data and operations
 * @param {object} historyStore - Store for undo/redo history
 * @returns {object} Flip tool methods
 */
export function useFlipTool(imageStore, historyStore) {
  /**
   * Add flip operation, apply transformation and push to history
   *
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   */
  const applyFlip = (direction) => {
    if (direction === 'horizontal') {
      imageStore.addImageOperation({
        type: 'flip',
        direction: 'horizontal',
      })
    } else if (direction === 'vertical') {
      imageStore.addImageOperation({
        type: 'flip',
        direction: 'vertical',
      })
    }

    applyFlipRender(direction)

    historyStore.push(imageStore.getSnapshot())
  }

  /**
   * Apply visual flip to rendered image and update SVG object positions
   *
   * @param {'horizontal' | 'vertical'} direction - Flip direction
   */
  const applyFlipRender = (direction) => {
    if (!imageStore.getRenderedImage()) return

    const width = imageStore.getRenderedImage().width
    const height = imageStore.getRenderedImage().height

    // Flip raster
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    ctx.save()

    if (direction === 'horizontal') {
      ctx.translate(0, height)
      ctx.scale(1, -1)
    } else if (direction === 'vertical') {
      ctx.translate(width, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(imageStore.getRenderedImage(), 0, 0)
    ctx.restore()

    imageStore.setRenderedImage(canvas)

    // Flip vector objects
    if (Array.isArray(imageStore.svgObjects) && imageStore.svgObjects.length !== 0) {
      imageStore.svgObjects = imageStore.svgObjects.map((obj) => {
        if (!obj || !obj.attrs) return obj

        const newObj = { ...obj, attrs: { ...obj.attrs } }
        const parseNum = (val) => parseFloat(val) || 0

        switch (obj.tag) {
          case 'rect':
            if (direction === 'horizontal') {
              const x = parseNum(obj.attrs.x)
              const w = parseNum(obj.attrs.width)
              newObj.attrs.x = (width - x - w).toString()
            } else {
              const y = parseNum(obj.attrs.y)
              const h = parseNum(obj.attrs.height)
              newObj.attrs.y = (height - y - h).toString()
            }
            break

          case 'circle':
            if (direction === 'horizontal') {
              const cx = parseNum(obj.attrs.cx)
              newObj.attrs.cx = (width - cx).toString()
            } else {
              const cy = parseNum(obj.attrs.cy)
              newObj.attrs.cy = (height - cy).toString()
            }
            break

          case 'ellipse':
            if (direction === 'horizontal') {
              const cx = parseNum(obj.attrs.cx)
              newObj.attrs.cx = (width - cx).toString()
            } else {
              const cy = parseNum(obj.attrs.cy)
              newObj.attrs.cy = (height - cy).toString()
            }
            break

          case 'line':
            if (direction === 'horizontal') {
              newObj.attrs.x1 = (width - parseNum(obj.attrs.x1)).toString()
              newObj.attrs.x2 = (width - parseNum(obj.attrs.x2)).toString()
            } else {
              newObj.attrs.y1 = (height - parseNum(obj.attrs.y1)).toString()
              newObj.attrs.y2 = (height - parseNum(obj.attrs.y2)).toString()
            }
            break

          case 'text':
            if (direction === 'horizontal') {
              const x = parseNum(obj.attrs.x)
              newObj.attrs.x = (width - x).toString()
            } else {
              const y = parseNum(obj.attrs.y)
              newObj.attrs.y = (height - y).toString()
            }
            break

          // case 'path':
          //   // This is an approximation using a transform
          //   const currentTransform = obj.attrs.transform || ''
          //   const flipTransform =
          //     direction === 'horizontal'
          //       ? `scale(-1,1) translate(${-width},0)`
          //       : `scale(1,-1) translate(0,${-height})`

          //   newObj.attrs.transform = `${currentTransform} ${flipTransform}`.trim()
          //   break

          default:
            break
        }
        return newObj
      })
    }
  }

  return {
    applyFlip,
    applyFlipRender,
  }
}
