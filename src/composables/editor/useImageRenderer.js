import { watch, ref, nextTick } from 'vue'
import { useFrameTool } from '../tools/useFrameTool'

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { SVGGraphics } from 'pdfjs-dist/legacy/build/pdf'
// import { useToastModal } from '../modals/useToastModal'
import { useWarningList } from '../modals/useWarningList'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

import { useConsole } from '@/composables/common/useConsole.js'
import { viewportConfig } from '@/config/viewportConfig'
const { log, warn } = useConsole()
// const { showToastModal } = useToastModal()

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

  const pdfContainerRef = ref(null)

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

    // Set frame SVG dimensions
    if (frameSvgRef.value) {
      const frame = imageStore.frame
      const frameEnabled = frame?.enabled && (frame.width > 0 || frame.height > 0)

      const fw = frameEnabled ? frame.width : 0
      const fh = frameEnabled ? frame.height : 0

      const header = frame?.headerSize || 0
      const footer = frame?.footerSize || 0

      const hasHeader = useFrameTool(imageStore, historyStore, viewportStore, t).isFrameWithHeader(
        frame.type,
      )

      const hasFooter = useFrameTool(imageStore, historyStore, viewportStore, t).isFrameWithFooter(
        frame.type,
      )

      const hasPhoneFrame = useFrameTool(imageStore, historyStore, viewportStore, t).isPhoneFrame(
        frame.type,
      )

      const noPhoneButtonsAdjustment = frame.phoneButtonsEnabled ? 0 : fw / 3

      const frameWidth = width + fw * 2 - noPhoneButtonsAdjustment
      const frameHeight =
        height +
        fh * 2 +
        ((hasHeader && !hasPhoneFrame) || (hasPhoneFrame && frame.phoneHeaderExpand)
          ? header - fh
          : 0) +
        (hasFooter ? footer : 0)

      frameSvgRef.value.setAttribute('width', frameWidth)
      frameSvgRef.value.setAttribute('height', frameHeight)
      frameSvgRef.value.style.width = `${frameWidth}px`
      frameSvgRef.value.style.height = `${frameHeight}px`
    }
  }

  /**
   * Render base image
   */
  const renderCanvas = async () => {
    log('--- renderCanvas called: ---', blockRender.value)

    if (blockRender.value) return
    blockRender.value = true

    // Wait one tick (needed for background rasterization)
    await nextTick()

    if (imageStore.fileType === 'pdf' && !imageStore.showPdfAsImage) {
      // await new Promise((resolve) => setTimeout(resolve, 100))
      uiStore.isApplying = true

      log('Rendering PDF page...')
      const pdfPageBytes = imageStore.pdfPageBytes

      if (!pdfPageBytes || pdfPageBytes.length === 0) {
        warn('PDF bytes missing or empty – skipping PDF render')
        blockRender.value = false
        uiStore.isApplying = false
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
        warn(
          'PDF obsahuje nepodporované grafické operátory – niektoré efekty nemusia byť presne zobrazené.',
        )

        // Rasterize PDF into image
        imageStore.showPdfAsImage = true

        const viewport = page.getViewport({ scale: 1 }) // vyššie rozlíšenie pre ostrejší raster
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        await page.render({ canvasContext: ctx, viewport }).promise

        // Uloženie ako obrázok (rovnako ako pri image file)
        imageStore.setRenderedImage(canvas)
        imageStore.originalImage = canvas
        imageStore.previewUrl = canvas.toDataURL()
        imageStore.blurPreviewUrl = canvas.toDataURL()

        blockRender.value = false

        // Show toast modal about unsupported PDF objects
        // showToastModal(
        //   'warning',
        //   t('imageStore.toast.unsupportedPdfObjects.title'),
        //   t('imageStore.toast.unsupportedPdfObjects.message'),
        // )

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

        renderCanvas()
        uiStore.isApplying = false
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

      uiStore.isApplying = false

      // Preview URL môžeme nastaviť na blob URL
      // imageStore.previewUrl = pdfUrl
    } else if (imageStore.fileType === 'image' || imageStore.showPdfAsImage) {
      log('Rendering IMAGE file...')
      const img = imageStore.getRenderedImage({ t, renderCall: true })

      if (!imageRef.value || !img) {
        blockRender.value = false
        return
      }

      if (img instanceof HTMLCanvasElement) {
        imageRef.value.src = img.toDataURL()
        // Use async toBlob instead of blocking toDataURL
        // img.toBlob((blob) => {
        //   const url = URL.createObjectURL(blob)
        //   imageRef.value.src = url
        //   imageStore.previewUrl = url
        // })
      } else if (img instanceof HTMLImageElement) {
        imageRef.value.src = img.src
      }

      imageStore.previewUrl = imageRef.value.src
      // imageRef.value.style.imageRendering = 'pixelated'
    }

    // Value for blur preview
    const img = imageStore.getRenderedImage({ t, renderCall: true })
    if (img instanceof HTMLCanvasElement) {
      imageStore.blurPreviewUrl = img.toDataURL()
    } else if (img instanceof HTMLImageElement) {
      imageStore.blurPreviewUrl = img.src
    }

    // // Overlay image with drawing (brush) layer
    // const canvas = document.getElementById('brushCanvas')
    // const ctx = canvas.getContext('2d')

    // if (imageStore.overlayImage && canvas) {
    //   //wait
    //   await new Promise((resolve) => setTimeout(resolve, 1))
    //   warn('Rendering OVERLAY image...')

    //   if (imageStore.historyWasChanged) {
    //     log('Clearing OVERLAY image due to history change...')
    //     ctx.clearRect(0, 0, canvas.width, canvas.height)
    //     imageStore.historyWasChanged = false
    //   }

    //   ctx.drawImage(imageStore.overlayImage, 0, 0, canvas.width, canvas.height)
    // } else {
    //   if (canvas) {
    //     log('Clearing OVERLAY image...')
    //     ctx.clearRect(0, 0, canvas.width, canvas.height)
    //     imageStore.historyWasChanged = false
    //   }
    // }
    // Overlay image with drawing (brush) layer
    const canvas = document.getElementById('brushCanvas')
    if (!canvas) {
      blockRender.value = false
      return
    }

    const ctx = canvas.getContext('2d')

    // 1️⃣ vždy najprv clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 2️⃣ ak existuje overlay → nakresli
    if (imageStore.overlayImage) {
      warn('Rendering OVERLAY image...')
      ctx.drawImage(imageStore.overlayImage, 0, 0, canvas.width, canvas.height)
    }

    // 3️⃣ reset flagu
    imageStore.historyWasChanged = false

    // // Save initial state to history if empty
    // if (historyStore.history.length === 0) {
    //   historyStore.push(imageStore.getSnapshot(t))
    // }

    blockRender.value = false
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

    el.innerHTML = ''
    useFrameTool(imageStore, historyStore, viewportStore, t).applyFrameRender(el)

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
   * Watch for changes in image store and re-render all layers
   */
  watch(
    [
      () => imageStore.getRenderedImage({ t, renderCall: false }),
      () => imageStore.pdfPageBytes,
      () => imageStore.fileType,
      () => imageStore.overlayImage,
    ],
    async ([newImage, newPdfBytes, newFileType, newOverlayImage]) => {
      if (newImage || newPdfBytes || newFileType || newOverlayImage) {
        log('#################### Image or PDF or file Type changed, re-rendering all...')
        renderAll()
      }
    },
  )
  /**
   * Watch for changes in viewport dimensions and update sizes
   */
  watch(
    [
      () => imageStore.frame,
      () => viewportStore.physicalContentSize,
      () => viewportStore.zoomMode,
      () => viewportStore.calibrationFactor,
    ],
    (newFrame) => {
      if (newFrame && !renderingFrameSvg.value) {
        log('#################### Frame operations changed, re-rendering frame svg')
        updateSizes()
        renderFrameSvg()
      }
    },
    { deep: true },
  )

  // Initial rendering on mount
  // onMounted(() => {
  //   nextTick(() => {
  //     if (imageStore.getRenderedImage({ t, renderCall: false })) {
  //       renderAll()
  //     }
  //   })
  // })

  return {
    imageRef,
    svgRef,
    frameSvgRef,
    pdfContainerRef,
  }
}
