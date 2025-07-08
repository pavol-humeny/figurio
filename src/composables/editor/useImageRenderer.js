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
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    if (contentRef.value) {
      contentRef.value.style.width = `${width}px`
      contentRef.value.style.height = `${height}px`
    }
    // if (svgRef.value) {
    //   svgRef.value.style.width = `${width}px`
    //   svgRef.value.style.height = `${height}px`
    // }
    // if (canvasRef.value) {
    //   canvasRef.value.style.width = `${width}px`
    //   canvasRef.value.style.height = `${height}px`
    //   canvasRef.value.width = width
    //   canvasRef.value.height = height
    // }

    // if (frameSvgRef.value) {
    //   const frame = imageStore.imageOperations.frame
    //   const frameEnabled = frame?.enabled && frame.width > 0

    //   const width = imageStore.fileDimensions.width + (frameEnabled ? frame.width * 2 : 0)
    //   const height = imageStore.fileDimensions.height + (frameEnabled ? frame.width * 2 : 0)

    //   frameSvgRef.value.style.width = `${width}px`
    //   frameSvgRef.value.style.height = `${height}px`
    //   frameSvgRef.value.width = width
    //   frameSvgRef.value.height = height
    // }
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
    if (
      imageStore.frame.type === 'framePhoneIOS' ||
      imageStore.frame.type === 'framePhoneAndroid'
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

      renderCanvas()

      console.log(`Rounded corners with radius ${radius}px`)
    }

    renderingFrameSvg.value = false
  }
  const renderAll = () => {
    updateSizes()
    renderCanvas()
    renderFrameSvg()
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
