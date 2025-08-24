import { ref, computed, watch } from 'vue'
import { useToastModal } from '../modals/useToastModal'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useFlipTool } from './useFlipTool'
import { useRotateTool } from './useRotateTool'
import { useGrayscaleTool } from './useGrayscaleTool'
import { useCropTool } from './useCropTool'
import { editorConfig } from '@/config/editorConfig'
import { useResizeTool } from './useResizeTool'
import { useFrameTool } from './useFrameTool'
import { useSendEvent } from '../common/useSendEvent'

export function usePresetTool(
  imageStore,
  historyStore,
  editorStore,
  presetsStore,
  viewportStore,
  t,
) {
  const { showToastModal } = useToastModal()
  const { showConfirmModal } = useConfirmModal()

  // --------------------------
  // myPresets
  // --------------------------

  /**
   * Whether the preset is modified
   */
  const isPresetModified = ref(false)

  /**
   * Whether the preset is being modified
   */
  const isModifyingPreset = ref(false)

  /**
   * Whether the preset is currently being initialized
   */
  const initializing = ref(false)

  /**
   * The currently selected operation
   */
  const selectedOperation = ref(null)

  /**
   * Whether a new operation is being created
   */
  const creatingNewOperation = ref(false)

  /**
   * The new operation
   */
  const newOperation = ref(null)

  /**
   * Whether the selected operation should be cleared
   */
  const clearSelected = ref(false)

  /**
   * Currently available presets options for selection
   * @returns {Array} - Array of preset options with label and value
   */
  const presetsOptions = computed(() => {
    return presetsStore.allPresetNames.map((name) => ({
      label: name,
      value: name,
    }))
  })

  /**
   * The currently selected preset name
   */
  const selectedPresetName = computed({
    get: () => presetsStore.selectedPresetName,
    set: (name) => {
      presetsStore.selectPreset(name)
    },
  })

  /**
   * Local variables to hold preset data
   */
  const localPresetName = ref('')
  const tmpLocalPresetName = ref('')
  const localImageOperations = ref([])
  const tmpLocalImageOperations = ref([])
  const localImageFrame = ref({})
  const tmpLocalImageFrame = ref({})

  /**
   * Watch for changes in the selected preset and update local variables accordingly
   */
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

  /**
   * Watch for changes in local preset name, image operations, and image frame
   * and mark the preset as modified if any changes occur
   */
  watch(
    [() => localPresetName.value, () => localImageOperations.value, () => localImageFrame.value],
    () => {
      if (initializing.value) return
      isPresetModified.value = true
    },
    { deep: true },
  )

  /**
   * Update crop box in preset immediately when localImageOperations changes
   */
  watch(
    localImageOperations,
    (newOperations) => {
      const selectedPreset = presetsStore.selectedPreset
      if (!selectedPreset) return

      const cropOpIndex = newOperations.findIndex((op) => op.type === 'crop')
      if (cropOpIndex === -1) return

      const updatedCropBox = newOperations[cropOpIndex].cropBox

      const presetCropOp = selectedPreset.imageOperations.find((op) => op.type === 'crop')
      if (presetCropOp && updatedCropBox) {
        presetCropOp.cropBox = JSON.parse(JSON.stringify(updatedCropBox))
      }
    },
    { deep: true },
  )

  /**
   * Watch localImageFrame width - set height to width
   */
  watch(
    () => localImageFrame.value.width,
    (width) => {
      if (width !== undefined && width !== null) {
        localImageFrame.value.height = width
      }
    },
  )

  /**
   * Watch on selectedOperation, if it is not null set creatingNewOperation to false
   */
  watch(selectedOperation, (op) => {
    if (op) {
      creatingNewOperation.value = false
      clearSelected.value = false
    }
  })

  /**
   * Watch localImageFrame.type if it is different than frameSolid reset width
   */
  watch(
    () => localImageFrame.value.type,
    (type) => {
      isPresetModified.value = true
      if (!useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithOutline(type)) {
        localImageFrame.value.outlineEnabled = false
      }
    },
  )

  /**
   * Watch localImageFrame.outlineEnabled, if it is true set width to default value
   */
  watch(
    () => localImageFrame.value.outlineEnabled,
    (enabled) => {
      isPresetModified.value = true
      if (enabled) {
        localImageFrame.value.width = Math.floor(
          editorConfig.browserFrameDefaultSize *
            Math.max(imageStore.fileDimensions.width, imageStore.fileDimensions.height),
        )
      } else {
        localImageFrame.value.width = 0
      }
    },
  )

  /**
   * Watch localImageFrame.enabled, if it is true set default values for frame
   */
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
          localImageFrame.value.phoneHeaderTimeInMinutes = 610
          localImageFrame.value.phoneHeaderTextColor = '#000000'
          localImageFrame.value.phoneHeaderBackgroundColor = '#ffffff'
          localImageFrame.value.headerFooterMultiplier = 1
        }
      }
    },
  )

  /**
   * Modify the preset
   * Copy current preset data to temporary variables
   * to revert changes if needed
   */
  const modifyPreset = () => {
    isModifyingPreset.value = true
    isPresetModified.value = false

    tmpLocalImageFrame.value = JSON.parse(JSON.stringify(localImageFrame.value))
    tmpLocalPresetName.value = localPresetName.value
    tmpLocalImageOperations.value = JSON.parse(JSON.stringify(localImageOperations.value))

    useSendEvent().sendEvent('toolSettings', 'preset', 'modifyPreset', {})
  }

  /**
   * Save changes to the preset
   */
  const savePresetChanges = () => {
    const operations = JSON.parse(JSON.stringify(localImageOperations.value))

    const cropOperations = operations.filter((op) => op.type === 'crop')
    if (cropOperations.length > 1) {
      showToastModal(
        'error',
        t('tools.preset.settings.myPresets.presetContainsMultipleCropOperations.title'),
        t('tools.preset.settings.myPresets.presetContainsMultipleCropOperations.message'),
      )
      return
    }

    presetsStore.updatePreset(
      presetsStore.selectedPresetName,
      localPresetName.value,
      operations,
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

    editorStore.selectSubTool('')

    useSendEvent().sendEvent('toolSettings', 'preset', 'save', {})
  }

  /**
   * Close the modify preset dialog
   */
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

    editorStore.selectSubTool('')

    useSendEvent().sendEvent('toolSettings', 'preset', 'close', {})
  }

  /**
   * Delete the selected preset
   */
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

    useSendEvent().sendEvent('toolSettings', 'preset', 'delete', {})
  }

  /**
   * Create a new operation
   */
  const createNewOperation = () => {
    newOperation.value = { type: '' }
    creatingNewOperation.value = true
    selectedOperation.value = null
    clearSelected.value = true
  }

  /**
   * Add the new operation to the local image operations
   */
  const addNewOperation = () => {
    creatingNewOperation.value = false
    if (!newOperation.value) return

    localImageOperations.value.push(JSON.parse(JSON.stringify(newOperation.value)))
  }

  /**
   * Apply the selected preset
   *
   * Apply only if current image operations and frame are different from preset
   * If there are SVG objects, rasterize them first
   * If the preset contains crop operation, check if it is valid
   * Replace or add operations based on user confirmation
   */
  const applyPreset = async () => {
    if (imageStore.svgObjects.length > 0) {
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
      areFramesEqual = false
    } else {
      // UPDATE new frame type
      areFramesEqual =
        currentImageFrame.color === presetFrame.color &&
        currentImageFrame.width === presetFrame.width &&
        currentImageFrame.outlineEnabled === presetFrame.outlineEnabled &&
        currentImageFrame.phoneHeaderEnabled === presetFrame.phoneHeaderEnabled &&
        currentImageFrame.phoneHeaderTimeInMinutes === presetFrame.phoneHeaderTimeInMinutes &&
        currentImageFrame.phoneHeaderTextColor === presetFrame.phoneHeaderTextColor &&
        currentImageFrame.phoneHeaderBackgroundColor === presetFrame.phoneHeaderBackgroundColor &&
        currentImageFrame.headerFooterMultiplier === presetFrame.headerFooterMultiplier
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

    // Replace or add operations
    let replace = false
    const confirmed = await showConfirmModal(
      t('tools.preset.settings.myPresets.addPresetOperationsOrReplace.title'),
      t('tools.preset.settings.myPresets.addPresetOperationsOrReplace.message'),
      t('tools.preset.settings.myPresets.addPresetOperationsOrReplace.cancel'),
      t('tools.preset.settings.myPresets.addPresetOperationsOrReplace.confirm'),
    )
    if (confirmed) {
      replace = true
    }

    // Check if operations contain crop operation
    const cropOperation = presetOperations.filter((op) => op.type === 'crop')
    if (cropOperation.length > 0) {
      if (
        cropOperation[0].cropBox.x < 0 ||
        cropOperation[0].cropBox.y < 0 ||
        cropOperation[0].cropBox.width <= 0 ||
        cropOperation[0].cropBox.height <= 0 ||
        cropOperation[0].cropBox.x + cropOperation[0].cropBox.width >
          imageStore.fileDimensions.width ||
        cropOperation[0].cropBox.y + cropOperation[0].cropBox.height >
          imageStore.fileDimensions.height
      ) {
        showToastModal(
          'error',
          t('tools.crop.settings.general.invalidCropBox.title'),
          t('tools.crop.settings.general.invalidCropBox.message'),
        )
        return
      }
    }

    if (replace) {
      imageStore.resetRenderedImageToOriginal()
    }

    if (preset.imageOperations.length !== 0) {
      preset.imageOperations.forEach(async (operation) => {
        if (operation.type === 'rotation') {
          await useRotateTool(imageStore, historyStore, t).applyRotationRender(operation.angle)
        } else if (operation.type === 'flip') {
          await useFlipTool(imageStore, historyStore, t).applyFlipRender(operation.direction)
        } else if (operation.type === 'autoCrop') {
          await useCropTool(imageStore, viewportStore, editorStore, historyStore, t).applyAutoCropPreset(
            operation.color,
          )
        } else if (operation.type === 'grayscale') {
          await useGrayscaleTool(imageStore, historyStore).applyGrayscaleRender()
        } else if (operation.type === 'crop') {
          await useCropTool(imageStore, viewportStore, editorStore, historyStore, t).applyCropRender(
            operation.cropBox,
          )
        } else if (operation.type === 'resize') {
          await useResizeTool(imageStore, historyStore, viewportStore, t).applyResizeRender(
            operation.resizeDimensions.width,
            operation.resizeDimensions.height,
          )
        }

        // UPDATE new tool
      })
    }

    // Apply frame
    if (!replace) {
      if (presetFrame.enabled) {
        imageStore.frame = JSON.parse(JSON.stringify(preset.imageFrame))
      }
    } else {
      imageStore.frame = JSON.parse(JSON.stringify(preset.imageFrame))
    }

    // Save current operations to imageStore
    imageStore.imageOperations = JSON.parse(JSON.stringify(preset.imageOperations))

    useSendEvent().sendEvent('toolSettings', 'preset', 'apply', {})

    historyStore.push(imageStore.getSnapshot(t))
  }

  // --------------------------
  // newPreset
  // --------------------------

  /**
   * Reference to the frame width input element
   */
  const frameWidthRef = ref(null)

  /**
   * Reference to the preset name input element
   */
  const presetNameRef = ref(null)

  /**
   * Whether the manual preset setting dialog is shown
   */
  const isShowManualPresetSetting = ref(false)

  /**
   * New preset object to be created
   */
  const newPreset = ref({
    presetName: '',
    transformations: {
      rotationAngle: 0,
      horizontalFlip: false,
      verticalFlip: false,
    },
    autoCrop: {
      enabled: false,
      color: '#000000',
    },
    grayscale: {
      enabled: false,
    },
    frame: {
      enabled: false,
      type: 'frameSolid',
      width: 0,
      height: 0,
      color: '#000000',
      headerSize: 0,
      footerSize: 0,
      outlineEnabled: false,
      phoneHeaderEnabled: true,
      phoneHeaderTimeInMinutes: 610,
      phoneHeaderTextColor: '#000000',
      phoneHeaderBackgroundColor: '#ffffff',
      headerFooterMultiplier: 1,
    },
    cropBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    resizeDimensions: {
      width: 0,
      height: 0,
    },

    // UPDATE new tool
  })

  /**
   * Max crop box position based on editor config
   */
  const maxCropBoxPositionX = computed(() => editorConfig.maxFileDimensionWidth)
  const maxCropBoxPositionY = computed(() => editorConfig.maxFileDimensionHeight)

  /**
   * Max crop box width and height based on editor config and current crop box position
   */
  const maxCropBoxWidth = computed(() => {
    return Math.max(0, editorConfig.maxFileDimensionWidth - newPreset.value.cropBox.x)
  })
  const maxCropBoxHeight = computed(() => {
    return Math.max(0, editorConfig.maxFileDimensionHeight - newPreset.value.cropBox.y)
  })

  /**
   * Rotation options for the preset
   */
  const presetRotationOptions = [
    { label: '-180°', value: -180 },
    { label: '-90°', value: -90 },
    { label: '0°', value: 0 },
    { label: '90°', value: 90 },
    { label: '180°', value: 180 },
  ]

  /**
   * Available frame options for the preset
   */
  const presetFrameOptions = computed(() => [
    // UPDATE new frame type
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
      label: t('tools.frame.settings.general.frameVariants.framePhoneIOS2'),
      value: 'framePhoneIOS2',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.framePhoneAndroid'),
      value: 'framePhoneAndroid',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.framePhoneAndroid2'),
      value: 'framePhoneAndroid2',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.framePhoneSimple'),
      value: 'framePhoneSimple',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.frameWindowsTaskBar'),
      value: 'frameWindowsTaskBar',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.frameVSCode'),
      value: 'frameVSCode',
    },
  ])

  /**
   * Watch new preset frame type and if it is solid set outlineEnabled to false
   */
  watch(
    () => newPreset.value.frame.type,
    (type) => {
      if (!useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithOutline(type)) {
        newPreset.value.frame.outlineEnabled = false
      }
    },
  )

  /**
   * Show the manual preset setting dialog
   */
  const showManualPresetSetting = () => {
    isShowManualPresetSetting.value = true
  }

  /**
   * Reset the new preset to default values
   * This is called when creating a new preset or after saving a preset
   */
  const resetPreset = () => {
    newPreset.value = {
      presetName: '',
      transformations: {
        rotationAngle: 0,
        horizontalFlip: false,
        verticalFlip: false,
      },
      autoCrop: {
        enabled: false,
        color: '#000000',
      },
      grayscale: {
        enabled: false,
      },
      frame: {
        enabled: false,
        type: 'frameSolid',
        width: 0,
        height: 0,
        color: '#000000',
        headerSize: 0,
        footerSize: 0,
        outlineEnabled: false,
        phoneHeaderEnabled: true,
        phoneHeaderTimeInMinutes: 610,
        phoneHeaderTextColor: '#000000',
        phoneHeaderBackgroundColor: '#ffffff',
        headerFooterMultiplier: 1,
      },
      cropBox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      resizeDimensions: {
        width: 0,
        height: 0,
      },
      // UPDATE new tool
    }

    isShowManualPresetSetting.value = false
  }

  /**
   * Create a new preset based on the current settings
   */
  const createPreset = () => {
    const imageOperations = []
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
    if (newPreset.value.autoCrop.enabled) {
      imageOperations.push({
        type: 'autoCrop',
        color: newPreset.value.autoCrop.color,
      })
    }
    if (newPreset.value.grayscale.enabled) {
      imageOperations.push({ type: 'grayscale', enabled: true })
    }

    if (newPreset.value.cropBox.width > 0 && newPreset.value.cropBox.height > 0) {
      imageOperations.push({
        type: 'crop',
        cropBox: {
          x: newPreset.value.cropBox.x || 0,
          y: newPreset.value.cropBox.y || 0,
          width: newPreset.value.cropBox.width || 0,
          height: newPreset.value.cropBox.height || 0,
        },
      })
    }

    if (newPreset.value.resizeDimensions.width > 0 && newPreset.value.resizeDimensions.height > 0) {
      imageOperations.push({
        type: 'resize',
        resizeDimensions: {
          width: newPreset.value.resizeDimensions.width || 0,
          height: newPreset.value.resizeDimensions.height || 0,
        },
      })
    }

    if (newPreset.value.frame.type !== 'none') {
      imageFrame.enabled = newPreset.value.frame.enabled
      imageFrame.type = newPreset.value.frame.type
      imageFrame.color = newPreset.value.frame.color
      imageFrame.width = newPreset.value.frame.width
      imageFrame.height = newPreset.value.frame.width
      imageFrame.outlineEnabled = newPreset.value.frame.outlineEnabled
      imageFrame.phoneHeaderEnabled = newPreset.value.frame.phoneHeaderEnabled
      imageFrame.phoneHeaderTimeInMinutes = newPreset.value.frame.phoneHeaderTimeInMinutes
      imageFrame.phoneHeaderTextColor = newPreset.value.frame.phoneHeaderTextColor
      imageFrame.phoneHeaderBackgroundColor = newPreset.value.frame.phoneHeaderBackgroundColor
      imageFrame.headerFooterMultiplier = newPreset.value.frame.headerFooterMultiplier
    }
    // UPDATE new tool

    presetsStore.createPreset(
      JSON.parse(JSON.stringify(newPreset.value.presetName)),
      JSON.parse(JSON.stringify(imageOperations)),
      JSON.parse(JSON.stringify(imageFrame)),
    )

    resetPreset()

    showToastModal(
      'success',
      t('tools.preset.settings.createPreset.presetSuccessfullyCreated.title'),
      t('tools.preset.settings.createPreset.presetSuccessfullyCreated.message'),
    )

    useSendEvent().sendEvent('toolSettings', 'preset', 'create', {})
  }

  /**
   * Reset the frame width based on the current preset and image dimensions
   */
  const resetFrameWidth = () => {
    if (
      useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithOutline(
        newPreset.value.frame.type,
      ) ||
      useFrameTool(imageStore, historyStore, editorStore, t).isFrameWithOutline(
        localImageFrame.value.type,
      )
    ) {
      newPreset.value.frame.width = Math.floor(
        editorConfig.browserFrameDefaultSize *
          Math.max(imageStore.fileDimensions.width, imageStore.fileDimensions.height),
      )
    } else {
      newPreset.value.frame.width = 0
    }
    frameWidthRef.value.setValue(newPreset.value.frame.width)
  }

  /**
   * Use current modifications to create a preset
   */
  const useCurrentModifications = () => {
    const imageOperations = imageStore.getImageOperations()
    const cropOperations = imageOperations.filter((op) => op.type === 'crop')

    if (cropOperations.length > 1) {
      showToastModal(
        'error',
        t('tools.preset.settings.createPreset.presetContainsMultipleCropOperations.title'),
        t('tools.preset.settings.createPreset.presetContainsMultipleCropOperations.message'),
      )

      resetPreset()

      return
    }

    const result = presetsStore.createPreset(
      structuredClone(newPreset.value.presetName),
      structuredClone(imageOperations),
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

    // Add delay 2 seconds before showing another toast
    setTimeout(() => {
      // Check if preset operations contain crop operation
      if (cropOperations.length === 1) {
        showToastModal(
          'warning',
          t('tools.preset.settings.createPreset.presetContainsCropOperation.title'),
          t('tools.preset.settings.createPreset.presetContainsCropOperation.message'),
        )
      }
    }, 2000)

    useSendEvent().sendEvent('toolSettings', 'preset', 'useCurrentModifications', {})
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
    clearSelected,
    maxCropBoxPositionX,
    maxCropBoxPositionY,
    maxCropBoxWidth,
    maxCropBoxHeight,
  }
}
