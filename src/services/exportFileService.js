import jsPDF from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'
import { useToastModal } from '@/composables/modals/useToastModal.js'
import { useConsole } from '@/composables/common/useConsole.js'
import { useApi } from '@/composables/common/useApi.js'
import { useFrameTool } from '@/composables/tools/useFrameTool.js'
const { addUserEvent } = useApi()
const { log, error, warn } = useConsole()
const { showToastModal } = useToastModal()

/**
 * Service for exporting files in various formats
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store for image data
 * @param {ReturnType<typeof import('@/stores/editorStore').useEditorStore>} editorStore - Editor store for editing state
 * @param {ReturnType<typeof import('@/stores/historyStore').useHistoryStore>} historyStore - History store for undo/redo functionality
 * @param {ReturnType<typeof import('@/stores/viewportStore').useViewportStore>} viewportStore - Viewport store for view settings
 * @param {(key: string) => string} t - Translation function
 * @returns {Object} - Object containing the exportFile function
 */
export function exportFileService(imageStore, editorStore, historyStore, viewportStore, t) {
  /**
   * Exports the current image as PNG, JPEG, WebP, SVG, or PDF based on format settings
   * @returns {Promise<boolean>} - True if export was successful, false otherwise
   */
  const exportFile = async () => {
    const canvas = imageStore.getRenderedImage({ t, renderCall: true })
    if (!canvas) return false

    log('Exporting file...')

    const { width, height, quality } = imageStore.newFileDimensions
    const isPdf = imageStore.newFileFormat === 'pdf'

    // For pdf do not use raster preview
    await imageStore.generatePreview(editorStore, historyStore, t, !isPdf)

    // Export as PDF
    if (isPdf) {
      // Use toBlob to preserve alpha channel
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))

      const reader = new FileReader()
      reader.onload = async () => {
        const image = new Image()
        image.onload = async () => {
          await exportAsPdf(image)

          showToastModal(
            'success',
            t('imageStore.toast.successFileExported.title'),
            t('imageStore.toast.successFileExported.message'),
          )
        }
        image.src = reader.result
      }
      reader.readAsDataURL(blob)

      addUserEvent('exportImage', {
        fileFormat: imageStore.newFileFormat,
        fileName: imageStore.newFileName,
        fileWidth: width,
        fileHeight: height,
        quality: quality,
      })

      return true
    }

    // Export as raster image (PNG, JPEG, WebP)
    const image = new Image()
    image.onload = async () => {
      await exportAsRaster(image, width, height, quality)

      showToastModal(
        'success',
        t('imageStore.toast.successFileExported.title'),
        t('imageStore.toast.successFileExported.message'),
      )
    }
    image.src = imageStore.previewUrl

    addUserEvent('exportImage', {
      fileFormat: imageStore.newFileFormat,
      fileName: imageStore.newFileName,
      fileWidth: width,
      fileHeight: height,
      quality: quality,
    })

    return true
  }

  /**
   * Exports the rendered image as a raster file (PNG, JPEG, or WebP)
   * @param {HTMLImageElement} image - Image element to export
   * @param {number} width - Target width of the export
   * @param {number} height - Target height of the export
   * @param {number} quality - Image quality (0–100)
   * @returns {Promise<void>}
   */
  const exportAsRaster = async (image, width, height, quality) => {
    const mimeType =
      imageStore.newFileFormat === 'jpeg' || imageStore.newFileFormat === 'jpg'
        ? 'image/jpeg'
        : imageStore.newFileFormat === 'webp'
          ? 'image/webp'
          : 'image/png'

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0, width, height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `${imageStore.newFileName}.${imageStore.newFileFormat}`
        link.click()
        URL.revokeObjectURL(blobUrl)
      },
      mimeType,
      quality / 100,
    )
  }

  /**
   * Exports the rendered image and optional SVG objects/frame as a PDF
   * using jsPDF and svg2pdf.
   * @param {HTMLImageElement} image - Base image to include in PDF
   * @returns {Promise<void>}
   */
  const exportAsPdf = async (image) => {
    const { finalWidth, finalHeight, targetWidth, targetHeight, offsetX, offsetY } = useFrameTool(
      imageStore,
      historyStore,
      viewportStore,
      t,
    ).calculateFrameLayout(imageStore.newFileDimensions)

    // Export pdf as vector
    if (imageStore.fileType === 'pdf' && imageStore.pdfPageBytes) {
      /**
       * Convert hex color to rgb object with values 0–1 (for pdf-lib)
       * @param {string} hex - color
       * @returns {{ r: number, g: number, b: number }}
       */
      const hexToRgb = (hex) => {
        // Support shorthand
        if (hex.length === 4) {
          hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
        }

        const r = parseInt(hex.slice(1, 3), 16) / 255
        const g = parseInt(hex.slice(3, 5), 16) / 255
        const b = parseInt(hex.slice(5, 7), 16) / 255

        return { r, g, b }
      }

      /**
       * Parses a numeric value, returning a fallback value if the parsing fails.
       * @param {string|number} val - The value to parse.
       * @param {number} fallback - The fallback value to return if parsing fails.
       * @returns {number} - The parsed number or the fallback value.
       */
      const parseNum = (val, fallback = 0) => {
        const n = Number(val)
        return isNaN(n) ? fallback : n
      }

      /**
       * Extract rotation angle and center from SVG transform string
       * @param {string} transform - e.g. "rotate(-23, 327, 261)"
       * @param {number} defaultX - fallback X center
       * @param {number} defaultY - fallback Y center
       * @returns {{ angle: number, cx: number, cy: number }}
       */
      const getRotationFromTransform = (transform = '') => {
        const match = transform.match(/rotate\((-?\d+\.?\d*),\s*([-\d.]+),\s*([-\d.]+)\)/)
        return match ? parseFloat(match[1]) : 0
      }

      /**
       * Rotates a point around a center point by a given angle.
       * @param {number} x - The x coordinate of the point to rotate.
       * @param {number} y - The y coordinate of the point to rotate.
       * @param {number} cx - The x coordinate of the center point.
       * @param {number} cy - The y coordinate of the center point.
       * @param {number} angle - The angle to rotate the point by (in degrees).
       * @returns {{ x: number, y: number }} - The rotated point coordinates.
       */
      const rotatePoint = (x, y, cx, cy, angle) => {
        const rad = (angle * Math.PI) / 180
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)
        const nx = cos * (x - cx) - sin * (y - cy) + cx
        const ny = sin * (x - cx) + cos * (y - cy) + cy
        return { x: nx, y: ny }
      }

      /**
       * Draw a single SVG element into a pdf-lib page
       * @param {PDFPage} page - pdf-lib page
       * @param {string} tag - svg tag name (rect, circle, line, text, path)
       * @param {Object} attrs - svg attributes as object
       * @param {number} finalHeight - total pdf page height
       * @param {number} offsetX - x offset
       * @param {number} offsetY - y offset
       */
      const drawSvgElement = async (page, tag, attrs, finalHeight, offsetX = 0, offsetY = 0) => {
        const strokeColor =
          attrs.stroke && attrs.stroke !== 'none'
            ? rgb(...Object.values(hexToRgb(attrs.stroke)))
            : undefined
        const fillColor =
          attrs.fill && attrs.fill !== 'none'
            ? rgb(...Object.values(hexToRgb(attrs.fill)))
            : undefined
        const strokeWidth = parseNum(attrs['stroke-width'], 0)
        const opacity = parseNum(attrs['opacity'], 1)
        const angle = getRotationFromTransform(attrs.transform)

        if (tag === 'rect') {
          const x = parseNum(attrs.x, 0) + offsetX
          const y = finalHeight - parseNum(attrs.y, 0) - offsetY - parseNum(attrs.height, 0)
          const width = parseNum(attrs.width, 0)
          const height = parseNum(attrs.height, 0)
          const cx = x + width / 2
          const cy = y + height / 2
          const topLeft = rotatePoint(x, y, cx, cy, -angle)

          page.drawRectangle({
            x: topLeft.x,
            y: topLeft.y,
            width,
            height,
            borderColor: strokeColor,
            color: fillColor,
            borderWidth: strokeWidth,
            opacity,
            borderOpacity: opacity,
            rotate: degrees(-angle),
          })
        }

        if (tag === 'circle') {
          const cx = parseNum(attrs.cx, 0) + offsetX
          const cy = finalHeight - parseNum(attrs.cy, 0) - offsetY
          const r = parseNum(attrs.r, 0)
          page.drawCircle({
            x: cx,
            y: cy,
            size: r,
            color: fillColor,
            borderColor: strokeColor,
            borderWidth: strokeWidth,
            opacity,
            rotate: degrees(-angle),
          })
        }

        if (tag === 'ellipse') {
          const cx = parseNum(attrs.cx, 0) + offsetX
          const cy = finalHeight - parseNum(attrs.cy, 0) - offsetY
          const rx = parseNum(attrs.rx, 0)
          const ry = parseNum(attrs.ry, 0)

          page.drawEllipse({
            x: cx,
            y: cy,
            xScale: rx,
            yScale: ry,
            color: fillColor,
            borderColor: strokeColor,
            borderWidth: strokeWidth,
            opacity,
            rotate: degrees(-angle),
          })
        }

        if (tag === 'line') {
          const x1 = parseNum(attrs.x1, 0) + offsetX
          const y1 = finalHeight - parseNum(attrs.y1, 0) - offsetY
          const x2 = parseNum(attrs.x2, 0) + offsetX
          const y2 = finalHeight - parseNum(attrs.y2, 0) - offsetY

          // Line length
          const dx = x2 - x1
          const dy = y2 - y1
          const lineLength = Math.sqrt(dx * dx + dy * dy)

          // Normalized vector
          const ux = dx / lineLength
          const uy = dy / lineLength

          // Get line type
          let dashArray = []
          if (attrs['stroke-dasharray']) {
            dashArray = attrs['stroke-dasharray']
              .split(',')
              .map((d) => parseFloat(d.trim()))
              .filter((n) => !isNaN(n) && n > 0)
          }

          if (dashArray.length === 0) {
            // Solid
            page.drawLine({
              start: { x: x1, y: y1 },
              end: { x: x2, y: y2 },
              thickness: strokeWidth,
              color: strokeColor,
              opacity,
              rotate: degrees(-angle),
            })
          } else {
            // Special line
            let pos = 0
            let draw = true
            let dashIndex = 0
            let curX = x1
            let curY = y1

            while (pos < lineLength) {
              // Get segment length
              const segmentLength = dashArray[dashIndex % dashArray.length]

              const nextPos = Math.min(pos + segmentLength, lineLength)

              const nx = x1 + ux * nextPos
              const ny = y1 + uy * nextPos

              if (draw) {
                page.drawLine({
                  start: { x: curX, y: curY },
                  end: { x: nx, y: ny },
                  thickness: strokeWidth,
                  color: strokeColor,
                  opacity,
                  rotate: degrees(-angle),
                })
              }

              curX = nx
              curY = ny
              pos = nextPos
              dashIndex++
              draw = !draw
            }
          }

          // Line end
          if (attrs['marker-end']) {
            const arrowSize = 6 * strokeWidth
            const dxArrow = x2 - x1
            const dyArrow = y2 - y1
            const lineAngle = Math.atan2(dyArrow, dxArrow)

            // Move arrow by half its size
            const offsetXArrow = Math.cos(lineAngle) * (arrowSize / 2)
            const offsetYArrow = Math.sin(lineAngle) * (arrowSize / 2)

            // Arrow body in local coordinates (triangle)
            const tip = { x: 0, y: 0 }
            const left = { x: -arrowSize, y: arrowSize / 2 }
            const right = { x: -arrowSize, y: -arrowSize / 2 }

            const rotatePoint = (pt, angle) => ({
              x: pt.x * Math.cos(angle) - pt.y * Math.sin(angle),
              y: pt.x * Math.sin(angle) + pt.y * Math.cos(angle),
            })

            const tipGlobal = {
              x: tip.x + x2 + offsetXArrow,
              y: tip.y + y2 + offsetYArrow,
            }
            const leftGlobal = {
              x: rotatePoint(left, lineAngle).x + x2 + offsetXArrow,
              y: rotatePoint(left, lineAngle).y + y2 + offsetYArrow,
            }
            const rightGlobal = {
              x: rotatePoint(right, lineAngle).x + x2 + offsetXArrow,
              y: rotatePoint(right, lineAngle).y + y2 + offsetYArrow,
            }

            // Draw arrow outline
            page.drawLine({
              start: tipGlobal,
              end: leftGlobal,
              thickness: strokeWidth,
              color: strokeColor,
              opacity,
            })
            page.drawLine({
              start: tipGlobal,
              end: rightGlobal,
              thickness: strokeWidth,
              color: strokeColor,
              opacity,
            })
            page.drawLine({
              start: leftGlobal,
              end: rightGlobal,
              thickness: strokeWidth,
              color: strokeColor,
              opacity,
            })

            // Draw fill of arrow
            const segments = Math.max(2, Math.ceil(arrowSize / (strokeWidth / 1.5)))
            for (let i = 0; i <= segments; i++) {
              const t = i / segments
              const baseX = leftGlobal.x + (rightGlobal.x - leftGlobal.x) * t
              const baseY = leftGlobal.y + (rightGlobal.y - leftGlobal.y) * t
              page.drawLine({
                start: { x: baseX, y: baseY },
                end: { x: tipGlobal.x, y: tipGlobal.y },
                thickness: strokeWidth / 1.5,
                color: strokeColor,
                opacity,
              })
            }

            // Draw small circles at the corners
            ;[tipGlobal, leftGlobal, rightGlobal].forEach((pt) => {
              page.drawCircle({
                x: pt.x,
                y: pt.y,
                size: strokeWidth / 2,
                color: strokeColor,
                opacity,
              })
            })
          }
        }

        if (tag === 'text') {
          const textValue = attrs.textContent || ''

          const fontSize = parseNum(attrs['font-size'].replace('px', ''), 12)
          const x = parseNum(attrs.x, 0) + offsetX
          const y = parseNum(attrs.y, 0) + offsetY

          const pdfY = finalHeight - y

          const svgFontFamily = attrs['font-family'] || ''
          const isBold = attrs['font-weight'] === 'bold'
          const isItalic = attrs['font-style'] === 'italic'
          const isUnderline = attrs['text-decoration'] === 'underline'
          const letterSpacing = attrs['letter-spacing']
            ? parseFloat(attrs['letter-spacing'].replace('px', ''))
            : 0
          const angle = attrs.transform
            ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
            : 0

          const fillColor =
            attrs.fill && attrs.fill !== 'none'
              ? rgb(...Object.values(hexToRgb(attrs.fill)))
              : rgb(0, 0, 0)

          // Map SVG font family to standard PDF fonts
          let baseFont = StandardFonts.TimesRoman
          if (svgFontFamily.includes('Helvetica')) baseFont = StandardFonts.Helvetica
          else if (svgFontFamily.includes('Courier')) baseFont = StandardFonts.Courier

          // Bold/italic variants
          if (baseFont === StandardFonts.TimesRoman) {
            if (isBold && isItalic) baseFont = StandardFonts.TimesBoldItalic
            else if (isBold) baseFont = StandardFonts.TimesBold
            else if (isItalic) baseFont = StandardFonts.TimesItalic
          } else if (baseFont === StandardFonts.Helvetica) {
            if (isBold && isItalic) baseFont = StandardFonts.HelveticaBoldOblique
            else if (isBold) baseFont = StandardFonts.HelveticaBold
            else if (isItalic) baseFont = StandardFonts.HelveticaOblique
          } else if (baseFont === StandardFonts.Courier) {
            if (isBold && isItalic) baseFont = StandardFonts.CourierBoldOblique
            else if (isBold) baseFont = StandardFonts.CourierBold
            else if (isItalic) baseFont = StandardFonts.CourierOblique
          }

          const font = await pdf.embedFont(baseFont)

          // Draw text with optional letter spacing
          if (letterSpacing) {
            let cursorX = x
            for (const char of textValue) {
              page.drawText(char, {
                x: cursorX,
                y: pdfY,
                size: fontSize,
                font,
                color: fillColor,
                rotate: degrees(-angle),
                opacity,
              })
              cursorX += font.widthOfTextAtSize(char, fontSize) + letterSpacing
            }
          } else {
            page.drawText(textValue, {
              x,
              y: pdfY,
              size: fontSize,
              font,
              color: fillColor,
              rotate: degrees(-angle),
              opacity,
            })
          }

          // Underline as one line under text
          if (isUnderline) {
            const textWidth =
              font.widthOfTextAtSize(textValue, fontSize) +
              (letterSpacing || 0) * (textValue.length - 1)
            const underlineY = pdfY - fontSize * 0.1
            page.drawLine({
              start: { x, y: underlineY },
              end: { x: x + textWidth, y: underlineY },
              thickness: Math.max(1, fontSize * 0.08),
              color: fillColor,
              opacity,
            })
          }
        }

        if (tag === 'path') {
          const fillColor =
            attrs.fill && attrs.fill !== 'none'
              ? rgb(...Object.values(hexToRgb(attrs.fill)))
              : undefined
          const strokeColor = attrs.stroke
            ? rgb(...Object.values(hexToRgb(attrs.stroke)))
            : undefined
          const strokeWidth = parseNum(attrs['stroke-width'], 0)
          let d = attrs.d

          let offsetX = 0
          let offsetY = 0
          let scale = 1

          // Parse transform attributes
          if (attrs.transform) {
            const translateMatch = attrs.transform.match(/translate\(([^)]+)\)/)
            if (translateMatch) {
              const offsets = translateMatch[1]
                .split(/[, ]+/)
                .map((n) => n.trim())
                .filter((n) => n !== '')
                .map(Number)
              offsetX = offsets[0] || 0
              offsetY = offsets[1] || 0
            }
            const scaleMatch = attrs.transform.match(/scale\(([^)]+)\)/)
            if (scaleMatch) {
              scale = parseFloat(scaleMatch[1])
            }
          }

          page.drawSvgPath(d, {
            x: offsetX,
            y: finalHeight - offsetY,
            scale,
            color: fillColor,
            borderColor: strokeColor,
            borderWidth: strokeWidth,
          })
        }
      }

      let rasterized = null

      if (imageStore.svgObjects.length || imageStore.blurObjects.length) {
        rasterized = await imageStore.rasterize('export-pdf', {}, t)
      }

      // 1. Base image
      const existingPdf = await PDFDocument.load(imageStore.pdfPageBytes)
      const pdf = await PDFDocument.create()

      const originalPage = existingPdf.getPage(0)

      // Embed page
      const [embeddedPage] = await pdf.embedPages([originalPage])

      console.log('originalPage PDF page size:', {
        width: embeddedPage.width,
        height: embeddedPage.height,
      })

      console.log('Final PDF page size:', { finalWidth, finalHeight })

      console.log('Drawing embedded page at:', {
        x: offsetX,
        y: finalHeight - offsetY - targetHeight,
        width: targetWidth,
        height: targetHeight,
      })

      const finalPage = pdf.addPage([finalWidth, finalHeight])
      finalPage.drawPage(embeddedPage, {
        x: offsetX,
        y: finalHeight - offsetY - targetHeight,
        width: targetWidth,
        height: targetHeight,
      })

      // 2. SVG objects
      const allObjects = [...(imageStore.blurObjects || []), ...(imageStore.svgObjects || [])]

      for (const obj of allObjects) {
        // Filter out magnify area
        if (obj.class === 'magnifyArea') continue

        // Add text to attributes
        obj.attrs.textContent = obj.content || ''
        await drawSvgElement(finalPage, obj.tag, obj.attrs, finalHeight, offsetX, offsetY)
      }

      // 2.25 . Magnify overlay if present (bitmap)
      if (imageStore.svgObjects.some((obj) => obj.class === 'magnifyArea')) {
        warn('Rasterizing magnify area for PDF export')
        const overlayDataUrl = rasterized.magnifyOverlay.toDataURL('image/png')
        const overlayBytes = Uint8Array.from(atob(overlayDataUrl.split(',')[1]), (c) =>
          c.charCodeAt(0),
        )

        const overlayImage = await pdf.embedPng(overlayBytes)

        finalPage.drawImage(overlayImage, {
          x: 0,
          y: 0,
          width: rasterized.magnifyOverlay.width,
          height: rasterized.magnifyOverlay.height,
        })
      }

      // 2.5. Overlay image if present (bitmap) - this should never happen but just in case (TODO: remove?)
      // if (rasterized?.overlay) {
      //   const overlayDataUrl = rasterized.overlay.toDataURL('image/png')
      //   const overlayBytes = Uint8Array.from(atob(overlayDataUrl.split(',')[1]), (c) =>
      //     c.charCodeAt(0),
      //   )

      //   const overlayImage = await pdf.embedPng(overlayBytes)

      //   finalPage.drawImage(overlayImage, {
      //     x: 0,
      //     y: 0,
      //     width: rasterized.overlay.width,
      //     height: rasterized.overlay.height,
      //   })
      // }

      // 3. Frame
      if (imageStore.frame.enabled && imageStore.frameSvg) {
        const parser = new DOMParser()
        const svgEl = parser.parseFromString(imageStore.frameSvg, 'image/svg+xml').documentElement

        svgEl.querySelectorAll('rect,circle,path,line,text').forEach(async (el) => {
          const tag = el.tagName
          const attrs = Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]))
          attrs.textContent = el.textContent
          await drawSvgElement(finalPage, tag, attrs, finalHeight, 0, 0)
        })
      }

      // 4. Save
      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${imageStore.newFileName}.pdf`
      link.click()
    }
    // Export pdf as raster (with jsPDF)
    else {
      // Create pdf
      const pdf = new jsPDF({
        orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [finalWidth, finalHeight],
      })

      pdf.addFont('Helvetica', 'Helvetica', 'normal')
      pdf.setFont('Helvetica')
      pdf.addFont('Courier', 'Courier', 'normal')
      pdf.setFont('Courier')
      pdf.addFont('Times-Roman', 'Times-Roman', 'normal')
      pdf.setFont('Times-Roman')

      // Add base image
      pdf.addImage(image, 'PNG', offsetX, offsetY, targetWidth, targetHeight)

      // Add overlay image if present
      if (imageStore.overlayImage) {
        const overlayCanvas = imageStore.overlayImage
        const overlayUrl = overlayCanvas.toDataURL('image/png')

        pdf.addImage(overlayUrl, 'PNG', offsetX, offsetY, targetWidth, targetHeight)
      }

      // Add svgObjects and frame
      await createSvgPdf(pdf, finalWidth, finalHeight, offsetX, offsetY)

      // Add magnify overlay image as extra layer
      const rasterized = await imageStore.rasterize('export-pdf', {}, t)

      if (rasterized?.magnifyOverlay) {
        const magnifyDataUrl = rasterized.magnifyOverlay.toDataURL('image/png')
        pdf.addImage(magnifyDataUrl, 'PNG', offsetX, offsetY, image.width, image.height)
      }

      // Save
      pdf.save(`${imageStore.newFileName}.pdf`)
    }
  }

  /**
   * Normalize CSS font-family name to jsPDF Base14 font name
   * Used only right before svg2pdf rendering
   *
   * @param {string | null | undefined} font
   * @returns {string}
   */
  const normalizePdfFont = (font) => {
    if (!font) return 'Helvetica'

    switch (font) {
      case 'Courier New':
        return 'Courier'

      case 'Times New Roman':
        return 'Times-Roman'

      case 'Helvetica':
        return 'Helvetica'

      default:
        return 'Helvetica'
    }
  }

  /**
   * Convert svg object (objects and frame) into pdf
   *
   * @param {Object} pdfSvg - jsPDF instance
   * @param {number} width - Width of the PDF
   * @param {number} height - Height of the PDF
   * @param {number} offsetX - X offset for the SVG content
   * @param {number} offsetY - Y offset for the SVG content
   */
  const createSvgPdf = async (pdfSvg, width, height, offsetX = 0, offsetY = 0) => {
    // Defs
    const staticDefs = `
          <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L6,3 z" fill="context-stroke" />
          </marker>
          `.trim()

    const dynamicDefs = Object.values(imageStore.svgDefs || {}).join('\n')

    const svgDefsString = `
            <defs>
              ${staticDefs}
              ${dynamicDefs}
            </defs>
          `.trim()

    ////////

    // Generate svg string
    if (
      (imageStore.svgObjects && imageStore.svgObjects.length > 0) ||
      (imageStore.blurObjects && imageStore.blurObjects.length > 0)
    ) {
      const allObjects = [...(imageStore.blurObjects || []), ...(imageStore.svgObjects || [])]

      const filteredObjects = allObjects.filter((obj) => obj.class !== 'magnifyArea')

      const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            ${svgDefsString}
              <g transform="translate(${offsetX}, ${offsetY})">
                ${filteredObjects
                  .map((obj) => {
                    const attrs = Object.entries(obj.attrs || {})
                      .map(([key, val]) => `${key}="${val}"`)
                      .join(' ')
                    if (obj.tag === 'text') {
                      const content = obj.content || ''
                      return `<text ${attrs}>${content}</text>`
                    }
                    return `<${obj.tag} ${attrs} />`
                  })
                  .join('\n')}
              </g>
            </svg>
          `.trim()

      ////

      // Parse SVG string
      try {
        const svgElement = new DOMParser().parseFromString(
          svgString,
          'image/svg+xml',
        ).documentElement

        // Normalize font-family for PDF export
        svgElement.querySelectorAll('text').forEach((textEl) => {
          const font = textEl.getAttribute('font-family')
          textEl.setAttribute('font-family', normalizePdfFont(font))
        })

        await svg2pdf(svgElement, pdfSvg, {
          xOffset: 0,
          yOffset: 0,
          scale: 1,
        })
      } catch (e) {
        error('Error during svgObjects export to PDF:', e)
      }
    }

    // 4. Frame
    if (imageStore.frame.enabled && imageStore.frameSvg) {
      try {
        const parser = new DOMParser()
        const svgElement = parser.parseFromString(
          imageStore.frameSvg,
          'image/svg+xml',
        ).documentElement

        // Normalize font-family for PDF export (frame)
        svgElement.querySelectorAll('text').forEach((textEl) => {
          const font = textEl.getAttribute('font-family')
          textEl.setAttribute('font-family', normalizePdfFont(font))
        })

        /**
         * svg2pdf does not support dominant-baseline="middle"
         * Fix text baseline by shifting Y down before rendering to PDF
         */
        const baselineCorrectionFactor = 0.35

        svgElement.querySelectorAll('text').forEach((textEl) => {
          const dominantBaseline = textEl.getAttribute('dominant-baseline')
          const yAttr = textEl.getAttribute('y')
          const fontSizeAttr = textEl.getAttribute('font-size')

          if (dominantBaseline === 'middle' && yAttr !== null && fontSizeAttr !== null) {
            const fontSize = parseFloat(fontSizeAttr.replace('px', ''))
            const y = parseFloat(yAttr)

            if (!isNaN(fontSize) && !isNaN(y)) {
              // Shift Y to compensate baseline difference (SVG vs PDF)
              const correctedY = y + fontSize * baselineCorrectionFactor
              textEl.setAttribute('y', correctedY.toString())
            }

            // Remove unsupported attribute for svg2pdf
            textEl.removeAttribute('dominant-baseline')
          }
        })

        await svg2pdf(svgElement, pdfSvg, {
          xOffset: 0,
          yOffset: 0,
          scale: 1,
        })
      } catch (e) {
        error('Error during frame SVG export to PDF:', e)
      }
    }
  }

  /**
   * Copies the current preview image to the clipboard
   * @param {Function} t - i18n translation function
   * @returns {Promise<void>}
   */
  const copyImageToClipboard = async () => {
    const dataUrl = imageStore.previewUrl || ''
    if (!dataUrl) {
      warn('No preview available for clipboard export')
      return
    }

    const img = new Image()
    img.src = dataUrl
    await img.decode() // wait until image is loaded

    // Draw image on canvas
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    // Convert to PNG
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])

    showToastModal(
      'success',
      t('imageStore.toast.successFileCopiedToClipboard.title'),
      t('imageStore.toast.successFileCopiedToClipboard.message'),
    )
  }

  return {
    exportFile,
    copyImageToClipboard,
  }
}
