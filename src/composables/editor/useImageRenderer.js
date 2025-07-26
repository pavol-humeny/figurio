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

      // UPDATE new frame type
      const header = frame?.headerSize || 0
      const footer = frame?.footerSize || 0
      const isFrameWithHeader =
        frame.type === 'frameMacBrowser' ||
        frame.type === 'frameWindowsBrowser' ||
        frame.type === 'frameVSCode' ||
        ((frame.type === 'framePhoneIOS' ||
          frame.type === 'framePhoneIOS2' ||
          frame.type === 'framePhoneAndroid' ||
          frame.type === 'framePhoneAndroid2') &&
          imageStore.frame.phoneHeaderEnabled)

      const isFrameWithFooter = frame.type === 'frameWindowsTaskBar'

      const frameWidth = width + fw * 2
      const frameHeight =
        height + fh * 2 + (isFrameWithHeader ? header - fh : 0) + (isFrameWithFooter ? footer : 0)

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
    if (!canvasRef.value || !imageStore.getRenderedImage()) return

    console.log('Rendering canvas (image only)...')

    const ctx = canvasRef.value.getContext('2d')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    canvasRef.value.width = width
    canvasRef.value.height = height
    canvasRef.value.style.width = `${width}px`
    canvasRef.value.style.height = `${height}px`

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(imageStore.getRenderedImage(true), 0, 0)

    // Save initial state to history if empty
    if (historyStore.history.length === 0) {
      historyStore.push(imageStore.getSnapshot())
    }

    imageStore.previewUrl = canvasRef.value.toDataURL()
  }

  /**
   * Render SVG vector elements over the image
   */
  const renderSvg = () => {
    if (!svgRef.value || !imageStore.svgObjects) return

    console.log('Rendering SVG...')

    const svg = svgRef.value
    svg.innerHTML = ''

    imageStore.svgObjects.forEach((obj) => {
      if (!obj.tag) return

      const el = document.createElementNS('http://www.w3.org/2000/svg', obj.tag)

      if (obj.attrs && typeof obj.attrs === 'object') {
        for (const [key, value] of Object.entries(obj.attrs)) {
          el.setAttribute(key, value)
        }
      }

      svg.appendChild(el)
    })
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
    renderSvg()
  }

  /**
   * Watch for changes in image dimensions and re-render all layers
   */
  watch(
    () => imageStore.getRenderedImage(),
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
      if (imageStore.getRenderedImage()) {
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
