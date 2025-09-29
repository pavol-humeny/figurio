import { watch, ref, nextTick } from 'vue'
import { useFrameTool } from '../tools/useFrameTool'

import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { SVGGraphics } from 'pdfjs-dist/legacy/build/pdf'

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'

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
  contentRef,
  t,
) {
  /**
   * Reference to the base image layer
   */
  const imageRef = ref(null)

  const overlayImageRef = ref(null)

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
    console.log('Updating sizes for image renderer...')
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

    if (overlayImageRef.value) {
      overlayImageRef.value.width = width
      overlayImageRef.value.height = height
      overlayImageRef.value.style.width = `${width}px`
      overlayImageRef.value.style.height = `${height}px`
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

      const hasHeader = useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithHeader(
        frame.type,
      )

      const hasFooter = useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithFooter(
        frame.type,
      )

      const frameWidth = width + fw * 2
      const frameHeight = height + fh * 2 + (hasHeader ? header - fh : 0) + (hasFooter ? footer : 0)

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
    // Wait one tick (needed for background rasterization)
    await nextTick()

    if (imageStore.fileType === 'pdf') {
      console.log('Rendering PDF page...')
      const pdfPageBytes = imageStore.pdfPageBytes

      const pdf = await pdfjsLib.getDocument({ data: pdfPageBytes }).promise
      const page = await pdf.getPage(1)

      const viewportPdf = page.getViewport({ scale: 1 })
      const opList = await page.getOperatorList()
      const svgGfx = new SVGGraphics(page.commonObjs, page.objs)

      // Zoznam známych nepodporovaných operátorov
      const { OPS } = pdfjsLib
      const unimplementedOps = [
        OPS.setBlendMode, // BM
        OPS.setSoftMask, // SMask
        OPS.endGroup, // endGroup
      ]

      // Skontroluj, či sa v operator list nachádza aspoň jeden nepodporovaný
      const hasUnimplemented = opList.fnArray.some((fnId) => unimplementedOps.includes(fnId))
      if (hasUnimplemented) {
        console.warn(
          'PDF obsahuje nepodporované grafické operátory – niektoré efekty nemusia byť presne zobrazené.',
        )
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

      // Preview URL môžeme nastaviť na blob URL
      // imageStore.previewUrl = pdfUrl
    } else if (imageStore.fileType === 'image') {
      const img = imageStore.getRenderedImage({ t, renderCall: true })

      if (!imageRef.value || !img) return

      console.log('Rendering IMAGE (IMAGE only)...')

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
    }

    // Value for blur preview
    const img = imageStore.getRenderedImage({ t, renderCall: true })
    if (img instanceof HTMLCanvasElement) {
      imageStore.blurPreviewUrl = img.toDataURL()
    } else if (img instanceof HTMLImageElement) {
      imageStore.blurPreviewUrl = img.src
    }

    // Save to overlay ref imageStore.overlayImage

    // wait 100 ms
    await new Promise((resolve) => setTimeout(resolve, 1))

    if (overlayImageRef.value) {
      if (imageStore.overlayImage !== null) {
        overlayImageRef.value.src = imageStore.overlayImage.toDataURL()
      }
    }

    // Save initial state to history if empty
    if (historyStore.history.length === 0) {
      historyStore.push(imageStore.getSnapshot(t))
    }
  }

  /**
   * Render the SVG frame layer and re-render canvas after frame update
   */
  const renderFrameSvg = async () => {
    if (renderingFrameSvg.value) return

    console.log('Rendering frame SVG...')

    renderingFrameSvg.value = true

    const el = frameSvgRef.value
    if (!el) {
      renderingFrameSvg.value = false
      return
    }

    el.innerHTML = ''
    useFrameTool(imageStore, historyStore, editorStore, t).applyFrameRender(el)

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
   * Watch for changes in image dimensions and re-render all layers
   */
  watch(
    [
      () => imageStore.getRenderedImage({ t, renderCall: false }),
      () => imageStore.pdfPageBytes,
      () => imageStore.fileType,
    ],
    ([newImage, newPdfBytes, newFileType]) => {
      if (newImage || newPdfBytes || newFileType) {
        console.log('#################### Image or PDF or file Type changed, re-rendering all...')
        renderAll()
      }
    },
  )

  /**
   * Watch for changes in viewport dimensions and update sizes
   */
  watch(
    () => imageStore.frame,
    (newFrame) => {
      if (newFrame && !renderingFrameSvg.value) {
        console.log('#################### Frame operations changed, re-rendering frame svg')
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
    overlayImageRef,
  }
}
