import { ref } from 'vue'
import { useToastModal } from '../modals/useToastModal'

export function usePresetTool(imageStore, historyStore, editorStore, presetsStore, t) {
  const { showToastModal } = useToastModal(editorStore, t)

  const newPresetName = ref('')

  const createPreset = () => {
    if (newPresetName.value === '') {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.invalidPresetName.title'),
        t('tools.preset.settings.createPreset.invalidPresetName.message'),
      )
      return
    }

    const result = presetsStore.createPreset(newPresetName.value)

    if (!result) {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.presetAlreadyExists.title'),
        t('tools.preset.settings.createPreset.presetAlreadyExists.message'),
      )
      return
    } else {
      showToastModal(
        'success',
        t('tools.preset.settings.createPreset.presetSuccessfullyCreated.title'),
        t('tools.preset.settings.createPreset.presetSuccessfullyCreated.message', {
          presetName: newPresetName.value,
        }),
      )
    }
  }

  return {
    newPresetName,
    createPreset,
  }
}
