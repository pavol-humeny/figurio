import { onMounted, watch, ref, nextTick } from 'vue'
import { useFrameTool } from '../tools/useFrameTool'

/**
 * Logic for rendering image layers (canvas, SVG, frame) in the editor viewport
 *
 * @param {ReturnType<typeof import('@/stores/imageStore').useImageStore>} imageStore - Image store
 * @param {ReturnType<typeof import('@/stores/historyStore').useHistoryStore>} historyStore - History store
 * @param {ReturnType<typeof import('@/stores/workspaceStore').useWorkspaceStore>} editorStore - Editor store
 * @param {ReturnType<typeof import('@/stores/viewportStore').useViewportStore>} viewportStore - Viewport store
 * @param {import('vue').Ref<HTMLElement>} contentRef - Reference to the .viewport-content element
 * @param {(key: string) => string} t - Translation function
 * @returns {{
 *   canvasRef: import('vue').Ref<HTMLCanvasElement | null>,
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
   * Reference to the base canvas layer
   */
  const canvasRef = ref(null)

  /**
   * Reference to the SVG layer for vector elements
   */
  const svgRef = ref(null)

  /**
   * Reference to the SVG layer for frame
   */
  const frameSvgRef = ref(null)

  /**
   * Internal flag to avoid overlapping frame render calls
   */
  let renderingFrameSvg = ref(false)

  /**
   * Set dimensions of canvas, svg and frame layers based on image size and frame config
   */
  const updateSizes = () => {
    console.log('Updating sizes for image renderer...')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    // Set content layer dimensions
    if (contentRef.value) {
      contentRef.value.style.width = `${width}px`
      contentRef.value.style.height = `${height}px`
    }

    // Set canvas dimensions
    if (canvasRef.value) {
      canvasRef.value.width = width
      canvasRef.value.height = height
      canvasRef.value.style.width = `${width}px`
      canvasRef.value.style.height = `${height}px`
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
   * Render base canvas from rasterized image
   */
  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.getRenderedImage({ t, renderCall: false })) return

    console.log('Rendering canvas (image only)...')

    const ctx = canvasRef.value.getContext('2d')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height
    const dpr = window.devicePixelRatio || 1

    if (canvasRef.value.width !== width * dpr || canvasRef.value.height !== height * dpr) {
      canvasRef.value.width = width * dpr
      canvasRef.value.height = height * dpr
      canvasRef.value.style.width = `${width}px`
      canvasRef.value.style.height = `${height}px`
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(imageStore.getRenderedImage({ t, renderCall: true }), 0, 0)

    // Save initial state to history if empty
    if (historyStore.history.length === 0) {
      historyStore.push(imageStore.getSnapshot(t))
    }

    imageStore.previewUrl = canvasRef.value.toDataURL()
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
    // renderSvg()
  }

  /**
   * Watch for changes in image dimensions and re-render all layers
   */
  watch(
    () => imageStore.getRenderedImage({ t, renderCall: false }),
    (newImage) => {
      if (newImage) {
        console.log('#################### Image rendered changed, re-rendering all...')
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
    { immediate: true, deep: true },
  )

  // Initial rendering on mount
  onMounted(() => {
    nextTick(() => {
      if (imageStore.getRenderedImage({ t, renderCall: false })) {
        renderAll()
      }
    })
  })

  return {
    canvasRef,
    svgRef,
    frameSvgRef,
  }
}
