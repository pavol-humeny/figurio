import { ref, computed, watch } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useFlipTool } from './useFlipTool'
import { useRotateTool } from './useRotateTool'
import { useSmartCropTool } from './useSmartCropTool'
import { useGrayscaleTool } from './useGrayscaleTool'

export function usePresetTool(imageStore, historyStore, editorStore, presetsStore, t) {
  const { showToastModal } = useToastModal()
  const { showConfirmModal } = useConfirmModal()

  // myPresets
  const isPresetModified = ref(false)
  const isModifyingPreset = ref(false)
  const initializing = ref(false)
  const selectedOperation = ref(null)
  const creatingNewOperation = ref(false)
  const newOperation = ref(null)

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
  const tmpLocalPresetName = ref('')
  const localImageOperations = ref([])
  const tmpLocalImageOperations = ref([])
  const localImageFrame = ref({})
  const tmpLocalImageFrame = ref({})

  watch(
    () => presetsStore.selectedPreset,
    (preset) => {
      if (!preset) return

      initializing.value = true

      localPresetName.value = preset.name
      localImageOperations.value = JSON.parse(JSON.stringify(preset.imageOperations))
      localImageFrame.value = JSON.parse(JSON.stringify(preset.imageFrame))

      isPresetModified.value = false

      initializing.value = false
    },
    { immediate: true },
  )

  watch(
    [() => localPresetName.value, () => localImageOperations.value, localImageFrame.value],
    () => {
      if (initializing.value) return
      isPresetModified.value = true
    },
    { deep: true },
  )

  const modifyPreset = () => {
    isModifyingPreset.value = true
    isPresetModified.value = false

    tmpLocalImageFrame.value = JSON.parse(JSON.stringify(localImageFrame.value))
    tmpLocalPresetName.value = localPresetName.value
    tmpLocalImageOperations.value = JSON.parse(JSON.stringify(localImageOperations.value))
  }

  const savePresetChanges = () => {
    console.log('Saving preset changes')
    presetsStore.updatePreset(
      presetsStore.selectedPresetName,
      localPresetName.value,
      JSON.parse(JSON.stringify(localImageOperations.value)),
      JSON.parse(JSON.stringify(localImageFrame.value)),
    )
    isPresetModified.value = false
    isModifyingPreset.value = false
    selectedOperation.value = null
    newOperation.value = null
    creatingNewOperation.value = false

    showToastModal(
      'success',
      t('tools.preset.settings.myPresets.presetSuccessfullySaved.title'),
      t('tools.preset.settings.myPresets.presetSuccessfullySaved.message', {
        presetName: localPresetName.value,
      }),
    )
  }

  const closeModifyPreset = async () => {
    if (isPresetModified.value) {
      const confirmed = await showConfirmModal(
        t('tools.preset.settings.myPresets.closeWithoutSavingConfirmation.title'),
        t('tools.preset.settings.myPresets.closeWithoutSavingConfirmation.message'),
        t('tools.preset.settings.myPresets.closeWithoutSavingConfirmation.cancel'),
        t('tools.preset.settings.myPresets.closeWithoutSavingConfirmation.confirm'),
      )
      if (!confirmed) {
        return
      } else {
        showToastModal(
          'info',
          t('tools.preset.settings.myPresets.closeWithoutSaving.title'),
          t('tools.preset.settings.myPresets.closeWithoutSaving.message'),
        )
      }
    }

    isModifyingPreset.value = false
    isPresetModified.value = false
    selectedOperation.value = null
    newOperation.value = null
    creatingNewOperation.value = false

    localPresetName.value = tmpLocalPresetName.value
    localImageOperations.value = JSON.parse(JSON.stringify(tmpLocalImageOperations.value))
    localImageFrame.value = JSON.parse(JSON.stringify(tmpLocalImageFrame.value))
    tmpLocalPresetName.value = ''
    tmpLocalImageOperations.value = []
    tmpLocalImageFrame.value = {}
  }

  const deletePreset = async () => {
    const confirmed = await showConfirmModal(
      t('tools.preset.settings.myPresets.deletePresetConfirmation.title'),
      t('tools.preset.settings.myPresets.deletePresetConfirmation.message', {
        presetName: presetsStore.selectedPresetName,
      }),
      t('tools.preset.settings.myPresets.deletePresetConfirmation.cancel'),
      t('tools.preset.settings.myPresets.deletePresetConfirmation.confirm'),
    )
    if (!confirmed) {
      return
    }

    showToastModal(
      'success',
      t('tools.preset.settings.myPresets.presetSuccessfullyDeleted.title'),
      t('tools.preset.settings.myPresets.presetSuccessfullyDeleted.message', {
        presetName: presetsStore.selectedPresetName,
      }),
    )

    presetsStore.deletePreset(presetsStore.selectedPresetName)
    isModifyingPreset.value = false
    isPresetModified.value = false
    selectedPresetName.value = '' // Reset selected preset name
    localPresetName.value = ''
    localImageOperations.value = {}
    localImageFrame.value = {}
    selectedOperation.value = null
    newOperation.value = null
    creatingNewOperation.value = false
  }

  const createNewOperation = () => {
    newOperation.value = { type: '' }
    creatingNewOperation.value = true
    selectedOperation.value = null
  }

  const addNewOperation = () => {
    creatingNewOperation.value = false
    if (!newOperation.value) return

    localImageOperations.value.push(JSON.parse(JSON.stringify(newOperation.value)))
  }

  const applyPreset = async () => {
    if (imageStore.svgObjects.length > 0) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (confirmed) {
        await imageStore.rasterize()
      } else {
        return
      }
    }

    const preset = presetsStore.selectedPreset

    // Get image operations from imageStore and compare with preset
    const currentImageOperations = imageStore.getImageOperations()
    const presetOperations = JSON.parse(JSON.stringify(preset.imageOperations))

    const currentImageFrame = imageStore.getImageFrame()
    const presetFrame = JSON.parse(JSON.stringify(preset.imageFrame))

    const areOperationsEqual =
      JSON.stringify(currentImageOperations) === JSON.stringify(presetOperations)

    let areFramesEqual = true
    if (currentImageFrame.type !== presetFrame.type) {
      areFramesEqual = true
    } else {
      if (currentImageFrame.type === 'frameSolid') {
        areFramesEqual =
          currentImageFrame.color === presetFrame.color &&
          currentImageFrame.width === presetFrame.width
      }
    }

    if (areOperationsEqual && areFramesEqual) {
      showToastModal(
        'info',
        t('tools.preset.settings.myPresets.presetAlreadyApplied.title'),
        t('tools.preset.settings.myPresets.presetAlreadyApplied.message', {
          presetName: preset.name,
        }),
      )
      return
    }

    imageStore.resetRenderedImageToOriginal()

    if (preset.imageOperations.length !== 0) {
      preset.imageOperations.forEach((operation) => {
        if (operation.type === 'rotation') {
          useRotateTool(imageStore, historyStore, t).applyRotationRender(operation.angle)
        } else if (operation.type === 'flip') {
          useFlipTool(imageStore, historyStore).applyFlipRender(operation.direction)
        } else if (operation.type === 'smartCrop') {
          useSmartCropTool(imageStore, historyStore).applyAutoSmartCropRender(operation)
        } else if (operation.type === 'grayscale') {
          useGrayscaleTool(imageStore, historyStore).applyGrayscaleRender()
        }
      })
    }

    // Apply frame
    imageStore.frame = JSON.parse(JSON.stringify(preset.imageFrame))

    // Save current operations to imageStore
    imageStore.imageOperations = JSON.parse(JSON.stringify(preset.imageOperations))

    historyStore.push(imageStore.getSnapshot())
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

  watch(
    () => localImageFrame.value.enabled,
    (enabled) => {
      isPresetModified.value = true
      if (enabled) {
        // Set default values for frame if not already set
        if (
          !localImageFrame.value.type ||
          !localImageFrame.value.color ||
          localImageFrame.value.width == null
        ) {
          localImageFrame.value.type = 'frameSolid'
          localImageFrame.value.color = '#000000'
          localImageFrame.value.width = 0
        }
      }
    },
  )

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

    const imageOperations = [] // UPDATE
    const imageFrame = {}

    if (newPreset.value.transformations.rotationAngle !== 0) {
      imageOperations.push({
        type: 'rotation',
        angle: newPreset.value.transformations.rotationAngle,
      })
    }
    if (newPreset.value.transformations.horizontalFlip) {
      imageOperations.push({ type: 'flip', direction: 'horizontal' })
    }
    if (newPreset.value.transformations.verticalFlip) {
      imageOperations.push({ type: 'flip', direction: 'vertical' })
    }
    if (newPreset.value.smartCrop.enabled) {
      imageOperations.push({
        type: 'smartCrop',
        color: newPreset.value.smartCrop.color,
      })
    }
    if (newPreset.value.grayscale.enabled) {
      imageOperations.push({ type: 'grayscale', enabled: true })
    }
    if (newPreset.value.frame.type !== 'none') {
      imageFrame.type = newPreset.value.frame.type
      imageFrame.color = newPreset.value.frame.color
      imageFrame.width = newPreset.value.frame.width
    }

    presetsStore.createPreset(
      structuredClone(newPreset.value.presetName),
      structuredClone(imageOperations),
      structuredClone(imageFrame),
    )

    resetPreset()

    showToastModal(
      'success',
      t('tools.preset.settings.createPreset.presetSuccessfullyCreated.title'),
      t('tools.preset.settings.createPreset.presetSuccessfullyCreated.message'),
    )
  }

  const resetFrameWidth = () => {
    newPreset.value.frame.width = 0
    frameWidthRef.value.setValue(0)
  }

  const useCurrentModifications = () => {
    console.log('Using current modifications to create preset')

    const result = presetsStore.createPreset(
      structuredClone(newPreset.value.presetName),
      structuredClone(imageStore.getImageOperations()),
      structuredClone(imageStore.getImageFrame()),
    )

    if (result === 'invalid') {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.invalidPresetName.title'),
        t('tools.preset.settings.createPreset.invalidPresetName.message'),
      )
      return
    } else if (result === 'alreadyExists') {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.presetAlreadyExists.title'),
        t('tools.preset.settings.createPreset.presetAlreadyExists.message'),
      )
      return
    }

    resetPreset()

    showToastModal(
      'success',
      t('tools.preset.settings.createPreset.presetSuccessfullyCreated.title'),
      t('tools.preset.settings.createPreset.presetSuccessfullyCreated.message'),
    )
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
    localImageFrame,
    selectedOperation,
    createNewOperation,
    addNewOperation,
    creatingNewOperation,
    newOperation,
    applyPreset,
  }
}
