import { useConfirmModal } from '../modals/useConfirmModal'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useUiStore } from '@/stores/uiStore'
import { useImagePipeline } from '../editor/useImagePipeline'

/**
 * Logic for applying grayscale
 *
 * @param {object} imageStore - Store containing image data and operations
 * @param {object} historyStore - Store for undo/redo history
 * @param {Function} t - Translation function from vue-i18n
 * @returns {object} Grayscale tool methods and state
 */
export function useGrayscaleTool(imageStore, editorStore, historyStore, t) {
  const { showConfirmModal } = useConfirmModal()
  const uiStore = useUiStore()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  const grayscaleType = ref(editorStore.toolsConfig.grayscale.type)

  /**
   * Grayscale options for the dropdown select in the settings panel
   */
  const grayscaleOptions = computed(() => [
    { value: 'luminance', label: t('tools.grayscale.settings.options.luminance') },
    { value: 'average', label: t('tools.grayscale.settings.options.average') },
    { value: 'lightness', label: t('tools.grayscale.settings.options.lightness') },
  ])

  /**
   * Apply grayscale operation and push to history
   * Prompts rasterization if vector elements are present
   */
  const applyGrayscale = async () => {
    if (imageStore.fileType === 'pdf') {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedBaseImageRasterization.title'),
        t('tools.confirmNeedBaseImageRasterization.message'),
        t('tools.confirmNeedBaseImageRasterization.cancel'),
        t('tools.confirmNeedBaseImageRasterization.confirm'),
      )
      if (!confirmed) return

      await imageStore.rasterizeBaseImage(t)
    }

    if (imageStore.needRasterization) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        const result = await imageStore.rasterize('editor', {}, t)

        imageStore.addImageOperation({
          type: 'rasterize',
          params: {
            overlay: result.overlay,
          },
          cost: 'high',
          affectsGeometry: true,
        })

        addUserEvent('applyOperation', {
          tool: 'rasterize',
          settings: {},
        })

        await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })
      } else {
        return
      }
    }

    // if (imageStore.needMergeOverlay) {
    //   imageStore.mergeOverlayIntoImage()
    //   showToastModal(
    //     'info',
    //     t('tools.infoOverlayWasMerged.title'),
    //     t('tools.infoOverlayWasMerged.message'),
    //   )
    // }

    addUserEvent('applyOperation', {
      tool: 'grayscale',
      settings: { grayscaleType: grayscaleType.value },
    })

    imageStore.addImageOperation({
      type: 'grayscale',
      params: {
        grayscaleType: grayscaleType.value,
      },
      cost: 'medium',
      affectsGeometry: false,
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    historyStore.push(imageStore.getSnapshot())

    saveConfigToEditorStore()
  }

  /**
   * Convert the current rendered image to grayscale
   * Supports: luminance, average, lightness
   * @param {string} type - Grayscale conversion method
   */
  // const applyGrayscaleRender = async (type) => {
  //   if (type === 'none') return

  //   const img = imageStore.getRenderedImage({ t, renderCall: false })
  //   if (!img) return

  //   const canvas = document.createElement('canvas')
  //   const ctx = canvas.getContext('2d')
  //   canvas.width = img.width
  //   canvas.height = img.height

  //   ctx.drawImage(img, 0, 0)
  //   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  //   // Set loading state
  //   uiStore.isApplying = true

  //   try {
  //     const worker = new Worker(new URL('@/composables/worker/grayscaleWorker.js', import.meta.url))

  //     const data = await new Promise((resolve) => {
  //       worker.onmessage = (e) => {
  //         resolve(e.data)
  //         worker.terminate()
  //       }
  //       worker.postMessage({ data: imageData.data, type })
  //     })

  //     // Apply the processed data back to canvas
  //     imageData.data.set(data)
  //     ctx.putImageData(imageData, 0, 0)

  //     // Update store
  //     imageStore.setRenderedImage(canvas)
  //   } finally {
  //     // Reset loading state even if an error occurs
  //     uiStore.isApplying = false
  //   }
  // }

  /**
   * Save grayscale config to editor store
   */
  const saveConfigToEditorStore = () => {
    editorStore.toolsConfig.grayscale.type = grayscaleType.value
  }

  return {
    applyGrayscale,
    grayscaleType,
    grayscaleOptions,
  }
}
