import { ref, computed, watch } from 'vue'

export function usePresetTool(imageStore, historyStore, editorStore, presetsStore, t) {
  // myPresets
  const isPresetModified = ref(false)
  const isModifyingPreset = ref(false)
  const initializing = ref(false)

  const presetsOptions = computed(() => {
    return presetsStore.allPresetNames.map((name) => ({
      label: name,
      value: name,
    }))
  })

  const selectedPresetName = computed({
    get: () => presetsStore.selectedPresetName,
    set: (name) => {
      presetsStore.selectPreset(name)
    },
  })

  const localPresetName = ref('')
  const localImageOperations = ref({})

  watch(
    () => presetsStore.selectedPreset,
    (preset) => {
      if (!preset) return

      initializing.value = true

      localPresetName.value = preset.name
      localImageOperations.value = JSON.parse(JSON.stringify(preset.imageOperations))

      isPresetModified.value = false

      initializing.value = false
    },
    { immediate: true },
  )

  watch(
    [() => localPresetName.value, () => localImageOperations.value],
    () => {
      if (initializing.value) return
      isPresetModified.value = true
    },
    { deep: true },
  )

  const modifyPreset = () => {
    isModifyingPreset.value = true
  }

  const savePresetChanges = () => {
    presetsStore.updatePreset(
      presetsStore.selectedPresetName,
      localPresetName.value,
      JSON.parse(JSON.stringify(localImageOperations.value)),
    )
    isPresetModified.value = false
    isModifyingPreset.value = false
  }

  const closeModifyPreset = () => {
    isModifyingPreset.value = false
    isPresetModified.value = false
  }

  const deletePreset = () => {
    presetsStore.deletePreset(presetsStore.selectedPresetName)
    isModifyingPreset.value = false
    isPresetModified.value = false
    selectedPresetName.value = '' // Reset selected preset name
    localPresetName.value = ''
    localImageOperations.value = {}
  }

  // createPreset

  const frameWidthRef = ref(null)
  const presetNameRef = ref(null)

  const newPreset = ref({
    presetName: '',
    transformations: {
      rotationAngle: 0,
      horizontalFlip: false,
      verticalFlip: false,
    },
    smartCrop: {
      enabled: false,
      color: '#000000',
    },
    grayscale: {
      enabled: false,
    },
    frame: {
      type: 'none',
      color: '#000000',
      width: 0,
    },
    // UPDATE
  })

  const isShowManualPresetSetting = ref(false)

  const showManualPresetSetting = () => {
    isShowManualPresetSetting.value = true
  }

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

  const resetPreset = () => {
    newPreset.value = {
      presetName: '',
      transformations: {
        rotationAngle: 0,
        horizontalFlip: false,
        verticalFlip: false,
      },
      smartCrop: {
        enabled: false,
        color: '#000000',
      },
      grayscale: {
        enabled: false,
      },
      frame: {
        type: 'none',
        color: '#000000',
        width: 0,
      },
      // UPDATE
    }

    isShowManualPresetSetting.value = false
  }

  const createPreset = () => {
    console.log('Creating preset:', newPreset.value.presetName)

    const imageOperations = {
      transformations: {
        rotationAngle: newPreset.value.transformations.rotationAngle,
        horizontalFlip: newPreset.value.transformations.horizontalFlip,
        verticalFlip: newPreset.value.transformations.verticalFlip,
      },
      smartCrop: {
        enabled: newPreset.value.smartCrop.enabled,
        color: newPreset.value.smartCrop.color,
      },
      grayscale: {
        enabled: newPreset.value.grayscale.enabled,
      },
      frame: {
        type: newPreset.value.frame.type,
        color: newPreset.value.frame.color,
        width: newPreset.value.frame.width,
      },
      // UPDATE
    }

    presetsStore.createPreset(
      structuredClone(newPreset.value.presetName),
      structuredClone(imageOperations),
    )

    resetPreset()
  }

  const resetFrameWidth = () => {
    newPreset.value.frame.width = 0
    frameWidthRef.value.setValue(0)
  }

  const useCurrentModifications = () => {
    console.log('Using current modifications to create preset')

    presetsStore.createPreset(
      structuredClone(newPreset.value.presetName),
      structuredClone(imageStore.getImageOperations()),
    )

    resetPreset()
  }

  return {
    newPreset,
    createPreset,
    isShowManualPresetSetting,
    presetRotationOptions,
    presetFrameOptions,
    frameWidthRef,
    resetFrameWidth,
    showManualPresetSetting,
    useCurrentModifications,
    presetNameRef,
    selectedPresetName,
    localPresetName,
    localImageOperations,
    savePresetChanges,
    isPresetModified,
    presetsOptions,
    isModifyingPreset,
    modifyPreset,
    deletePreset,
    closeModifyPreset,
  }
}
