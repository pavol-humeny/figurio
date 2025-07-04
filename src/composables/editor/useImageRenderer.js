import { onMounted, watch, ref, nextTick } from 'vue'
import { useFrameTool } from '../tools/useFrameTool'
// import { useFlipTool } from '../tools/useFlipTool'
// import { useRotateTool } from '../tools/useRotateTool'
// import { useSmartCropTool } from '../tools/useSmartCropTool'
// import { useCropTool } from '../tools/useCropTool'
// import { useGrayscaleTool } from '../tools/useGrayscaleTool'
// import { useConfirmModal } from '@/composables/modals/useConfirmModal'
// import { useToastModal } from '@/composables/modals/useToastModal'

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
  const frameCanvasRef = ref(null)

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

    // if (frameCanvasRef.value) {
    //   const frame = imageStore.imageOperations.frame
    //   const frameEnabled = frame?.enabled && frame.width > 0

    //   const width = imageStore.fileDimensions.width + (frameEnabled ? frame.width * 2 : 0)
    //   const height = imageStore.fileDimensions.height + (frameEnabled ? frame.width * 2 : 0)

    //   frameCanvasRef.value.style.width = `${width}px`
    //   frameCanvasRef.value.style.height = `${height}px`
    //   frameCanvasRef.value.width = width
    //   frameCanvasRef.value.height = height
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

  const renderFrameCanvas = () => {
    const frameCanvas = frameCanvasRef.value
    const ctx = frameCanvas?.getContext('2d')
    if (!frameCanvas || !ctx) return

    const frame = imageStore.frame
    const frameEnabled = frame?.enabled && frame.width > 0

    const fw = frameEnabled ? frame.width : 0
    const fh = frameEnabled ? frame.height : 0

    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    const canvasWidth = width + fw * 2
    let canvasHeight = height + fh * 2

    if (
      imageStore.frame.type === 'frameMacBrowser' ||
      imageStore.frame.type === 'frameWindowsBrowser'
    ) {
      canvasHeight = height + frame.headerSize + fh
      console.log('-----------------------Applying browser frame...: ', canvasHeight)
    }

    frameCanvas.width = canvasWidth
    frameCanvas.height = canvasHeight
    frameCanvas.style.width = `${canvasWidth}px`
    frameCanvas.style.height = `${canvasHeight}px`
    frameCanvas.style.left = `-${fw}px`

    if (
      imageStore.frame.type === 'frameMacBrowser' ||
      imageStore.frame.type === 'frameWindowsBrowser'
    ) {
      frameCanvas.style.top = `-${frame.headerSize}px`
    } else {
      frameCanvas.style.top = `-${fh}px`
    }

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    if (!frameEnabled) return

    console.log('Rendering frame canvas...')
    useFrameTool(imageStore, historyStore, editorStore, t).applyFrameRender(
      ctx,
      canvasWidth,
      canvasHeight,
    )
  }
  const renderAll = () => {
    updateSizes()
    renderCanvas()
    renderFrameCanvas()
    renderSvg()
  }

  onMounted(() => {
    nextTick(() => {
      if (imageStore.renderedImage || imageStore.renderedPdf) {
        renderAll()
      }
    })
  })

  // watch on imageStore.renderedImage
  watch(
    () => imageStore.renderedImage,
    (newImage) => {
      if (newImage) {
        renderAll()
      }
    },
  )

  //watch on imageStore.frame
  watch(
    () => imageStore.frame,
    (newFrame) => {
      if (newFrame) {
        console.log('Frame operations changed, re-rendering frame canvas')
        renderFrameCanvas()
      }
    },
    { deep: true },
  )

  // watch(
  //   () => [imageStore.originalImage, imageStore.frame],
  //   async () => {
  //     imageStore.renderedImage = imageStore.originalImage
  //     imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

  //     console.log('[watch] Original image or operations changed, applying operations')

  //     // Crop operation
      // if (imageStore.imageOperations.transformations.cropBox) {
      //   console.log('Applying crop operation:', imageStore.imageOperations.transformations.cropBox)

      //   useCropTool(imageStore, historyStore, t).applyCropRender(
      //     imageStore.imageOperations.transformations.cropBox,
      //   )
      // }

      // // Rotation operation
      // if (imageStore.imageOperations.transformations.rotationAngle !== 0) {
      //   console.log(
      //     'Applying rotation operation:',
      //     imageStore.imageOperations.transformations.rotationAngle,
      //   )

      //   useRotateTool(imageStore, historyStore, t).applyRotationRender(
      //     imageStore.imageOperations.transformations.rotationAngle,
      //   )
      // }

      // // Flip operation
      // if (imageStore.imageOperations.transformations.flipHorizontal) {
      //   console.log('Applying horizontal flip operation')

      //   useFlipTool(imageStore, historyStore).applyFlipRender('horizontal')
      // }
      // if (imageStore.imageOperations.transformations.flipVertical) {
      //   console.log('Applying vertical flip operation')

      //   useFlipTool(imageStore, historyStore).applyFlipRender('vertical')
      // }

      // // SmartCrop operation
      // if (imageStore.imageOperations.smartCrop?.enabled) {
      //   console.log('Applying smart crop operation')

      //   await useSmartCropTool(imageStore, historyStore, editorStore, t).applyAutoSmartCropRender()
      // }

      // // Grayscale operation
      // if (imageStore.imageOperations.grayscale?.enabled) {
      //   console.log('Applying grayscale operation')
      //   await useGrayscaleTool(imageStore, historyStore, t).applyGrayscaleRender()
      // }

  //     renderAll()
  //   },
  //   { deep: true },
  // )

  return {
    canvasRef,
    svgRef,
    frameCanvasRef,
  }
}
