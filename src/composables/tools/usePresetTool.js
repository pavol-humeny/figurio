import { ref, computed, watch, reactive, nextTick } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { useConfirmModal } from '../modals/useConfirmModal'

export function usePresetTool(imageStore, historyStore, editorStore, presetsStore, t) {
  const { showToastModal } = useToastModal()
  const { showConfirmModal } = useConfirmModal()

  const presetNameInputRef = ref(null)
  const presetFrameWidthRef = ref(null)
  const presetIsModified = ref(false)
  const presetModifying = ref(false)

  const presetsOptions = computed(() => {
    return presetsStore.allPresetNames.map((name) => ({
      label: name,
      value: name,
    }))
  })

  const selectedPresetName = ref(presetsStore.selectedPresetName)

  watch(selectedPresetName, (newName) => {
    presetsStore.selectPreset(newName)
  })

  watch(
    () => presetsStore.selectedPresetName,
    (newName) => {
      selectedPresetName.value = newName
      presetIsModified.value = false
    },
  )

  const localPresetName = ref('')
  const originalPresetName = ref('')

  const localImageOperations = reactive({
    transformations: {},
    smartCrop: {},
    frame: {},
  })

  const newPresetName = ref('')
  const newPresetRotation = ref(0)
  const newPresetHorizontalFlip = ref(false)
  const newPresetVerticalFlip = ref(false)
  const newPresetSmartCrop = ref(false)
  const newPresetFrame = ref({
    enabled: false,
    type: 'frameSolid',
    color: '#000000',
    width: 0,
    height: 0,
  })

  const isInitializing = ref(false)

  watch(
    () => presetsStore.selectedPreset,
    (preset) => {
      if (!preset) return

      isInitializing.value = true

      localPresetName.value = preset.name
      originalPresetName.value = preset.name

      Object.assign(
        localImageOperations.transformations,
        preset.imageOperations.transformations || {},
      )
      Object.assign(localImageOperations.smartCrop, preset.imageOperations.smartCrop || {})
      Object.assign(localImageOperations.frame, preset.imageOperations.frame || {})

      presetIsModified.value = false

      // Odložené vypnutie inicializačného režimu (na ďalší tick)
      nextTick(() => {
        isInitializing.value = false
      })
    },
    { immediate: true },
  )

  // Watch for changes to set presetIsModified
  watch(
    [
      () => localPresetName.value,
      () => localImageOperations.transformations.rotationAngle,
      () => localImageOperations.transformations.flipHorizontal,
      () => localImageOperations.transformations.flipVertical,
      () => localImageOperations.smartCrop.enabled,
      () => localImageOperations.frame.enabled,
      () => localImageOperations.frame.type,
      () => localImageOperations.frame.color,
      () => localImageOperations.frame.width,
    ],
    () => {
      if (!isInitializing.value) {
        presetIsModified.value = true
      }
    },
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
    }
    presetFrameWidthRef.value.setValue(width)
  }

  const createPreset = () => {
    const name = newPresetName.value.trim()

    if (!name) return

    const created = presetsStore.createPreset(name)

    if (created) {
      // Skladáme imageOperations z new* premenných
      const newImageOperations = {
        transformations: {
          rotationAngle: newPresetRotation.value,
          flipHorizontal: newPresetHorizontalFlip.value,
          flipVertical: newPresetVerticalFlip.value,
        },
        smartCrop: {
          enabled: newPresetSmartCrop.value,
        },
        frame: {
          ...newPresetFrame.value,
        },
      }

      // Update
      presetsStore.updatePreset(name, name, newImageOperations)

      showToastModal(
        'success',
        t('tools.preset.settings.createPreset.presetSuccessfullyCreated.title'),
        t('tools.preset.settings.createPreset.presetSuccessfullyCreated.message', {
          presetName: name,
        }),
      )

      newPresetName.value = ''
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
    if (!originalPresetName.value) return

    const success = presetsStore.updatePreset(
      originalPresetName.value,
      localPresetName.value,
      JSON.parse(JSON.stringify(localImageOperations)),
    )

    if (success) {
      showToastModal(
        'success',
        t('tools.preset.settings.myPresets.presetSuccessfullySaved.title'),
        t('tools.preset.settings.myPresets.presetSuccessfullySaved.message', {
          presetName: localPresetName.value,
        }),
      )
      presetIsModified.value = false
      presetModifying.value = false
    } else {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.invalidPresetName.title'),
        t('tools.preset.settings.createPreset.invalidPresetName.message'),
      )
    }
  }

  const applyPreset = () => {
    // Check if preset is identical to current operations
    const currentOps = imageStore.getImageOperations()
    const newOps = JSON.parse(JSON.stringify(presetsStore.selectedPreset.imageOperations))

    // Reset cropBox to null in both for fair comparison
    currentOps.transformations.cropBox = null
    newOps.transformations.cropBox = null
    if (newOps.frame.enabled && newOps.frame.width !== 0 && newOps.frame.height === 0) {
      newOps.frame.height = newOps.frame.width
    }

    const isEqual = JSON.stringify(currentOps) === JSON.stringify(newOps)

    if (isEqual) {
      showToastModal(
        'info',
        t('tools.preset.settings.myPresets.presetAlreadyApplied.title'),
        t('tools.preset.settings.myPresets.presetAlreadyApplied.message', {
          presetName: selectedPresetName.value,
        }),
      )
      return
    }

    imageStore.setImageOperations(presetsStore.selectedPreset.imageOperations)

    historyStore.push(imageStore.getSnapshot())

    showToastModal(
      'success',
      t('tools.preset.settings.myPresets.successfullyApplied.title'),
      t('tools.preset.settings.myPresets.successfullyApplied.message', {
        presetName: selectedPresetName.value,
      }),
    )
  }

  const modifyPreset = () => {
    presetModifying.value = true
  }

  const closeModifying = () => {
    presetModifying.value = false
  }

  const deletePreset = async () => {
    const confirmed = await showConfirmModal(
      t('tools.preset.settings.myPresets.deletePresetConfirmation.title'),
      t('tools.preset.settings.myPresets.deletePresetConfirmation.message', {
        presetName: selectedPresetName.value,
      }),
      t('tools.preset.settings.myPresets.deletePresetConfirmation.cancel'),
      t('tools.preset.settings.myPresets.deletePresetConfirmation.confirm'),
    )
    if (!confirmed) {
      return
    }

    presetsStore.deletePreset(selectedPresetName.value)

    presetModifying.value = false

    showToastModal(
      'success',
      t('tools.preset.settings.myPresets.presetSuccessfullyDeleted.title'),
      t('tools.preset.settings.myPresets.presetSuccessfullyDeleted.message', {
        presetName: selectedPresetName.value,
      }),
    )
  }

  const useCurrentModifications = () => {
    newPresetRotation.value = imageStore.imageOperations.transformations.rotationAngle
    newPresetHorizontalFlip.value = imageStore.imageOperations.transformations.flipHorizontal
    newPresetVerticalFlip.value = imageStore.imageOperations.transformations.flipVertical
    newPresetSmartCrop.value = imageStore.imageOperations.smartCrop.enabled
    newPresetFrame.value = {
      enabled: imageStore.imageOperations.frame.enabled,
      type: imageStore.imageOperations.frame.type,
      color: imageStore.imageOperations.frame.color,
      width: imageStore.imageOperations.frame.width,
      height: imageStore.imageOperations.frame.height,
    }
  }

  return {
    presetNameInputRef,
    presetFrameWidthRef,
    newPresetName,
    createPreset,
    savePreset,
    applyPreset,
    modifyPreset,
    presetModifying,
    closeModifying,
    setFrameWidth,
    deletePreset,
    useCurrentModifications,
    presetRotationOptions,
    presetFrameOptions,
    newPresetRotation,
    newPresetHorizontalFlip,
    newPresetVerticalFlip,
    newPresetSmartCrop,
    newPresetFrame,
    presetIsModified,
    presetsOptions,
    localPresetName,
    originalPresetName,
    localImageOperations,
    selectedPresetName,
  }
}
