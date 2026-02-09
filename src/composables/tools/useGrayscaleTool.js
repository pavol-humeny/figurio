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

      // await imageStore.rasterizeBaseImage(t)
      imageStore.addImageOperation({
        type: 'rasterizePdf',
        params: {},
        cost: 'high',
        affectsGeometry: false,
      })

      addUserEvent('applyOperation', {
        tool: 'rasterizePdf',
        settings: {},
      })

      await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })
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
