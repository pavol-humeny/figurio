import { useConfirmModal } from '../modals/useConfirmModal'
import { ref, computed } from 'vue'
import { useMath } from '../common/useMath'
import { useToastModal } from '../modals/useToastModal'
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

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
  const { round } = useMath()
  const { showToastModal } = useToastModal()

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
        await imageStore.rasterize(t)
      } else {
        return
      }
    }

    if (imageStore.needMergeOverlay) {
      imageStore.mergeOverlayIntoImage()
      showToastModal(
        'info',
        t('tools.infoOverlayWasMerged.title'),
        t('tools.infoOverlayWasMerged.message'),
      )
    }

    imageStore.addImageOperation({
      type: 'grayscale',
      grayscaleType: grayscaleType.value,
    })

    addUserEvent('applyOperation', {
      tool: 'grayscale',
      settings: { grayscaleType: grayscaleType.value },
    })

    applyGrayscaleRender(grayscaleType.value)

    saveConfigToEditorStore()

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Convert the current rendered image to grayscale
   * Supports: luminance, average, lightness
   * @param {string} type - Grayscale conversion method
   */
  const applyGrayscaleRender = (type) => {
    if (type === 'none') return

    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = img.width
    canvas.height = img.height

    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      let gray

      switch (type) {
        case 'luminance':
        default:
          // Weighted luminance method
          gray = round(0.299 * r + 0.587 * g + 0.114 * b)
          break
        case 'average':
          // Simple average of RGB channels
          gray = round((r + g + b) / 3)
          break
        case 'lightness':
          // Average of the max and min channel
          gray = round((Math.max(r, g, b) + Math.min(r, g, b)) / 2)
          break
      }

      data[i] = data[i + 1] = data[i + 2] = gray
    }

    ctx.putImageData(imageData, 0, 0)
    imageStore.setRenderedImage(canvas)
  }

  /**
   * Save grayscale config to editor store
   */
  const saveConfigToEditorStore = () => {
    editorStore.toolsConfig.grayscale.type = grayscaleType.value
  }

  return {
    applyGrayscale,
    applyGrayscaleRender,
    grayscaleType,
    grayscaleOptions,
  }
}
