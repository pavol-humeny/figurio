import { ref, computed, watch, reactive, nextTick } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useSmartCropTool } from '../tools/useSmartCropTool'
import { useGrayscaleTool } from '../tools/useGrayscaleTool'
import { useFlipTool } from '../tools/useFlipTool'
import { useRotateTool } from '../tools/useRotateTool'

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
    grayScale: {},
    frame: {},
  })

  const newPresetName = ref('')
  const newPresetRotation = ref(0)
  const newPresetHorizontalFlip = ref(false)
  const newPresetVerticalFlip = ref(false)
  const newPresetGrayScale = ref(false)
  const newPresetSmartCropEnabled = ref(false)
  const newPresetSmartCropColor = ref('#000000')

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

      // Transformations
      Object.assign(
        localImageOperations.transformations,
        preset.imageOperations.transformations || {},
      )
      // SmartCrop
      Object.assign(localImageOperations.smartCrop, preset.imageOperations.smartCrop || {})
      // GrayScale
      localImageOperations.grayScale.enabled = preset.imageOperations.grayScale?.enabled || false
      // Frame
      Object.assign(localImageOperations.frame, preset.imageOperations.frame || {})

      presetIsModified.value = false

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
      () => localImageOperations.smartCrop.color,
      () => localImageOperations.grayScale,
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
          enabled: newPresetSmartCropEnabled.value,
          color: newPresetSmartCropColor.value,
        },
        frame: {
          ...newPresetFrame.value,
        },
        grayScale: {
          enabled: newPresetGrayScale.value,
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

    applyOperationsOnOriginalImage()

    historyStore.push(imageStore.getSnapshot())

    showToastModal(
      'success',
      t('tools.preset.settings.myPresets.successfullyApplied.title'),
      t('tools.preset.settings.myPresets.successfullyApplied.message', {
        presetName: selectedPresetName.value,
      }),
    )
  }

  const applyOperationsOnOriginalImage = async () => {
    imageStore.renderedImage = imageStore.originalImage
    imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

    // Rotation operation
    if (imageStore.imageOperations.transformations.rotationAngle !== 0) {
      console.log(
        'Preset - Applying rotation operation:',
        imageStore.imageOperations.transformations.rotationAngle,
      )
      useRotateTool(imageStore, historyStore, t).applyRotationRender(
        imageStore.imageOperations.transformations.rotationAngle,
      )
    }
    // Flip operation
    if (imageStore.imageOperations.transformations.flipHorizontal) {
      console.log('Preset - Applying horizontal flip operation')

      useFlipTool(imageStore, historyStore).applyFlipRender('horizontal')
    }
    if (imageStore.imageOperations.transformations.flipVertical) {
      console.log('Preset - Applying vertical flip operation')

      useFlipTool(imageStore, historyStore).applyFlipRender('vertical')
    }

    // SmartCrop operation
    if (imageStore.imageOperations.smartCrop?.enabled) {
      console.log('Preset - Applying smart crop operation')


      const cropBox = useSmartCropTool(imageStore, historyStore, editorStore, t).calculateIndents(
        imageStore.imageOperations.smartCrop.color,
      )

      console.log('Preset - Crop box calculated:', cropBox)

      await useSmartCropTool(imageStore, historyStore, editorStore, t).applyAutoSmartCropRender(
        cropBox,
      )
    }

    // GrayScale operation
    if (imageStore.imageOperations.grayScale?.enabled) {
      console.log('Preset - Applying grayscale operation')
      await useGrayscaleTool(imageStore, historyStore, t).applyGrayScaleRender()
    }
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
    newPresetSmartCropEnabled.value = imageStore.imageOperations.smartCrop.enabled
    newPresetSmartCropColor.value = imageStore.imageOperations.smartCrop.color
    newPresetGrayScale.value = imageStore.imageOperations.grayScale?.enabled || false
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
    newPresetGrayScale,
    newPresetSmartCropEnabled,
    newPresetSmartCropColor,
    newPresetFrame,
    presetIsModified,
    presetsOptions,
    localPresetName,
    originalPresetName,
    localImageOperations,
    selectedPresetName,
  }
}
