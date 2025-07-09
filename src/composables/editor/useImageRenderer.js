import { onMounted, watch, ref, nextTick } from 'vue'
import { useFrameTool } from '../tools/useFrameTool'

export function useImageRenderer(
  imageStore,
  historyStore,
  editorStore,
  viewportStore,
  contentRef,
  t,
) {
  // const { showConfirmModal } = useConfirmModal()
  // const { showToastModal } = useToastModal()

  const canvasRef = ref(null)
  const svgRef = ref(null)
  // const frameSvgRef = ref(null)
  const frameSvgRef = ref(null)
  let renderingFrameSvg = ref(false)
  let skipNextRenderAll = ref(false)

  const updateSizes = () => {
    console.log('Updating sizes for image renderer...')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    // Nastavenie pre .viewport-content wrapper
    if (contentRef.value) {
      contentRef.value.style.width = `${width}px`
      contentRef.value.style.height = `${height}px`
    }

    // Nastavenie canvas vrstvy
    if (canvasRef.value) {
      canvasRef.value.width = width
      canvasRef.value.height = height
      canvasRef.value.style.width = `${width}px`
      canvasRef.value.style.height = `${height}px`
    }

    // Nastavenie SVG vrstvy (vektorové prvky)
    if (svgRef.value) {
      svgRef.value.setAttribute('width', width)
      svgRef.value.setAttribute('height', height)
      svgRef.value.style.width = `${width}px`
      svgRef.value.style.height = `${height}px`
    }

    // Nastavenie SVG rámika
    if (frameSvgRef.value) {
      const frame = imageStore.frame
      const frameEnabled = frame?.enabled && (frame.width > 0 || frame.height > 0)

      const fw = frameEnabled ? frame.width : 0
      const fh = frameEnabled ? frame.height : 0

      const header = frame?.headerSize || 0
      const isBrowserFrame =
        frame.type === 'frameMacBrowser' || frame.type === 'frameWindowsBrowser'

      const frameWidth = width + fw * 2
      const frameHeight = height + fh * 2 + (isBrowserFrame ? header - fh : 0)

      frameSvgRef.value.setAttribute('width', frameWidth)
      frameSvgRef.value.setAttribute('height', frameHeight)
      frameSvgRef.value.style.width = `${frameWidth}px`
      frameSvgRef.value.style.height = `${frameHeight}px`
    }
  }

  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.renderedImage || imageStore.fileType === 'pdf') return

    console.log('Rendering canvas (image only)...')

    const ctx = canvasRef.value.getContext('2d')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    canvasRef.value.width = width
    canvasRef.value.height = height
    canvasRef.value.style.width = `${width}px`
    canvasRef.value.style.height = `${height}px`

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(imageStore.renderedImage, 0, 0)

    if (historyStore.history.length === 0) {
      historyStore.push(imageStore.getSnapshot())
    }

    imageStore.previewUrl = canvasRef.value.toDataURL()
  }

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

    // Round corners for phone frames
    // UPDATE new frame type
    if (
      imageStore.frame.type === 'framePhoneIOS' ||
      imageStore.frame.type === 'framePhoneIOS2' ||
      imageStore.frame.type === 'framePhoneAndroid' ||
      imageStore.frame.type === 'framePhoneAndroid2'
    ) {
      const header = imageStore.frame.headerSize || 0
      const svgWidth = imageStore.fileDimensions.width + imageStore.frame.width * 2
      const svgHeight =
        imageStore.fileDimensions.height +
        imageStore.frame.height * 2 +
        (header > 0 ? header - imageStore.frame.height : 0)

      const radius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06) // 6% of the smaller dimension

      const renderedImage = imageStore.renderedImage
      if (!renderedImage) return

      const w = renderedImage.width
      const h = renderedImage.height

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      const path = new Path2D()

      // Create rounded rectangle path
      path.moveTo(radius, 0)
      path.lineTo(w - radius, 0)
      path.quadraticCurveTo(w, 0, w, radius)
      path.lineTo(w, h - radius)
      path.quadraticCurveTo(w, h, w - radius, h)
      path.lineTo(radius, h)
      path.quadraticCurveTo(0, h, 0, h - radius)
      path.lineTo(0, radius)
      path.quadraticCurveTo(0, 0, radius, 0)
      path.closePath()

      // Round corners by clipping
      ctx.save()
      ctx.clip(path)
      ctx.drawImage(renderedImage, 0, 0)
      ctx.restore()

      skipNextRenderAll.value = true
      imageStore.renderedImage = canvas
      imageStore.previewUrl = canvas.toDataURL()

      console.log(`Rounded corners with radius ${radius}px`)
    }
    console.log('-------------------------------------')
    renderCanvas()

    renderingFrameSvg.value = false
  }
  const renderAll = () => {
    updateSizes()

    if(imageStore.frame.enabled){
      renderFrameSvg()
    }else{
      renderCanvas()
    }
    renderSvg()
  }

  onMounted(() => {
    nextTick(() => {
      if (imageStore.renderedImage) {
        renderAll()
      }
    })
  })

  // watch on imageStore.renderedImage
  watch(
    () => imageStore.renderedImage,
    (newImage) => {
      if (newImage) {
        if (skipNextRenderAll.value) {
          skipNextRenderAll.value = false
          return
        }
        renderAll()
      }
    },
  )

  // watch on imageStore.frame
  watch(
    () => imageStore.frame,
    (newFrame) => {
      if (newFrame && !renderingFrameSvg.value) {
        console.log('Frame operations changed, re-rendering frame svg')
        updateSizes()
        renderFrameSvg()
      }
    },
    { immediate: true, deep: true },
  )

  return {
    canvasRef,
    svgRef,
    frameSvgRef,
  }
}
