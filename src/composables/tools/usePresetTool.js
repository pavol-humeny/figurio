import { ref, computed, watch } from 'vue'
import { useToastModal } from '../modals/useToastModal'

export function usePresetTool(imageStore, historyStore, editorStore, presetsStore, t) {
  const { showToastModal } = useToastModal(editorStore, t)

  const presetNameInputRef = ref(null)
  const presetFrameWidthRef = ref(null)
  const newPresetName = ref('')
  const createdPresetName = ref('')

  const newPresetCreated = ref(false)
  const newPresetIsModified = ref(false)

  const newPresetRotation = ref(0)
  const newPresetHorizontalFlip = ref(false)
  const newPresetVerticalFlip = ref(false)
  const newPresetSmartCrop = ref(false)
  const newPresetFrame = ref({
    type: 'frameSolid',
    color: '#000000',
    width: 0,
  })

  // Watch for changes to set newPresetIsModified
  watch(
    [
      newPresetName,
      newPresetRotation,
      newPresetHorizontalFlip,
      newPresetVerticalFlip,
      newPresetSmartCrop,
      newPresetFrame,
    ],
    () => {
      newPresetIsModified.value = true
    },
    { deep: true },
  )

  const presetRotationOptions = [
    { label: '-180°', value: -180 },
    { label: '-90°', value: -90 },
    { label: '0°', value: 0 },
    { label: '90°', value: 90 },
    { label: '180°', value: 180 },
  ]

  const presetFrameOptions = computed(() => [
    { label: t('tools.frame.settings.general.frameVariants.frameSolid'), value: 'frameSolid' },
    {
      label: t('tools.frame.settings.general.frameVariants.frameMacBrowser'),
      value: 'frameMacBrowser',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.frameWindowsBrowser'),
      value: 'frameWindowsBrowser',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.framePhoneIOS'),
      value: 'framePhoneIOS',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.framePhoneAndroid'),
      value: 'framePhoneAndroid',
    },
  ])

  const setFrameWidth = (width) => {
    if (width <= 0) {
      width = 0
      newPresetFrame.value.width = width
    } else {
      newPresetFrame.value.width = width
      presetFrameWidthRef.value.setValue(width)
    }
  }

  const createPreset = () => {
    console.log('Creating preset:', newPresetName.value)

    if (presetsStore.createPreset(newPresetName.value)) {
      showToastModal(
        'success',
        t('tools.preset.settings.createPreset.presetSuccessfullyCreated.title'),
        t('tools.preset.settings.createPreset.presetSuccessfullyCreated.message', {
          presetName: newPresetName.value,
        }),
      )

      newPresetIsModified.value = false
      newPresetCreated.value = true
      createdPresetName.value = newPresetName.value
    } else {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.invalidPresetName.title'),
        t('tools.preset.settings.createPreset.invalidPresetName.message'),
      )
      presetNameInputRef.value.setValue('')
    }
  }

  const savePreset = () => {
    console.log('Saving preset:', newPresetName.value)

    const newImageOperations = {
      transformations: {},
      frame: {},
      smartCrop: {},
    }

    if (
      presetsStore.updatePreset(createdPresetName.value, newPresetName.value, newImageOperations)
    ) {
      showToastModal(
        'success',
        t('tools.preset.settings.createPreset.presetSuccessfullySaved.title'),
        t('tools.preset.settings.createPreset.presetSuccessfullySaved.message', {
          presetName: newPresetName.value,
        }),
      )

      newPresetCreated.value = false
      presetNameInputRef.value.setValue('')
      createdPresetName.value = newPresetName.value
    } else {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.invalidPresetName.title'),
        t('tools.preset.settings.createPreset.invalidPresetName.message'),
      )

      presetNameInputRef.value.setValue(createdPresetName.value)
    }
  }

  return {
    presetNameInputRef,
    presetFrameWidthRef,
    newPresetName,
    newPresetCreated,
    createPreset,
    savePreset,
    setFrameWidth,
    presetRotationOptions,
    presetFrameOptions,
    newPresetRotation,
    newPresetHorizontalFlip,
    newPresetVerticalFlip,
    newPresetSmartCrop,
    newPresetFrame,
    newPresetIsModified,
  }
}
