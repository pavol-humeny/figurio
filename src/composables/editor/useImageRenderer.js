import { onMounted, watch, ref, nextTick } from 'vue'
import { useFlipTool } from '../tools/useFlipTool'
import { useRotateTool } from '../tools/useRotateTool'
import { useFrameTool } from '../tools/useFrameTool'
import { useSmartCropTool } from '../tools/useSmartCropTool'
import { useCropTool } from '../tools/useCropTool'
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

  const updateSizes = () => {
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    if (contentRef.value) {
      contentRef.value.style.width = `${width}px`
      contentRef.value.style.height = `${height}px`
    }
    if (svgRef.value) {
      svgRef.value.style.width = `${width}px`
      svgRef.value.style.height = `${height}px`
    }
    if (canvasRef.value) {
      canvasRef.value.style.width = `${width}px`
      canvasRef.value.style.height = `${height}px`
      canvasRef.value.width = width
      canvasRef.value.height = height
    }
    // if (pdfWrapperRef.value) {
    //   pdfWrapperRef.value.style.width = `${width}px`
    //   pdfWrapperRef.value.style.height = `${height}px`
    // }
  }

  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.renderedImage || imageStore.fileType === 'pdf') return

    console.log('Rendering canvas...')

    const ctx = canvasRef.value.getContext('2d')

    let width = 0
    let height = 0

    if (imageStore.imageOperations.frame?.enabled) {
      width = imageStore.imageOperations.frame.width * 2 + imageStore.fileDimensions.width
      height = imageStore.imageOperations.frame.height * 2 + imageStore.fileDimensions.height
      console.log('Applying frame dimensions:', width, height)
    } else {
      width = imageStore.fileDimensions.width
      height = imageStore.fileDimensions.height
    }

    canvasRef.value.width = width
    canvasRef.value.height = height

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

  const renderAll = async () => {
    updateSizes()
    renderCanvas()
    renderSvg()
  }

  onMounted(() => {
    nextTick(() => {
      if (imageStore.renderedImage || imageStore.renderedPdf) {
        renderAll()
      }
    })
  })

  watch(
    () => [imageStore.originalImage, imageStore.imageOperations],
    async () => {
      imageStore.renderedImage = imageStore.originalImage
      imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

      console.log('[watch] Original image or operations changed, applying operations')

      // Crop operation
      if (imageStore.imageOperations.transformations.cropBox) {
        console.log('Applying crop operation:', imageStore.imageOperations.transformations.cropBox)

        useCropTool(imageStore, historyStore, t).applyCropRender(
          imageStore.imageOperations.transformations.cropBox,
        )
      }

      // Rotation operation
      if (imageStore.imageOperations.transformations.rotationAngle !== 0) {
        console.log(
          'Applying rotation operation:',
          imageStore.imageOperations.transformations.rotationAngle,
        )

        useRotateTool(imageStore, historyStore, t).applyRotationRender(
          imageStore.imageOperations.transformations.rotationAngle,
        )
      }

      // Flip operation
      if (imageStore.imageOperations.transformations.flipHorizontal) {
        console.log('Applying horizontal flip operation')

        useFlipTool(imageStore, historyStore).applyFlipRender('horizontal')
      }
      if (imageStore.imageOperations.transformations.flipVertical) {
        console.log('Applying vertical flip operation')

        useFlipTool(imageStore, historyStore).applyFlipRender('vertical')
      }

      // SmartCrop operation
      if (imageStore.imageOperations.smartCrop?.enabled) {
        console.log('Applying smart crop operation')

        await useSmartCropTool(imageStore, historyStore, editorStore, t).applyAutoSmartCropRender()
      }

      // Frame operation
      console.log('Applying frame operation')

      useFrameTool(imageStore, historyStore, editorStore, t).applyFrameRender()

      renderAll()
    },
    { deep: true },
  )

  return {
    canvasRef,
    svgRef,
  }
}
