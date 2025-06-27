import { onMounted, watch, ref, nextTick } from 'vue'
import { useFlipTool } from '../tools/useFlipTool'
import { useRotateTool } from '../tools/useRotateTool'
import { useFrameTool } from '../tools/useFrameTool'
import { useSmartCropTool } from '../tools/useSmartCropTool'
import { useCropTool } from '../tools/useCropTool'
import { useConfirmModal } from '@/composables/modals/useConfirmModal'
import { useToastModal } from '@/composables/modals/useToastModal'

export function useImageRenderer(
  imageStore,
  historyStore,
  editorStore,
  viewportStore,
  contentRef,
  t,
) {
  const { showConfirmModal } = useConfirmModal()
  const { showToastModal } = useToastModal()

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
      height = imageStore.imageOperations.frame.width * 2 + imageStore.fileDimensions.height
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
      if (imageStore.imageOperations.transformations?.length > 0) {
        console.log('Applying transformations:', imageStore.imageOperations.transformations)

        const transformations = imageStore.getTransformations()

        for (const operation of transformations) {
          switch (operation.type) {
            case 'flip':
              console.log('Applying flip operation:', operation.value)
              await useFlipTool(imageStore, historyStore).applyFlipRender(operation.value)
              break
            case 'rotate':
              console.log('Applying rotate operation:', operation.value)
              await useRotateTool(imageStore, historyStore, t).applyRotationRender(operation.value)
              break
            case 'crop': {
              console.log('Applying crop operation:', operation.value)
              const result = await useCropTool(
                imageStore,
                viewportStore,
                editorStore,
                historyStore,
                t,
              ).applyCropRender(operation.value)

              if (result === false) {
                const confirmed = await showConfirmModal(
                  t('tools.transform.settings.crop.confirmRemoveCropFromTransformations.title'),
                  t('tools.transform.settings.crop.confirmRemoveCropFromTransformations.message'),
                  t('tools.transform.settings.crop.confirmRemoveCropFromTransformations.cancel'),
                  t('tools.transform.settings.crop.confirmRemoveCropFromTransformations.confirm'),
                )
                if (confirmed) {
                  // Remove the crop operation from transformations and continue with the next operation
                  imageStore.imageOperations.transformations =
                    imageStore.imageOperations.transformations.filter(
                      (op) =>
                        !(
                          op.type === 'crop' &&
                          JSON.stringify(op.value) === JSON.stringify(operation.value)
                        ),
                    )
                } else {
                  console.log('Crop operation cancelled by user. Resetting to original.')

                  showToastModal(
                    'error',
                    t('tools.transform.settings.crop.toast.presetCannotBeApplied.title'),
                    t('tools.transform.settings.crop.toast.presetCannotBeApplied.message'),
                  )

                  historyStore.reset()

                  imageStore.resetImageOperations()
                  imageStore.renderedImage = imageStore.originalImage
                  imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

                  renderAll()
                  
                  return // End watch block execution
                }
              }

              break
            }
          }
        }
      }

      if (imageStore.imageOperations.smartCrop?.enabled) {
        console.log('Applying smart crop operation')
        await useSmartCropTool(imageStore, historyStore, editorStore, t).applyAutoSmartCropRender()
      }

      if (imageStore.imageOperations.frame?.enabled) {
        console.log('Applying frame operation')
        await useFrameTool(imageStore, historyStore, editorStore, t).applyFrameRender()
      }

      renderAll()
    },
    { deep: true },
  )

  return {
    canvasRef,
    svgRef,
  }
}
