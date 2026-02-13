import { watch, ref, nextTick } from 'vue'
import { useFrameTool } from '../tools/useFrameTool'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { SVGGraphics } from 'pdfjs-dist/legacy/build/pdf'
import { useWarningList } from '../modals/useWarningList'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

import { useConsole } from '@/composables/common/useConsole.js'
import { viewportConfig } from '@/config/viewportConfig'
const { log, warn } = useConsole()

const blockRender = ref(false)

/**
 * Logic for rendering image layers (img, SVG, frame) in the editor viewport
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store
 * @param {ReturnType<typeof import('@/stores/historyStore').useHistoryStore>} historyStore - History store
 * @param {ReturnType<typeof import('@/stores/workspaceStore').useWorkspaceStore>} editorStore - Editor store
 * @param {ReturnType<typeof import('@/stores/viewportStore').useViewportStore>} viewportStore - Viewport store
 * @param {import('vue').Ref<HTMLElement>} contentRef - Reference to the .viewport-content element
 * @param {(key: string) => string} t - Translation function
 * @returns {{
 *   imageRef: import('vue').Ref<HTMLCanvasElement | null>,
 *   svgRef: import('vue').Ref<SVGSVGElement | null>,
 *   frameSvgRef: import('vue').Ref<SVGSVGElement | null>
 * }}
 */
export function useImageRenderer(
  imageStore,
  historyStore,
  editorStore,
  viewportStore,
  uiStore,
  contentRef,
  t,
) {
  const { addWarning } = useWarningList(imageStore, uiStore)

  /**
   * Reference to the base image layer
   */
  const imageRef = ref(null)

  /**
   * Reference to the SVG layer for vector elements
   */
  const svgRef = ref(null)

  /**
   * Reference to the SVG layer for frame
   */
  const frameSvgRef = ref(null)

  /**
   * Reference to the container for PDF rendering (used when rendering PDF as SVG)
   */
  const pdfContainerRef = ref(null)

  /**
   * Reference to the canvas for rendering blur overlays
   */
  const blurOverlayRef = ref(null)

  /**
   * Reference to the canvas for rendering magnify area overlays
   */
  const magnifyOverlayRef = ref(null)

  /**
   * Internal flag to avoid overlapping frame render calls
   */
  let renderingFrameSvg = ref(false)

  /**
   * Set dimensions of canvas, svg and frame layers based on image size and frame config
   */
  const updateSizes = async () => {
    log('Updating sizes for image renderer...')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    // Set content layer dimensions
    if (contentRef.value) {
      contentRef.value.style.width = `${width}px`
      contentRef.value.style.height = `${height}px`
    }

    // Set image dimensions
    if (imageRef.value) {
      imageRef.value.width = width
      imageRef.value.height = height
      imageRef.value.style.width = `${width}px`
      imageRef.value.style.height = `${height}px`
    }

    if (pdfContainerRef.value) {
      pdfContainerRef.value.style.width = `${width}px`
      pdfContainerRef.value.style.height = `${height}px`
    }

    // Set SVG dimensions
    if (svgRef.value) {
      svgRef.value.setAttribute('width', width)
      svgRef.value.setAttribute('height', height)
      svgRef.value.style.width = `${width}px`
      svgRef.value.style.height = `${height}px`
    }
  }

  /**
   * Render base image
   */
  const renderCanvas = async () => {
    const tStart = performance.now()

    log('--- renderCanvas called: ---', blockRender.value)

    if (!imageStore.isImageLoaded) {
      warn('Image not loaded yet, skipping render')
      return
    }

    if (blockRender.value) {
      warn('Render is currently blocked, skipping render call')
      blockRender.value = false
      return
    }
    blockRender.value = true

    // Wait one tick (needed for background rasterization)
    await nextTick()

    if (imageStore.fileType === 'pdf' && !imageStore.showPdfAsImage) {
      const tPdfStart = performance.now()

      uiStore.isApplying = true

      log('Rendering PDF page...')
      const pdfPageBytes = imageStore.pdfPageBytes

      if (!pdfPageBytes || pdfPageBytes.length === 0) {
        warn('PDF bytes missing or empty – skipping PDF render')
        blockRender.value = false
        uiStore.isApplying = false
        uiStore.isApplyingFrame = false
        return
      }

      const pdf = await pdfjsLib.getDocument({ data: pdfPageBytes }).promise
      const page = await pdf.getPage(1)

      const viewportPdf = page.getViewport({ scale: 1 })
      const opList = await page.getOperatorList()
      const svgGfx = new SVGGraphics(page.commonObjs, page.objs)

      // List of unimplemented PDF operators in pdf.js
      const { OPS } = pdfjsLib
      const unimplementedOps = [
        OPS.setBlendMode, // BM
        OPS.setSoftMask, // SMask
        OPS.endGroup, // endGroup
      ]

      /**
       * Check if the operator list contains any unimplemented operators
       */
      const checkUnimplemented = (opList) =>
        opList.fnArray.some((fnId) => unimplementedOps.includes(fnId))

      // Check for unimplemented operators in the PDF
      let hasUnimplemented = checkUnimplemented(opList)

      if (page.commonObjs && Object.keys(page.commonObjs._objs || {}).length > 0) {
        for (const obj of Object.values(page.commonObjs._objs)) {
          if (obj && obj.data && obj.data.Subtype === 'Form') {
            hasUnimplemented = true
            warn(
              'PDF obsahuje Form XObject – môže obsahovať graf alebo legendu, ktoré nemusia byť správne zobrazené.',
            )
            break
          }
        }
      }

      if (hasUnimplemented) {
        const tRasterStart = performance.now()

        warn(
          'PDF obsahuje nepodporované grafické operátory – niektoré efekty nemusia byť presne zobrazené.',
        )

        // Rasterize PDF into image
        imageStore.showPdfAsImage = true

        const viewport = page.getViewport({ scale: 1 }) // Change scale of resolution
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height

        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        await page.render({ canvasContext: ctx, viewport }).promise

        log(`[imageRenderer] PDF rasterized in ${(performance.now() - tRasterStart).toFixed(1)} ms`)

        // Save image to store
        imageStore.setRenderedImage(canvas)
        imageStore.originalImage = canvas

        addWarning(
          'unsupported-pdf-objects', // id
          'imageStore.toast.unsupportedPdfObjects.title', // message
          'imageStore.toast.unsupportedPdfObjects.message', // tipText
          'imageStore.toast.unsupportedPdfObjects.title', // tipTitle
          'info', // type: 'warning' | 'info' | 'error'
          'open', // startState
          null, // onRemove
          null, // onOpen
          null, // onClose
        )

        blockRender.value = false

        uiStore.isApplying = false
        uiStore.isApplyingFrame = false

        renderCanvas()

        return
      }

      const svg = await svgGfx.getSVG(opList, viewportPdf)

      // White rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', 0)
      rect.setAttribute('y', 0)
      rect.setAttribute('width', imageStore.fileDimensions.width)
      rect.setAttribute('height', imageStore.fileDimensions.height)
      rect.setAttribute('fill', 'white')
      svg.insertBefore(rect, svg.firstChild)

      pdfContainerRef.value.innerHTML = ''
      pdfContainerRef.value.appendChild(svg)

      log(`[imageRenderer] PDF total ${(performance.now() - tPdfStart).toFixed(1)} ms`)

      blockRender.value = false
      uiStore.isApplying = false
      uiStore.isApplyingFrame = false
    } else if (imageStore.fileType === 'image' || imageStore.showPdfAsImage) {
      log('Rendering IMAGE file...')

      const tImgStart = performance.now()

      const src = imageStore.getRenderedImage({ t, renderCall: true })
      const dst = imageRef.value

      if (!src || !dst) {
        warn('src: ', src, 'dst:', dst)
        blockRender.value = false
        return
      }

      const ctx = dst.getContext('2d')

      // Resize destination canvas if needed
      if (dst.width !== src.width || dst.height !== src.height) {
        dst.width = src.width
        dst.height = src.height
      }

      ctx.clearRect(0, 0, dst.width, dst.height)
      ctx.drawImage(src, 0, 0)

      log(`[imageRenderer] IMAGE draw ${(performance.now() - tImgStart).toFixed(1)} ms`)
    }

    // Overlay image with drawing (brush) layer
    const tOverlayStart = performance.now()
    const overlayCanvas = document.getElementById('brushCanvas')

    if (overlayCanvas) {
      const octx = overlayCanvas.getContext('2d')
      octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)

      if (imageStore.overlayImage) {
        octx.drawImage(imageStore.overlayImage, 0, 0, overlayCanvas.width, overlayCanvas.height)
      }
    }

    renderBlurOverlay()

    imageStore.historyWasChanged = false
    blockRender.value = false

    log(`[imageRenderer] Overlay draw ${(performance.now() - tOverlayStart).toFixed(1)} ms`)
    log(`[imageRenderer] renderCanvas TOTAL ${(performance.now() - tStart).toFixed(1)} ms`)
  }

  /**
   * Render the blur overlay canvas based on current blur objects in the image store
   */
  const renderBlurOverlay = () => {
    if (!blurOverlayRef.value) return

    const canvas = blurOverlayRef.value
    const ctx = canvas.getContext('2d')

    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    canvas.width = width
    canvas.height = height

    ctx.clearRect(0, 0, width, height)

    if (!imageStore.blurObjects.length) return

    imageStore.renderBlurCanvases()

    imageStore.blurObjects.forEach((obj) => {
      const strength = obj.attrs['data-blur-strength'] || 5
      const blurCanvas = imageStore.getBlurCanvas(strength)
      if (!blurCanvas) return

      const { x, y, width, height } = obj.attrs

      ctx.save()

      if (obj.attrs.transform) {
        const match = obj.attrs.transform.match(/rotate\(([^,]+),\s*([^,]+),\s*([^)]+)\)/)
        if (match) {
          const angle = parseFloat(match[1])
          const cx = parseFloat(match[2])
          const cy = parseFloat(match[3])

          ctx.translate(cx, cy)
          ctx.rotate((angle * Math.PI) / 180)
          ctx.translate(-cx, -cy)
        }
      }

      // ctx.drawImage(blurCanvas, x, y, width, height, x, y, width, height)

      const edgeFade = parseFloat(obj.attrs['data-edge-fade']) || 1

      const masked = imageStore.applyRectEdgeFadeMask(blurCanvas, x, y, width, height, edgeFade)

      ctx.drawImage(masked, x, y)

      ctx.restore()
    })
  }

  const renderMagnifyOverlay = () => {
    if (!magnifyOverlayRef.value) return

    const canvas = magnifyOverlayRef.value
    const ctx = canvas.getContext('2d')

    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    canvas.width = width
    canvas.height = height
    ctx.clearRect(0, 0, width, height)

    const magnifyObjects = imageStore.svgObjects.filter((obj) => obj.class === 'magnifyArea')

    if (!magnifyObjects.length) return

    imageStore.renderMagnifyCanvases()

    magnifyObjects.forEach((obj) => {
      const zoom = obj.magnify?.zoom || obj.attrs['data-magnify-zoom'] || 2
      const composite = imageStore.getMagnifyCanvas(zoom)
      if (!composite) return

      const cx = obj.attrs.cx
      const cy = obj.attrs.cy
      const resultRadius = obj.attrs.rx
      const sourceRadius = resultRadius / zoom

      ctx.save()

      // Clip circle
      ctx.beginPath()
      ctx.arc(cx, cy, resultRadius, 0, Math.PI * 2)
      ctx.clip()

      // Draw magnified part
      ctx.drawImage(
        composite,
        cx - sourceRadius,
        cy - sourceRadius,
        sourceRadius * 2,
        sourceRadius * 2,
        cx - resultRadius,
        cy - resultRadius,
        resultRadius * 2,
        resultRadius * 2,
      )

      ctx.restore()

      // Outline
      ctx.beginPath()
      ctx.arc(cx, cy, resultRadius, 0, Math.PI * 2)
      ctx.lineWidth = obj.attrs['stroke-width'] || 1
      ctx.strokeStyle = obj.attrs.stroke || '#000'
      ctx.stroke()
    })
  }

  /**
   * Render the SVG frame layer and re-render canvas after frame update
   */
  const renderFrameSvg = () => {
    if (renderingFrameSvg.value) return

    log('Rendering frame SVG...')

    renderingFrameSvg.value = true

    const el = frameSvgRef.value
    if (!el) {
      renderingFrameSvg.value = false
      return
    }

    const isLandscapePhoneValue = useFrameTool(
      imageStore,
      historyStore,
      viewportStore,
      t,
    ).isLandscapePhone(imageStore.frame.type, imageStore.frame.phoneFrameOrientation)

    el.innerHTML = ''
    useFrameTool(imageStore, historyStore, viewportStore, t).applyFrameRender(
      el,
      isLandscapePhoneValue,
    )

    renderCanvas()

    renderingFrameSvg.value = false
  }

  /**
   * Render all layers based on frame state (frame, canvas, SVG)
   */
  const renderAll = () => {
    updateSizes()

    if (imageStore.frame.enabled) {
      renderFrameSvg()
    } else {
      renderCanvas()
    }
  }

  /**
   * Watch for changes in pixelate mode or zoom level and update image rendering style
   */
  watch(
    [() => uiStore.viewportPixelateMode, () => viewportStore.zoomLevel],
    ([mode, zoom]) => {
      if (!imageRef.value) return

      if (mode === 'always') {
        imageRef.value.style.imageRendering = 'pixelated'
      } else if (mode === 'never') {
        imageRef.value.style.imageRendering = 'auto'
      } else if (mode === 'auto') {
        imageRef.value.style.imageRendering =
          zoom > viewportConfig.pixelateAutoZoomThreshold ? 'pixelated' : 'auto'
      }
    },
    { immediate: true },
  )

  /**
   * Watch for changes in image rendering state and trigger re-render when needed
   */
  watch(
    () => imageStore.imageNeedToBeRendered,
    async (imageNeedToBeRendered) => {
      if (imageNeedToBeRendered) {
        imageStore.imageNeedToBeRendered = false
        log('#################### Image or PDF or file Type changed, re-rendering all...')
        renderAll()
      }
    },
  )

  /**
   * Watch for changes in blur objects and trigger re-render of blur overlay when needed
   */
  watch(
    () => imageStore.blurOverlayNeedToBeRendered,
    (flag) => {
      if (flag) {
        imageStore.blurOverlayNeedToBeRendered = false
        renderBlurOverlay()
      }
    },
  )

  watch(
    () => imageStore.magnifyOverlayNeedToBeRendered,
    (flag) => {
      if (flag) {
        imageStore.magnifyOverlayNeedToBeRendered = false
        renderMagnifyOverlay()
      }
    },
  )

  /**
   * Watch for changes in frame configuration, viewport dimensions, and calibration factor, and trigger re-render of frame SVG when needed
   */
  watch(
    [
      () => viewportStore.physicalContentSize,
      () => viewportStore.zoomMode,
      () => viewportStore.calibrationFactor,
    ],
    () => {
      imageStore.frameNeedToBeRendered = true
    },
    { deep: true },
  )

  /**
   * Watch for changes in frame rendering state and trigger re-render of frame SVG when needed
   */
  watch(
    () => imageStore.frameNeedToBeRendered,
    (frameNeedToBeRendered) => {
      if (frameNeedToBeRendered) {
        imageStore.frameNeedToBeRendered = false
        for (let i = 0; i < 2; i++) {
          log('#################### Frame operations changed, re-rendering frame svg')
          updateSizes()
          renderFrameSvg()
        }
      }
    },
    { deep: true },
  )

  return {
    imageRef,
    svgRef,
    frameSvgRef,
    pdfContainerRef,
    blurOverlayRef,
    magnifyOverlayRef,
  }
}
