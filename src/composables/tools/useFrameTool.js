import { ref, watch, computed, nextTick } from 'vue'
// import { useToastModal } from '../modals/useToastModal'
import { editorConfig } from '@/config/editorConfig'
import { useConfirmModal } from '../modals/useConfirmModal'
import { useApi } from '@/composables/common/useApi'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()
const { addUserEvent } = useApi()
import { useImagePipeline } from '../editor/useImagePipeline'
import { useUiStore } from '@/stores/uiStore'
import { useEditorStore } from '@/stores/editorStore'

/**
 * Whether phone side buttons can be drawn because of dimensions
 */
const phoneButtonsCanBeDrawn = ref(true)

/**
 * Header size px
 */
const headerSize = ref(0)

/**
 * Header size mm
 */
const headerSizeMm = ref(0)

/**
 * User set header size mm if using millimeters
 */
const userSetHeaderSizeMm = ref(0)

/**
 * Minimum user set header size mm
 */
const minUserSetHeaderSizeMm = ref(5)

/**
 * Maximum user set header size mm
 */
const maxUserSetHeaderSizeMm = ref(25)

/**
 * Footer size px
 */
const footerSize = ref(0)

/**
 * Footer size mm
 */
const footerSizeMm = ref(0)

export function useFrameTool(imageStore, historyStore, viewportStore, t) {
  // const { showToastModal } = useToastModal()
  const { showConfirmModal } = useConfirmModal()
  const uiStore = useUiStore()
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Whether to use millimeters for frame width input
   */
  const useMillimeters = ref(imageStore.frame.useMillimeters)

  /**
   * Maximum frame width in millimeters
   */
  const maxFrameWidthMm = ref(100)

  /**
   * Maximum header/footer size in millimeters
   */
  const maxHeaderFooterSize = ref(100)

  /**
   * Frame color
   */
  const frameColor = ref(imageStore.frame.color)
  watch(
    () => imageStore.frame.color,
    (newColor) => {
      frameColor.value = newColor
    },
  )

  /**
   * Phone header text color
   */
  const phoneHeaderTextColor = ref(imageStore.frame.phoneHeaderTextColor)

  /**
   * Phone header background color
   */
  const phoneHeaderBackgroundColor = ref(imageStore.frame.phoneHeaderBackgroundColor)

  /**
   * Phone header time in minutes
   */
  const phoneHeaderTimeInMinutes = ref(imageStore.frame.phoneHeaderTimeInMinutes)

  /**
   * Save frame config to editor store
   */
  const saveConfigToEditorStore = () => {
    const editorStore = useEditorStore()
    editorStore.toolsConfig.frame = imageStore.frame
  }

  /**
   * Load frame config from editor store
   */
  const loadConfigFromEditorStore = () => {
    const editorStore = useEditorStore()
    imageStore.frame = editorStore.toolsConfig.frame
  }

  /**
   * Frame width
   */
  const frameWidth = ref(imageStore.frame.width || 0)
  watch(
    () => imageStore.frame.width,
    (newWidth) => {
      frameWidth.value = newWidth
    },
  )

  /**
   * Frame width mm
   */
  const frameWidthMm = ref(imageStore.frame.widthMm)
  watch(
    () => imageStore.frame.widthMm,
    (newWidth) => {
      frameWidthMm.value = newWidth
    },
  )

  /**
   * Header size px
   */
  watch(
    () => imageStore.frame.headerSize,
    (newSize) => {
      headerSize.value = newSize
    },
  )

  /**
   * Header size mm
   */
  watch(
    () => imageStore.frame.headerSizeMm,
    (newSize) => {
      headerSizeMm.value = newSize
      userSetHeaderSizeMm.value = newSize
    },
  )

  /**
   * Footer size px
   */
  watch(
    () => imageStore.frame.footerSize,
    (newSize) => {
      footerSize.value = newSize
    },
  )

  /**
   * Footer size mm
   */
  watch(
    () => imageStore.frame.footerSizeMm,
    (newSize) => {
      footerSizeMm.value = newSize
    },
  )

  /**
   * Header overlap
   */
  const headerOverlap = computed({
    get: () => imageStore.frame.phoneHeaderExpand,
    set: (value) => {
      imageStore.frame.phoneHeaderExpand = value
    },
  })

  /**
   * Phone navigation visibility
   */
  const drawPhoneNavigation = computed({
    get: () => imageStore.frame.phoneNavigationEnabled,
    set: (value) => {
      imageStore.frame.phoneNavigationEnabled = value
    },
  })

  /**
   * Phone buttons visibility
   */
  const drawPhoneButtons = computed({
    get: () => imageStore.frame.phoneButtonsEnabled,
    set: (value) => {
      imageStore.frame.phoneButtonsEnabled = value
    },
  })

  /**
   * Outline visibility
   */
  const drawOutline = computed({
    get: () => imageStore.frame.outlineEnabled,
    set: (value) => {
      frameWidth.value = calculateInitialFrameWidth()
      imageStore.frame.outlineEnabled = value
    },
  })

  /**
   * Phone outline visibility
   */
  const drawPhoneOutline = computed({
    get: () => imageStore.frame.phoneOutlineEnabled,
    set: (value) => {
      imageStore.frame.phoneOutlineEnabled = value
    },
  })

  /**
   * Phone outline color
   */
  const phoneOutlineColor = computed({
    get: () => imageStore.frame.phoneOutlineColor,
    set: (value) => {
      imageStore.frame.phoneOutlineColor = value
    },
  })

  /**
   * Phone outline size
   */
  const phoneOutlineSize = computed({
    get: () => imageStore.frame.phoneOutlineSize,
    set: (value) => {
      imageStore.frame.phoneOutlineSize = value
    },
  })

  /**
   * Phone header icons size
   */
  const phoneHeaderIconsSize = computed({
    get: () => imageStore.frame.phoneHeaderIconsSize,
    set: (value) => {
      imageStore.frame.phoneHeaderIconsSize = value
    },
  })

  /**
   * Phone battery icon style
   */
  const phoneBatteryIconStyle = computed({
    get: () => imageStore.frame.phoneBatteryIconStyle || 'style3',
    set: (value) => {
      imageStore.frame.phoneBatteryIconStyle = value
    },
  })

  /**
   * Phone frame orientation
   */
  const phoneFrameOrientation = computed({
    get: () => imageStore.frame.phoneFrameOrientation,
    set: (value) => {
      imageStore.frame.phoneFrameOrientation = value
    },
  })

  /**
   * Phone header visibility
   */
  const drawPhoneHeader = computed({
    get: () => imageStore.frame.phoneHeaderEnabled,
    set: (value) => {
      imageStore.frame.phoneHeaderEnabled = value

      // If header is disabled, also disable expanded header
      if (!value) {
        imageStore.frame.phoneHeaderExpand = false
      }
    },
  })

  /**
   * Ref for frame width input
   */
  const frameWidthRef = ref(null)

  /**
   * Selected frame variant
   */
  const selectedFrameVariant = computed({
    get: () => imageStore.frame.type,
    set: () => {
      return
    },
  })

  /**
   * Available frame options
   */
  const frameOptions = computed(() => [
    // UPDATE new frame type
    { label: t('tools.frame.settings.general.frameVariants.none'), value: 'none' },
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
   * Phone outline size options
   */
  const phoneOutlineSizeOptions = computed(() => [
    { label: t('tools.frame.settings.general.phoneOutlineSize.options.small'), value: 'small' },
    { label: t('tools.frame.settings.general.phoneOutlineSize.options.medium'), value: 'medium' },
    { label: t('tools.frame.settings.general.phoneOutlineSize.options.large'), value: 'large' },
  ])

  /**
   * Phone header icons size options
   */
  const phoneHeaderIconsSizeOptions = computed(() => [
    { label: t('tools.frame.settings.general.phoneHeaderIconsSize.options.small'), value: 'small' },
    {
      label: t('tools.frame.settings.general.phoneHeaderIconsSize.options.medium'),
      value: 'medium',
    },
    { label: t('tools.frame.settings.general.phoneHeaderIconsSize.options.large'), value: 'large' },
  ])

  /**
   * Phone battery icon style options
   */
  const phoneBatteryIconStyleOptions = computed(() => [
    {
      label: t('tools.frame.settings.general.phoneBatteryIconStyle.options.style1'),
      value: 'style1',
    },
    {
      label: t('tools.frame.settings.general.phoneBatteryIconStyle.options.style2'),
      value: 'style2',
    },
    {
      label: t('tools.frame.settings.general.phoneBatteryIconStyle.options.style3'),
      value: 'style3',
    },
  ])

  /**
   * Phone frame orientation options
   */
  const phoneFrameOrientationOptions = computed(() => [
    {
      label: t('tools.frame.settings.general.phoneFrameOrientation.options.portrait'),
      value: 'portrait',
    },
    {
      label: t('tools.frame.settings.general.phoneFrameOrientation.options.landscape'),
      value: 'landscape',
    },
  ])

  /**
   * Whether to show options only in portrait mode
   */
  const showOnlyInPortraitMode = computed(() => {
    return phoneFrameOrientation.value === 'portrait'
  })

  // ------------------------
  // Check frame type
  // ------------------------

  /**
   * Whether the frame is frame with header
   * @param {string} frameType - Frame type
   */
  const isFrameWithHeader = (frameType) => {
    return (
      frameType === 'frameMacBrowser' ||
      frameType === 'frameWindowsBrowser' ||
      frameType === 'frameVSCode' ||
      ((frameType === 'framePhoneIOS' ||
        frameType === 'framePhoneIOS2' ||
        frameType === 'framePhoneAndroid' ||
        frameType === 'framePhoneAndroid2' ||
        frameType === 'framePhoneSimple') &&
        imageStore.frame.phoneHeaderEnabled)
    )
  }

  /**
   * Whether the frame is frame with footer
   * @param {string} frameType - Frame type
   */
  const isFrameWithFooter = (frameType) => {
    return frameType === 'frameWindowsTaskBar'
  }

  /**
   * Whether the frame is phone frame
   * @param {string} frameType - Frame type
   */
  const isPhoneFrame = (frameType) => {
    return (
      frameType === 'framePhoneIOS' ||
      frameType === 'framePhoneIOS2' ||
      frameType === 'framePhoneAndroid' ||
      frameType === 'framePhoneAndroid2' ||
      frameType === 'framePhoneSimple'
    )
  }

  /**
   * Whether the frame is phone frame in landscape orientation
   */
  const isLandscapePhone = (frameType, orientation) => {
    return isPhoneFrame(frameType) && orientation === 'landscape'
  }

  /**
   * Whether the frame is phone frame with expanded header
   */
  const isPhoneHeaderWithExpandedHeader = (frameType, isExpanded) => {
    return isPhoneFrame(frameType) && isExpanded
  }

  /**
   * Whether the frame is frame with outline
   * @param {string} frameType - Frame type
   */
  const isFrameWithOutline = (frameType) => {
    return (
      frameType === 'frameMacBrowser' ||
      frameType === 'frameWindowsBrowser' ||
      frameType === 'frameWindowsTaskBar' ||
      frameType === 'frameVSCode'
    )
  }

  /**
   * Whether the frame is frame with multiplier
   * @param {string} frameType - Frame type
   */
  const isFrameWithMultiplier = (frameType) => {
    return (
      frameType === 'frameMacBrowser' ||
      frameType === 'frameWindowsBrowser' ||
      frameType === 'frameWindowsTaskBar' ||
      frameType === 'frameVSCode'
    )
  }

  // ------------------------

  /**
   * Handle frame variant change
   * @param {string} value - Selected frame variant
   */
  const handleFrameChange = async (value) => {
    if (isPhoneFrame(value) && imageStore.fileType === 'pdf') {
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

    loadConfigFromEditorStore()

    imageStore.frame.type = value
    nextTick(async () => {
      frameWidth.value = calculateInitialFrameWidth()

      if (isFrameWithHeader(value) || isFrameWithFooter(value)) {
        const PxPerMm = viewportStore.getPxPerMmFitZoom

        headerSize.value = calculateInitialHeaderFooterSize()
        headerSizeMm.value = Math.max(headerSize.value / PxPerMm, 1)

        footerSize.value = calculateInitialHeaderFooterSize()
        footerSizeMm.value = Math.max(footerSize.value / PxPerMm, 1)
      }

      await nextTick()

      applyFrame()
    })
  }

  /**
   * Set user set header size mm
   * @param {number} size - New header size in mm
   */
  const setUserSetHeaderSizeMm = (size) => {
    userSetHeaderSizeMm.value = size
    applyFrame()
  }

  /**
   * Reset user set header size mm to default value
   */
  const resetUserSetHeaderSizeMm = () => {
    const PxPerMm = viewportStore.getPxPerMmFitZoom
    userSetHeaderSizeMm.value =
      Math.max(Math.floor(0.1 * imageStore.fileDimensions.width), 5) / PxPerMm
    applyFrame()
  }

  /**
   * Set whether to use millimeters for frame width input
   * @param {boolean} value - Whether to use millimeters
   */
  const setUseMillimeters = (value) => {
    useMillimeters.value = value

    const PxPerMm = viewportStore.getPxPerMmFitZoom
    if (value) {
      // Frame
      frameWidthMm.value = Math.min(Math.max(frameWidth.value / PxPerMm, 1), maxFrameWidthMm.value)
      maxFrameWidthMm.value = (imageStore.getSmallerImageDimension() * 0.2) / PxPerMm

      // Header and footer
      if (isFrameWithMultiplier(selectedFrameVariant.value)) {
        headerSizeMm.value = Math.max(headerSize.value / PxPerMm, 1)
        footerSizeMm.value = Math.max(footerSize.value / PxPerMm, 1)
        maxHeaderFooterSize.value = (imageStore.getSmallerImageDimension() * 0.5) / PxPerMm
      }

      const isLandscapePhoneValue = isLandscapePhone(
        imageStore.frame.type,
        imageStore.frame.phoneFrameOrientation,
      )

      const imageSize = isLandscapePhoneValue
        ? imageStore.fileDimensions.height
        : imageStore.fileDimensions.width

      // Set default user set header size mm
      userSetHeaderSizeMm.value = Math.max(Math.floor(0.1 * imageSize), 5) / PxPerMm
    } else {
      frameWidth.value = frameWidthMm.value * PxPerMm

      if (isFrameWithMultiplier(selectedFrameVariant.value)) {
        headerSize.value = headerSizeMm.value * PxPerMm
        footerSize.value = footerSizeMm.value * PxPerMm

        maxHeaderFooterSize.value = imageStore.getSmallerImageDimension() * 0.5
      }
    }
    applyFrame()
  }

  /**
   * Set header overlap
   * @param {boolean} value - Whether header overlaps image
   */
  const setHeaderOverlap = (value) => {
    headerOverlap.value = value
    applyFrame()
  }

  /**
   * Set phone navigation visibility
   * @param {boolean} value - Whether to show phone navigation
   */
  const setPhoneNavigation = (value) => {
    drawPhoneNavigation.value = value
    applyFrame()
  }

  /**
   * Set phone buttons visibility
   * @param {boolean} value - Whether to show phone buttons
   */
  const setPhoneButtons = (value) => {
    drawPhoneButtons.value = value
    applyFrame()
  }

  /**
   * Watch phone buttons can be drawn and enable if possible
   */
  watch(phoneButtonsCanBeDrawn, (newValue) => {
    if (newValue) {
      setPhoneButtons(true)
    }
  })

  /**
   * Set frame color
   * @param {string} color - New frame color
   * @param {boolean} commit - When true, push to history store
   */
  const setFrameColor = (color, commit = true) => {
    frameColor.value = color
    applyFrame(commit)
  }

  /**
   * Set phone header text color
   * @param {string} color - New phone header text color
   */
  const setPhoneHeaderTextColor = (color, commit = true) => {
    phoneHeaderTextColor.value = color
    applyFrame(commit)
  }

  /**
   * Set phone header background color
   * @param {string} color - New phone header background color
   */
  const setPhoneHeaderBackgroundColor = (color, commit = true) => {
    phoneHeaderBackgroundColor.value = color
    applyFrame(commit)
  }

  /**
   * Set phone header time
   * @param {string} time - New phone header time
   */
  const setPhoneHeaderTimeInMinutes = (time) => {
    phoneHeaderTimeInMinutes.value = time
    applyFrame()
  }

  /**
   * Set frame outline visibility
   * @param {boolean} value - Whether to show outline
   */
  const setFrameOutline = (value) => {
    drawOutline.value = value
    applyFrame()
  }

  /**
   * Set phone outline visibility
   * @param {boolean} value - Whether to show phone outline
   */
  const setPhoneOutline = (value) => {
    drawPhoneOutline.value = value
    applyFrame()
  }

  /**
   * Set phone outline color
   * @param {string} color - New phone outline color
   */
  const setPhoneOutlineColor = (color) => {
    phoneOutlineColor.value = color
    applyFrame()
  }

  /**
   * Set phone outline size
   * @param {string} size - New phone outline size (small, medium, large)
   */
  const setPhoneOutlineSize = (size) => {
    phoneOutlineSize.value = size
    applyFrame()
  }

  /**
   * Set phone header icons size
   * @param {string} size - New phone header icons size (small, medium, large)
   */
  const setPhoneHeaderIconsSize = (size) => {
    phoneHeaderIconsSize.value = size
    applyFrame()
  }

  /**
   * Set phone battery icon style
   * @param {string} style - New phone battery icon style (style1, style2, style3)
   */
  const setPhoneBatteryIconStyle = (style) => {
    phoneBatteryIconStyle.value = style
    applyFrame()
  }

  /**
   * Set phone frame orientation
   * @param {string} orientation - New phone frame orientation (portrait, landscape)
   */
  const setPhoneFrameOrientation = (orientation) => {
    phoneFrameOrientation.value = orientation
    applyFrame()
  }

  /**
   * Set phone header visibility
   * @param {boolean} value - Whether to show phone header
   */
  const setPhoneHeader = (value) => {
    drawPhoneHeader.value = value
    applyFrame()
  }

  /**
   * Calculate initial frame width based on selected frame type and image dimensions
   */
  const calculateInitialFrameWidth = () => {
    let width
    if (
      // UPDATE new frame type
      (selectedFrameVariant.value === 'frameMacBrowser' ||
        selectedFrameVariant.value === 'frameWindowsBrowser' ||
        selectedFrameVariant.value === 'frameWindowsTaskBar' ||
        selectedFrameVariant.value === 'frameVSCode') &&
      drawOutline.value
    ) {
      width = Math.floor(
        editorConfig.browserFrameDefaultSize *
          Math.max(imageStore.fileDimensions.width, imageStore.fileDimensions.height),
      )
    } else if (selectedFrameVariant.value === 'frameSolid') {
      width = 1
    } else if (
      selectedFrameVariant.value === 'framePhoneAndroid' ||
      selectedFrameVariant.value === 'framePhoneAndroid2' ||
      selectedFrameVariant.value === 'framePhoneIOS' ||
      selectedFrameVariant.value === 'framePhoneIOS2' ||
      selectedFrameVariant.value === 'framePhoneSimple'
    ) {
      // Width is based on image width
      width =
        Math.max(
          Math.floor(editorConfig.phoneFrameDefaultSize * imageStore.fileDimensions.width),
          2,
        ) *
        1.5 *
        2
    } else {
      width = 0
    }
    return width
  }

  /**
   * Calculate initial header/footer size based on image dimensions (not for phone frames)
   */
  const calculateInitialHeaderFooterSize = () => {
    const isLandscapePhoneValue = isLandscapePhone(
      imageStore.frame.type,
      imageStore.frame.phoneFrameOrientation,
    )

    const imageSize = isLandscapePhoneValue
      ? imageStore.fileDimensions.width
      : imageStore.fileDimensions.height

    return Math.max(Math.floor(editorConfig.frameHeaderFooterSize * imageSize), 5)
  }

  /**
   * Set frame width
   * @param {number} width - New frame width
   */
  const setFrameWidth = (width) => {
    if (width < 0) {
      frameWidth.value = calculateInitialFrameWidth()
    }
    applyFrame()
  }

  /**
   * Set frame width mm
   * @param {number} width - New frame width mm
   */
  const setFrameWidthMm = (width) => {
    if (width < 0) {
      const PxPerMm = viewportStore.getPxPerMmFitZoom

      frameWidth.value = calculateInitialFrameWidth()
      frameWidthMm.value = Math.max(frameWidth.value / PxPerMm, 1)
    }

    applyFrame()
  }

  /**
   * Set header size
   */
  const setHeaderSize = (size) => {
    if (size < 0) {
      headerSize.value = calculateInitialHeaderFooterSize()
    }
    applyFrame()
  }

  /**
   * Set header size mm
   */
  const setHeaderSizeMm = (size) => {
    if (size < 0) {
      const PxPerMm = viewportStore.getPxPerMmFitZoom

      headerSize.value = calculateInitialHeaderFooterSize()
      headerSizeMm.value = Math.max(headerSize.value / PxPerMm, 1)
    }

    const PxPerMm = viewportStore.getPxPerMmFitZoom
    headerSize.value = headerSizeMm.value * PxPerMm

    applyFrame()
  }

  /**
   * Set footer size
   */
  const setFooterSize = (size) => {
    if (size < 0) {
      footerSize.value = calculateInitialHeaderFooterSize()
    }
    applyFrame()
  }

  /**
   * Set footer size mm
   */
  const setFooterSizeMm = (size) => {
    if (size < 0) {
      const PxPerMm = viewportStore.getPxPerMmFitZoom
      footerSize.value = calculateInitialHeaderFooterSize()
      footerSizeMm.value = Math.max(footerSize.value / PxPerMm, 1)
    }

    const PxPerMm = viewportStore.getPxPerMmFitZoom
    footerSize.value = footerSizeMm.value * PxPerMm

    applyFrame()
  }

  /**
   * Apply the selected frame settings to the image
   * @param {boolean} commit - When true, push to history store
   */
  const applyFrame = (commit = true) => {
    uiStore.isApplyingFrame = true
    // Deep copy to avoid reference issues
    const width = JSON.parse(JSON.stringify(frameWidth.value))
    const widthMm = JSON.parse(JSON.stringify(frameWidthMm.value))
    imageStore.frame.widthMm = widthMm
    imageStore.frame.heightMm = widthMm

    imageStore.frame.color = JSON.parse(JSON.stringify(frameColor.value))
    imageStore.frame.type = JSON.parse(JSON.stringify(selectedFrameVariant.value))
    imageStore.frame.enabled = true
    imageStore.frame.useMillimeters = JSON.parse(JSON.stringify(useMillimeters.value))
    imageStore.frame.outlineEnabled = JSON.parse(JSON.stringify(drawOutline.value))
    imageStore.frame.phoneOutlineEnabled = JSON.parse(JSON.stringify(drawPhoneOutline.value))
    imageStore.frame.phoneOutlineColor = JSON.parse(JSON.stringify(phoneOutlineColor.value))
    imageStore.frame.phoneOutlineSize = JSON.parse(JSON.stringify(phoneOutlineSize.value))
    imageStore.frame.phoneHeaderIconsSize = JSON.parse(JSON.stringify(phoneHeaderIconsSize.value))
    imageStore.frame.phoneBatteryIconStyle = JSON.parse(JSON.stringify(phoneBatteryIconStyle.value))
    imageStore.frame.phoneFrameOrientation = JSON.parse(JSON.stringify(phoneFrameOrientation.value))
    imageStore.frame.phoneHeaderEnabled = JSON.parse(JSON.stringify(drawPhoneHeader.value))
    imageStore.frame.phoneHeaderExpand = JSON.parse(JSON.stringify(headerOverlap.value))
    imageStore.frame.phoneButtonsEnabled = JSON.parse(JSON.stringify(drawPhoneButtons.value))
    imageStore.frame.phoneNavigationEnabled = JSON.parse(JSON.stringify(drawPhoneNavigation.value))
    imageStore.frame.phoneHeaderTextColor = JSON.parse(JSON.stringify(phoneHeaderTextColor.value))
    imageStore.frame.phoneHeaderBackgroundColor = JSON.parse(
      JSON.stringify(phoneHeaderBackgroundColor.value),
    )
    imageStore.frame.phoneHeaderTimeInMinutes = JSON.parse(
      JSON.stringify(phoneHeaderTimeInMinutes.value),
    )

    imageStore.frame.modificationFlag += 1

    if (selectedFrameVariant.value === 'none') {
      imageStore.frame.enabled = false
      imageStore.frame.width = 0
      imageStore.frame.height = 0

      imageStore.frame.widthMm = 0
      imageStore.frame.heightMm = 0
    } else if (selectedFrameVariant.value === 'frameSolid') {
      imageStore.frame.width = width
      imageStore.frame.height = width

      if (width <= 0) {
        imageStore.frame.enabled = false
      }
    } else {
      imageStore.frame.width = width
      imageStore.frame.height = width
    }

    // Set header and footer sizes
    if (isPhoneFrame(selectedFrameVariant.value)) {
      if (imageStore.frame.useMillimeters) {
        imageStore.frame.headerSizeMm = userSetHeaderSizeMm.value
      } else {
        imageStore.frame.headerSize = Math.max(Math.floor(0.1 * imageStore.fileDimensions.width), 5)
      }
    } else if (isFrameWithFooter(selectedFrameVariant.value)) {
      imageStore.frame.footerSize = footerSize.value
      imageStore.frame.footerSizeMm = footerSizeMm.value
      imageStore.frame.headerSize = 0
      imageStore.frame.headerSizeMm = 0
    } else if (isFrameWithHeader(selectedFrameVariant.value)) {
      imageStore.frame.headerSize = headerSize.value
      imageStore.frame.headerSizeMm = headerSizeMm.value
      imageStore.frame.footerSize = 0
      imageStore.frame.footerSizeMm = 0
    }

    if (commit) {
      addUserEvent('applyOperation', {
        tool: 'frame',
        settings: { ...imageStore.frame },
      })

      historyStore.push(imageStore.getSnapshot(t))
    }

    imageStore.frameNeedToBeRendered = true

    saveConfigToEditorStore()
  }

  /**
   * Get contrast color for the frame based on its hex value
   * @param {string} hex - Hex color value
   * @returns {string} - Contrast color (black or white)
   */
  const getContrastColor = (hex) => {
    hex = hex.replace('#', '')
    if (hex.length === 3)
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    return luminance > 186 ? '#000000' : '#ffffff'
  }

  /**
   * Check if phone side buttons can be drawn within frame bounds.
   * @param {number} svgHeight - Total SVG (frame) height
   * @param {number} svgWidth - Total SVG (frame) width
   * @param {number} fw - Frame width
   * @param {number} phoneCornerRadius - Corner radius of phone
   * @returns {boolean} True if buttons fit, false if they would overflow
   */
  const canDrawPhoneButtons = (isLandscapePhone = false) => {
    const fw = imageStore.frame.width || 0

    let svgHeightApproximation = imageStore.fileDimensions.height + fw * 2
    let svgWidthApproximation = imageStore.fileDimensions.width + fw * 2

    if (isLandscapePhone) {
      // Swap width and height for landscape
      const temp = svgHeightApproximation
      svgHeightApproximation = svgWidthApproximation
      svgWidthApproximation = temp
    }

    const phoneCornerRadiusApproximation = Math.max(
      Math.floor(Math.min(svgHeightApproximation, svgWidthApproximation) * 0.06),
      2,
    )

    const volumeButtonWidth = fw / 3
    const volumeButtonHeight = volumeButtonWidth * 25
    const volumeUpY = svgWidthApproximation * 0.4

    const volumeDownY = volumeUpY + volumeButtonHeight + volumeButtonWidth * 3

    // Set global ref for disabled state
    phoneButtonsCanBeDrawn.value =
      volumeDownY + volumeButtonHeight + 50 + phoneCornerRadiusApproximation <=
      svgHeightApproximation

    // Check if bottom of volumeDown + margin + rounded corner exceeds frame height
    return (
      volumeDownY + volumeButtonHeight + 50 + phoneCornerRadiusApproximation <=
      svgHeightApproximation
    )
  }

  /**
   * Apply the frame rendering to the specified SVG element
   * @param {SVGElement} el - The SVG element to apply the frame to
   */
  const applyFrameRender = (el, isLandscapePhone = true, width = null, height = null) => {
    log('Applying frame render...')
    const ns = 'http://www.w3.org/2000/svg'
    const frame = imageStore.frame
    if (!frame?.enabled || !el) return

    let w
    let h

    if (isLandscapePhone) {
      w = height ?? imageStore.fileDimensions.height
      h = width ?? imageStore.fileDimensions.width
    } else {
      w = width ?? imageStore.fileDimensions.width
      h = height ?? imageStore.fileDimensions.height
    }

    const color = frame.color
    const phoneEdgeStrokeWidth =
      frame.phoneOutlineSize === 'small' ? 1 : frame.phoneOutlineSize === 'medium' ? 3 : 5
    const phoneHeaderIconsSizeMultiplier =
      frame.phoneHeaderIconsSize === 'small'
        ? 0.5
        : frame.phoneHeaderIconsSize === 'medium'
          ? 0.75
          : 1

    const contrastColor = getContrastColor(color)

    const useMillimetersForFrame = frame.useMillimeters
    const PxPerMm = viewportStore.getPxPerMmFitZoom

    let fw = useMillimetersForFrame ? frame.widthMm * PxPerMm : frame.width
    let fh = useMillimetersForFrame ? frame.heightMm * PxPerMm : frame.height

    // UPDATE new frame type
    if (
      frame.type === 'frameMacBrowser' ||
      frame.type === 'frameWindowsBrowser' ||
      frame.type === 'frameVSCode'
    ) {
      if (!frame.outlineEnabled) {
        fw = 0
        fh = 0
      }
    } else if (
      frame.type === 'framePhoneAndroid' ||
      frame.type === 'framePhoneAndroid2' ||
      frame.type === 'framePhoneIOS' ||
      frame.type === 'framePhoneIOS2' ||
      frame.type === 'framePhoneSimple'
    ) {
      if (!useMillimetersForFrame) {
        // Width based on image width
        fw = Math.max(Math.floor(editorConfig.phoneFrameDefaultSize * w), 2) * 1.5 * 2
        fh = fw / 1.5

        // Header size
        imageStore.frame.headerSize = Math.max(Math.floor(0.1 * w), 5)
      } else {
        // Use only max frame width in mm (because of preset values)
        if (fw > maxFrameWidthMm.value * PxPerMm) {
          fw = maxFrameWidthMm.value * PxPerMm
        }

        fh = fw / 1.5

        imageStore.frame.headerSize = imageStore.frame.headerSizeMm * PxPerMm
      }

      imageStore.frame.footerSize = 0
    } else if (frame.type === 'frameWindowsTaskBar') {
      if (!frame.outlineEnabled) {
        fw = 0
        fh = 0
      }
    } else {
      imageStore.frame.headerSize = 0
      imageStore.frame.footerSize = 0
    }

    imageStore.frame.width = fw
    imageStore.frame.height = fh

    const hasHeader = isFrameWithHeader(frame.type)

    const hasPhoneFrame = isPhoneFrame(frame.type)

    const adjustmentForPhoneButtons = frame.phoneButtonsEnabled ? 0 : fw / 3

    // Get header and footer sizes based on units
    const header =
      useMillimetersForFrame && isFrameWithMultiplier(frame.type)
        ? imageStore.frame.headerSizeMm * PxPerMm
        : imageStore.frame.headerSize
    const footer =
      useMillimetersForFrame && isFrameWithMultiplier(frame.type)
        ? imageStore.frame.footerSizeMm * PxPerMm
        : imageStore.frame.footerSize

    const svgWidth = w + fw * 2 - 2 * adjustmentForPhoneButtons

    let headerCorrection = 0
    let headerCorrectionPosition = fh
    if ((hasHeader && !hasPhoneFrame) || (hasPhoneFrame && frame.phoneHeaderExpand)) {
      if (hasHeader && !hasPhoneFrame) {
        headerCorrection = header - fh
        headerCorrectionPosition = header
      } else if (hasPhoneFrame && frame.phoneHeaderExpand) {
        headerCorrection = header
        headerCorrectionPosition = header + fh
      }
    }

    const svgHeight = h + fh * 2 + headerCorrection + (footer > 0 ? footer - fh : 0)

    const phoneCornerRadius = Math.max(Math.floor(Math.min(svgWidth, svgHeight) * 0.06), 2)

    // Values for phone frames
    const strokeWidth = (fw / 3) * 2 // 2/3 of frame width
    const offset = strokeWidth / 2
    const headerSizePhone = header
    const drawingAdjustmentForPhoneButtons = frame.phoneButtonsEnabled ? (fw / 3) * 2 : fw / 3

    const phoneFrameValues = {
      strokeWidth,
      radius: phoneCornerRadius,
      offset, // Need because path is drawn from center of stroke
      left: drawingAdjustmentForPhoneButtons + 0.5,
      top: offset + 0.5,
      right: svgWidth - drawingAdjustmentForPhoneButtons - 0.5,
      bottom: svgHeight - offset - 0.5,
      headerSize: headerSizePhone,
    }

    if (isLandscapePhone) {
      el.style.left = `-${headerCorrectionPosition}px`
      el.style.top = `-${fw - adjustmentForPhoneButtons}px`
    } else {
      el.style.left = `-${fw - adjustmentForPhoneButtons}px`
      el.style.top = `-${headerCorrectionPosition}px`
    }

    // Recalculate if phone buttons can be drawn
    canDrawPhoneButtons(isLandscapePhone)

    /**
     * Draws a side button with rounded corners
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @param {number} radius - Corner radius
     * @param {string} side - 'left' or 'right' to determine which side the button is on
     * @param {boolean} outline - Whether to draw outline
     * @param {string} edgeColor - Color of the button edge
     * @param {number} edgeStroke - Stroke width of the button edge
     * @return {SVGElement} - The button element
     */
    const drawSideButton = ({
      el,
      x,
      y,
      width,
      height,
      radius,
      side,
      color,
      outline = false,
      edgeColor = 'black',
      edgeStroke = phoneEdgeStrokeWidth,
    }) => {
      const createPath = (x, y, w, h, r, fill) => {
        if (w <= 0 || h <= 0) return null

        const p = document.createElementNS(ns, 'path')

        const d =
          side !== 'right'
            ? [
                `M ${x + w} ${y}`,
                `H ${x + r}`,
                `A ${r} ${r} 0 0 0 ${x} ${y + r}`,
                `V ${y + h - r}`,
                `A ${r} ${r} 0 0 0 ${x + r} ${y + h}`,
                `H ${x + w}`,
                'Z',
              ]
            : [
                `M ${x} ${y}`,
                `H ${x + w - r}`,
                `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
                `V ${y + h - r}`,
                `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
                `H ${x}`,
                'Z',
              ]

        p.setAttribute('d', d.join(' '))
        p.setAttribute('fill', fill)
        return p
      }

      if (outline) {
        // Outer edge
        const outer = createPath(x, y, width, height, radius, edgeColor)
        if (outer) el.appendChild(outer)

        // Inner main fill
        const inner = createPath(
          x + edgeStroke,
          y + edgeStroke,
          width - 2 * edgeStroke,
          height - 2 * edgeStroke,
          Math.max(radius - edgeStroke, 0),
          color,
        )
        if (inner) el.appendChild(inner)
      } else {
        // Single fill (classic)
        const main = createPath(x, y, width, height, radius, color)
        if (main) el.appendChild(main)
      }
    }

    /**
     * Draws the volume and power buttons for phone frames
     */
    const drawVolumeAndPowerButtons = ({
      outline = false,
      edgeColor = 'black',
      edgeStroke = phoneEdgeStrokeWidth,
    }) => {
      if (!frame.phoneButtonsEnabled) return

      // Volume buttons (left side)
      const volumeButtonWidth = fw / 3 // 1/3 of frame width
      const volumeButtonHeight = volumeButtonWidth * 25
      const volumeButtonRadius = volumeButtonWidth
      const volumeButtonX = 0
      // const volumeUpY = svgHeight * 0.22
      const volumeUpY = svgWidth * 0.4
      const volumeDownY = volumeUpY + volumeButtonHeight + volumeButtonWidth * 3

      if (!canDrawPhoneButtons(isLandscapePhone)) {
        drawPhoneButtons.value = false
        return
      }

      drawSideButton({
        el,
        x: volumeButtonX,
        y: volumeUpY,
        width: volumeButtonWidth + fh * 0.3,
        height: volumeButtonHeight,
        radius: volumeButtonRadius,
        side: 'left',
        color,
        outline,
        edgeColor,
        edgeStroke,
      })

      drawSideButton({
        el,
        x: volumeButtonX,
        y: volumeDownY,
        width: volumeButtonWidth + fh * 0.3,
        height: volumeButtonHeight,
        radius: volumeButtonRadius,
        side: 'left',
        color,
        outline,
        edgeColor,
        edgeStroke,
      })

      // Power button (right side)
      const powerButtonWidth = fw / 3 // 1/3 of frame width
      const powerButtonHeight = powerButtonWidth * 17
      const powerButtonRadius = powerButtonWidth
      const powerButtonX = svgWidth - powerButtonWidth
      const powerButtonY = svgWidth * 0.7

      drawSideButton({
        el,
        x: powerButtonX - fh * 0.35,
        y: powerButtonY,
        width: powerButtonWidth + fh * 0.3,
        height: powerButtonHeight,
        radius: powerButtonRadius,
        side: 'right',
        color,
        outline,
        edgeColor,
        edgeStroke,
      })
    }

    /**
     * Draws the header rectangle for phone frames
     * @param {string} textColor - Color for the header text
     */
    const drawPhoneHeader = (
      backgroundColor = '#ffffff',
      textColor = '#000000',
      timeInMinutes = 660,
    ) => {
      if (hasHeader) {
        const x = phoneFrameValues.left + phoneFrameValues.offset
        const y = phoneFrameValues.top + phoneFrameValues.offset
        const width = phoneFrameValues.right - phoneFrameValues.left - phoneFrameValues.offset * 2
        const height = phoneFrameValues.headerSize + 1
        const r = Math.min(height, phoneFrameValues.radius) - fw / 2 // -fw/2 because needed radius of inner arc of border

        if (hasPhoneFrame && frame.phoneHeaderExpand) {
          const d = [
            `M ${x + r} ${y}`, // start after top-left corner
            `H ${x + width - r}`, // move to before top-right corner
            `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`, // top-right corner
            `V ${y + height}`, // down right edge
            `H ${x}`, // move left on bottom edge
            `V ${y + r}`, // up left edge
            `A ${r} ${r} 0 0 1 ${x + r} ${y}`, // top-left corner
            'Z',
          ].join(' ')

          const path = document.createElementNS(ns, 'path')
          path.setAttribute('d', d)
          path.setAttribute('fill', backgroundColor)

          el.appendChild(path)
        }

        if (!isLandscapePhone) {
          // Left: Time (HH:MM)
          const timeText = document.createElementNS(ns, 'text')

          const time = timeInMinutes
          const hours = Math.floor(time / 60)
          const minutes = time % 60
          const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          const fontSize = Math.floor(height * 0.45 * phoneHeaderIconsSizeMultiplier)

          timeText.textContent = timeString

          timeText.setAttribute('x', x + phoneFrameValues.radius / 2)
          timeText.setAttribute('y', y + height / 2)
          timeText.setAttribute('fill', textColor)
          timeText.setAttribute('font-size', fontSize)
          timeText.setAttribute('font-family', 'sans-serif')
          timeText.setAttribute('dominant-baseline', 'middle')
          timeText.setAttribute('text-anchor', 'start')
          el.appendChild(timeText)

          const approxCharWidth = fontSize * 0.6 // average width factor
          const timeWidth = timeString.length * approxCharWidth
          const timeEndX = x + phoneFrameValues.radius / 2 + timeWidth

          // Battery
          const batteryWidth = height * 0.9 * phoneHeaderIconsSizeMultiplier
          const batteryHeight = height * 0.45 * phoneHeaderIconsSizeMultiplier
          const batteryX = svgWidth - x - batteryWidth - phoneFrameValues.radius / 2
          const batteryY = y + (height - batteryHeight) / 2

          const batteryStyle =
            frame.phoneBatteryIconStyle === 'style1'
              ? 0
              : frame.phoneBatteryIconStyle === 'style2'
                ? 1
                : 2

          if (batteryStyle == 0) {
            // Battery
            const batteryPadding = batteryWidth * 0.05
            const batteryOutlineWidth = batteryWidth * 0.02
            const batteryCornerRadius = batteryPadding

            const battery = document.createElementNS(ns, 'rect')
            battery.setAttribute('x', batteryX)
            battery.setAttribute('y', batteryY)
            battery.setAttribute('width', batteryWidth)
            battery.setAttribute('height', batteryHeight)
            battery.setAttribute('rx', batteryCornerRadius)
            battery.setAttribute('fill', 'none')
            battery.setAttribute('stroke', textColor)
            battery.setAttribute('stroke-width', batteryOutlineWidth)
            el.appendChild(battery)

            const batteryFill = document.createElementNS(ns, 'rect')
            batteryFill.setAttribute('x', batteryX + batteryPadding)
            batteryFill.setAttribute('y', batteryY + batteryPadding)
            batteryFill.setAttribute('width', batteryWidth - batteryPadding * 2)
            batteryFill.setAttribute('height', batteryHeight - batteryPadding * 2)
            batteryFill.setAttribute('fill', textColor)
            el.appendChild(batteryFill)

            // Battery tip
            const batteryTip = document.createElementNS(ns, 'rect')

            const batteryTipWidth = batteryPadding * 2

            batteryTip.setAttribute('x', batteryX + batteryWidth)
            batteryTip.setAttribute('y', batteryY + batteryHeight * 0.25)
            batteryTip.setAttribute('width', batteryTipWidth)
            batteryTip.setAttribute('height', batteryHeight * 0.5)
            batteryTip.setAttribute('fill', textColor)
            el.appendChild(batteryTip)
          } else if (batteryStyle == 1) {
            // Battery (ISO / iOS style)
            const batteryPadding = batteryWidth * 0.08
            const batteryOutlineWidth = batteryWidth * 0.06
            const batteryCornerRadius = batteryHeight * 0.25

            // Main battery body
            const battery = document.createElementNS(ns, 'rect')
            battery.setAttribute('x', batteryX)
            battery.setAttribute('y', batteryY)
            battery.setAttribute('width', batteryWidth)
            battery.setAttribute('height', batteryHeight)
            battery.setAttribute('rx', batteryCornerRadius)
            battery.setAttribute('ry', batteryCornerRadius)
            battery.setAttribute('fill', 'none')
            battery.setAttribute('stroke', textColor)
            battery.setAttribute('stroke-width', batteryOutlineWidth)
            el.appendChild(battery)

            // Battery cap (right nub)
            const capWidth = batteryWidth * 0.08
            const capHeight = batteryHeight * 0.4
            const capX = batteryX + batteryWidth
            const capY = batteryY + (batteryHeight - capHeight) / 2

            const batteryCap = document.createElementNS(ns, 'rect')
            batteryCap.setAttribute('x', capX)
            batteryCap.setAttribute('y', capY)
            batteryCap.setAttribute('width', capWidth)
            batteryCap.setAttribute('height', capHeight)
            batteryCap.setAttribute('rx', capWidth * 0.4)
            batteryCap.setAttribute('ry', capWidth * 0.4)
            batteryCap.setAttribute('fill', textColor)
            el.appendChild(batteryCap)

            // Battery fill
            const batteryFill = document.createElementNS(ns, 'rect')
            batteryFill.setAttribute('x', batteryX + batteryPadding)
            batteryFill.setAttribute('y', batteryY + batteryPadding)
            batteryFill.setAttribute('width', batteryWidth - batteryPadding * 2)
            batteryFill.setAttribute('height', batteryHeight - batteryPadding * 2)
            batteryFill.setAttribute('rx', (batteryHeight - batteryPadding * 2) * 0.2)
            batteryFill.setAttribute('ry', (batteryHeight - batteryPadding * 2) * 0.2)
            batteryFill.setAttribute('fill', textColor)
            el.appendChild(batteryFill)
          } else if (batteryStyle == 2) {
            // Battery (iOS style – no outline)
            const batteryCornerRadius = (batteryHeight / 7) * 3
            const batteryPadding = batteryHeight * 0.15

            // Example battery level (0–1)
            const batteryLevel = 0.64

            // Battery body (background pill)
            const batteryBody = document.createElementNS(ns, 'rect')
            batteryBody.setAttribute('x', batteryX)
            batteryBody.setAttribute('y', batteryY)
            batteryBody.setAttribute('width', batteryWidth)
            batteryBody.setAttribute('height', batteryHeight)
            batteryBody.setAttribute('rx', batteryCornerRadius)
            batteryBody.setAttribute('ry', batteryCornerRadius)
            batteryBody.setAttribute('fill', textColor)
            batteryBody.setAttribute('opacity', '0.25')
            el.appendChild(batteryBody)

            // Battery cap (right nub) with rounded right corners only
            const capWidth = batteryWidth * 0.055
            const capHeight = batteryHeight * 0.25
            const capX = batteryX + batteryWidth + capWidth * 0.2
            const capY = batteryY + (batteryHeight - capHeight) / 2

            const r = capHeight * 0.4 // Corner radius

            const batteryCap = document.createElementNS(ns, 'path')

            const d = `
                      M ${capX} ${capY}
                      L ${capX + capWidth - r} ${capY}
                      Q ${capX + capWidth} ${capY} ${capX + capWidth} ${capY + r}
                      L ${capX + capWidth} ${capY + capHeight - r}
                      Q ${capX + capWidth} ${capY + capHeight} ${capX + capWidth - r} ${capY + capHeight}
                      L ${capX} ${capY + capHeight}
                      Z
                    `

            batteryCap.setAttribute('d', d)
            batteryCap.setAttribute('fill', textColor)
            batteryCap.setAttribute('opacity', '0.4')
            el.appendChild(batteryCap)

            // Battery fill (charge level)
            const fillWidth = (batteryWidth - batteryPadding * 2) * batteryLevel

            const batteryFill = document.createElementNS(ns, 'rect')
            batteryFill.setAttribute('x', batteryX + batteryPadding)
            batteryFill.setAttribute('y', batteryY + batteryPadding)
            batteryFill.setAttribute('width', fillWidth)
            batteryFill.setAttribute('height', batteryHeight - batteryPadding * 2)
            batteryFill.setAttribute('rx', (batteryHeight - batteryPadding * 2) / 2)
            batteryFill.setAttribute('ry', (batteryHeight - batteryPadding * 2) / 2)
            batteryFill.setAttribute('fill', textColor)
            el.appendChild(batteryFill)
          }

          // Wi-Fi (diagonal style, 3 bars, no dot)
          const wifiSize = batteryHeight
          const wifiX = batteryX - wifiSize * 1.45
          const wifiY = batteryY + (batteryHeight - wifiSize) / 2

          const cx = wifiX + wifiSize / 2
          const cy = wifiY + wifiSize

          /**
           * Filled quarter-arc (like diagonal wifi bar)
           */
          const createWifiSlice = (outerR, innerR) => {
            const path = document.createElementNS(ns, 'path')

            // Quarter ring (top-right quadrant)
            const d = `
            M ${cx} ${cy - outerR}
            A ${outerR} ${outerR} 0 0 1 ${cx + outerR} ${cy}
            L ${cx + innerR} ${cy}
            A ${innerR} ${innerR} 0 0 0 ${cx} ${cy - innerR}
            Z
          `

            path.setAttribute('d', d)
            path.setAttribute('fill', textColor)

            // Rotate whole slice by 45°
            path.setAttribute('transform', `rotate(-45 ${cx} ${cy})`)

            el.appendChild(path)
          }

          // 3 diagonal bars (outer → inner)
          // createWifiSlice(wifiSize * 0.95, wifiSize * 0.8)
          createWifiSlice(wifiSize * 1, wifiSize * 0.76)
          createWifiSlice(wifiSize * 0.62, wifiSize * 0.41)
          createWifiSlice(wifiSize * 0.28, wifiSize * 0)

          // Signal (3 bars)
          const signalWidth = batteryHeight * 1.2
          const barWidth = signalWidth / 5.5
          const barSpacing = barWidth * 0.5
          const barBaseX = wifiX - barSpacing * 7
          const barBottom = batteryY + batteryHeight
          const barHeights = [
            batteryHeight * 0.25,
            batteryHeight * 0.5,
            batteryHeight * 0.75,
            batteryHeight,
          ]

          barHeights.forEach((h, i) => {
            const bar = document.createElementNS(ns, 'rect')
            bar.setAttribute('x', barBaseX - (barWidth + barSpacing) * (barHeights.length - i - 1))
            bar.setAttribute('y', barBottom - h)
            bar.setAttribute('width', barWidth)
            bar.setAttribute('height', h)
            bar.setAttribute('fill', textColor)
            el.appendChild(bar)
          })

          const signalLeftX = barBaseX - (barWidth + barSpacing) * (barHeights.length - 1)
          const freeSpace = signalLeftX - timeEndX

          return freeSpace
        } else {
          // Return maximum - there are no other elements to draw
          return svgWidth
        }
      }
    }

    /**
     * Draws the iPhone-style home indicator line at the bottom of the screen
     * @param {string} color - Color of the line
     */
    const drawPhoneNavigationButton = (color = '#505152ff') => {
      if (!frame.phoneNavigationEnabled) return
      if (isLandscapePhone) return

      const indicatorHeight = phoneFrameValues.headerSize * 0.12
      const indicatorWidth = w * 0.4
      const indicatorRadius = indicatorHeight * 0.5

      const x = svgWidth / 2 - indicatorWidth / 2
      const y =
        h + fh - indicatorHeight * 3 + (frame.phoneHeaderExpand ? phoneFrameValues.headerSize : 0)

      const rect = document.createElementNS(ns, 'rect')
      rect.setAttribute('x', x)
      rect.setAttribute('y', y)
      rect.setAttribute('width', indicatorWidth)
      rect.setAttribute('height', indicatorHeight)
      rect.setAttribute('rx', indicatorRadius)
      rect.setAttribute('ry', indicatorRadius)
      rect.setAttribute('fill', color)
      el.appendChild(rect)
    }

    /**
     * Draws the phone frame outline with single or double stroke
     * @param {SVGElement} el - The SVG element to draw the outline on
     * @param {string} d - The path data for the outline
     * @param {number} baseStroke - The base stroke width
     * @param {string} color - The main outline color
     * @param {string} mode - 'single' or 'double' for outline style
     * @param {string} edgeColor - Color for the outer edge in double mode
     * @param {number} edgeStroke - Stroke width for the outer edge in double mode
     */
    const drawPhoneFrameOutline = ({
      el,
      d,
      baseStroke,
      color,
      outline = false,
      edgeColor = 'black',
      edgeStroke = phoneEdgeStrokeWidth,
    }) => {
      const createPath = (stroke, strokeColor) => {
        if (stroke <= 0) return null

        const p = document.createElementNS(ns, 'path')
        p.setAttribute('fill', 'none')
        p.setAttribute('stroke', strokeColor)
        p.setAttribute('stroke-width', stroke)
        p.setAttribute('d', d)
        return p
      }

      if (outline) {
        // Outer edge
        const outer = createPath(baseStroke, edgeColor)
        if (outer) el.appendChild(outer)

        // Inner main outline
        const inner = createPath(baseStroke - 2 * edgeStroke, color)
        if (inner) el.appendChild(inner)
      } else {
        // Single outline (classic)
        const outline = createPath(baseStroke, color)
        if (outline) el.appendChild(outline)
      }
    }

    /**
     * Builds the SVG path data for the phone outline
     * @param {object} v - Object containing left, top, right, bottom, and radius
     * @returns {string} - SVG path data string
     */
    const buildPhoneOutlinePath = (v) =>
      [
        `M ${v.left + v.radius} ${v.top}`,
        `H ${v.right - v.radius}`,
        `A ${v.radius} ${v.radius} 0 0 1 ${v.right} ${v.top + v.radius}`,
        `V ${v.bottom - v.radius}`,
        `A ${v.radius} ${v.radius} 0 0 1 ${v.right - v.radius} ${v.bottom}`,
        `H ${v.left + v.radius}`,
        `A ${v.radius} ${v.radius} 0 0 1 ${v.left} ${v.bottom - v.radius}`,
        `V ${v.top + v.radius}`,
        `A ${v.radius} ${v.radius} 0 0 1 ${v.left + v.radius} ${v.top}`,
        'Z',
      ].join(' ')

    // UPDATE new frame type
    if (frame.type === 'frameSolid') {
      // 4 sides
      const sides = [
        { x: 0, y: 0, width: svgWidth, height: fh }, // top
        { x: 0, y: svgHeight - fh, width: svgWidth, height: fh }, // bottom
        { x: 0, y: fh, width: fw, height: h }, // left
        { x: svgWidth - fw, y: fh, width: fw, height: h }, // right
      ]
      sides.forEach((s) => {
        const r = document.createElementNS(ns, 'rect')
        Object.entries(s).forEach(([k, v]) => r.setAttribute(k, v))
        r.setAttribute('fill', color)
        el.appendChild(r)
      })
    } else if (frame.type === 'frameMacBrowser') {
      const headerRect = document.createElementNS(ns, 'rect')
      headerRect.setAttribute('x', 0)
      headerRect.setAttribute('y', 0)
      headerRect.setAttribute('width', svgWidth)
      headerRect.setAttribute('height', header)
      headerRect.setAttribute('fill', color)
      el.appendChild(headerRect)

      // 3 circles
      const colors = ['#ff5f56', '#ffbd2e', '#27c93f']
      const radius = header * 0.17
      const spacing = radius * 2.9
      const startX = fw + radius * 2
      const centerY = header / 2
      colors.forEach((c, i) => {
        const circle = document.createElementNS(ns, 'circle')
        circle.setAttribute('cx', startX + i * spacing)
        circle.setAttribute('cy', centerY)
        circle.setAttribute('r', radius)
        circle.setAttribute('fill', c)
        el.appendChild(circle)
      })

      // Outline
      if (frame.outlineEnabled) {
        const borders = [
          { x: 0, y: 0, width: fw, height: svgHeight }, // left
          { x: svgWidth - fw, y: 0, width: fw, height: svgHeight }, // right
          { x: 0, y: svgHeight - fh, width: svgWidth, height: fh }, // bottom
        ]
        borders.forEach((s) => {
          const r = document.createElementNS(ns, 'rect')
          Object.entries(s).forEach(([k, v]) => r.setAttribute(k, v))
          r.setAttribute('fill', color)
          el.appendChild(r)
        })
      }
    } else if (frame.type === 'frameWindowsBrowser') {
      const headerRect = document.createElementNS(ns, 'rect')
      headerRect.setAttribute('x', 0)
      headerRect.setAttribute('y', 0)
      headerRect.setAttribute('width', svgWidth)
      headerRect.setAttribute('height', header)
      headerRect.setAttribute('fill', color)
      el.appendChild(headerRect)

      const strokeWidth = header * 0.07

      const iconGroup = document.createElementNS(ns, 'g')
      iconGroup.setAttribute('stroke', contrastColor)
      iconGroup.setAttribute('stroke-width', strokeWidth)

      const size = header * 0.35
      const spacing = size * 3
      const startX = svgWidth - fw - spacing * 2 - size - 1 - size
      const centerY = header / 2 - strokeWidth / 2

      // Minimize
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', startX)
      line.setAttribute('y1', centerY + strokeWidth / 2)
      line.setAttribute('x2', startX + size)
      line.setAttribute('y2', centerY + strokeWidth / 2)
      line.setAttribute('stroke', contrastColor)
      line.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(line)

      // Maximize
      const maximizeScale = 0.1
      const rect = document.createElementNS(ns, 'rect')
      rect.setAttribute('x', startX + spacing + size * maximizeScale)
      rect.setAttribute('y', centerY - size / 2 + size * maximizeScale)
      rect.setAttribute('width', size - size * maximizeScale * 2)
      rect.setAttribute('height', size - size * maximizeScale * 2)
      rect.setAttribute('fill', color)
      rect.setAttribute('stroke', contrastColor)
      rect.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(rect)

      // Close (cross) - dve lines
      const x = startX + spacing * 2

      // First diagonal
      const line1 = document.createElementNS(ns, 'line')
      line1.setAttribute('x1', x)
      line1.setAttribute('y1', centerY - size / 2)
      line1.setAttribute('x2', x + size)
      line1.setAttribute('y2', centerY + size / 2)
      line1.setAttribute('stroke', contrastColor)
      line1.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(line1)

      // Second diagonal
      const line2 = document.createElementNS(ns, 'line')
      line2.setAttribute('x1', x + size)
      line2.setAttribute('y1', centerY - size / 2)
      line2.setAttribute('x2', x)
      line2.setAttribute('y2', centerY + size / 2)
      line2.setAttribute('stroke', contrastColor)
      line2.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(line2)

      el.appendChild(iconGroup)

      // Outline
      if (frame.outlineEnabled) {
        const borders = [
          { x: 0, y: 0, width: fw, height: svgHeight },
          { x: svgWidth - fw, y: 0, width: fw, height: svgHeight },
          { x: 0, y: svgHeight - fh, width: svgWidth, height: fh },
        ]

        borders.forEach((s) => {
          const r = document.createElementNS(ns, 'rect')
          Object.entries(s).forEach(([k, v]) => r.setAttribute(k, v))
          r.setAttribute('fill', color)
          el.appendChild(r)
        })
      }
    } else if (frame.type === 'frameVSCode') {
      const headerRect = document.createElementNS(ns, 'rect')
      headerRect.setAttribute('x', 0)
      headerRect.setAttribute('y', 0)
      headerRect.setAttribute('width', svgWidth)
      headerRect.setAttribute('height', header)
      headerRect.setAttribute('fill', color)
      el.appendChild(headerRect)

      const strokeWidth = header * 0.07

      // VS Code logo
      const logoPath = document.createElementNS(ns, 'path')
      const logoScale = (header * 0.7) / 16 // viewBox 16x16
      const logoOffsetX = fw + header / 3
      const logoOffsetY = header * 0.15

      logoPath.setAttribute(
        'd',
        'M11.782799999999998 0.15999999999999998 5.698933333333334 6.251666666666666 1.8573333333333333 3.2254666666666663 0.17959999999999998 4.08v7.84l1.6856 0.8545333333333334 3.865133333333333 -3.0183999999999997 6.068133333333333 6.083866666666666 4.021933333333333 -1.6228666666666665V1.728L11.782799999999998 0.15999999999999998ZM1.9984666666666666 9.8032V6.1575999999999995l1.9129999999999998 1.9051333333333331 -1.9129999999999998 1.7404666666666666Zm9.666733333333333 1.0113333333333332L8.0196 8l3.6456 -2.8145333333333333v5.629066666666667Z',
      )
      logoPath.setAttribute(
        'transform',
        `translate(${logoOffsetX}, ${logoOffsetY}) scale(${logoScale})`,
      )
      logoPath.setAttribute('fill', contrastColor)
      el.appendChild(logoPath)

      // Window icons (right side)
      const iconGroup = document.createElementNS(ns, 'g')
      iconGroup.setAttribute('stroke', contrastColor)
      iconGroup.setAttribute('stroke-width', strokeWidth)

      const size = header * 0.35
      const spacing = size * 3
      const startX = svgWidth - fw - spacing * 2 - size - 1 - size
      const centerY = header / 2

      // Minimize
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', startX)
      line.setAttribute('y1', centerY + strokeWidth / 2)
      line.setAttribute('x2', startX + size)
      line.setAttribute('y2', centerY + strokeWidth / 2)
      line.setAttribute('stroke', contrastColor)
      line.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(line)

      // Maximize
      const maximizeScale = 0.1
      const rect = document.createElementNS(ns, 'rect')
      rect.setAttribute('x', startX + spacing + size * maximizeScale)
      rect.setAttribute('y', centerY - size / 2 + size * maximizeScale)
      rect.setAttribute('width', size - size * maximizeScale * 2)
      rect.setAttribute('height', size - size * maximizeScale * 2)
      rect.setAttribute('fill', color)
      rect.setAttribute('stroke', contrastColor)
      rect.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(rect)

      // Close (cross) - 2 lines
      const x = startX + spacing * 2

      // First diagonal
      const line1 = document.createElementNS(ns, 'line')
      line1.setAttribute('x1', x)
      line1.setAttribute('y1', centerY - size / 2)
      line1.setAttribute('x2', x + size)
      line1.setAttribute('y2', centerY + size / 2)
      line1.setAttribute('stroke', contrastColor)
      line1.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(line1)

      // Second diagonal
      const line2 = document.createElementNS(ns, 'line')
      line2.setAttribute('x1', x + size)
      line2.setAttribute('y1', centerY - size / 2)
      line2.setAttribute('x2', x)
      line2.setAttribute('y2', centerY + size / 2)
      line2.setAttribute('stroke', contrastColor)
      line2.setAttribute('stroke-width', strokeWidth)
      iconGroup.appendChild(line2)

      el.appendChild(iconGroup)

      // Outline
      if (frame.outlineEnabled) {
        const borders = [
          { x: 0, y: 0, width: fw, height: svgHeight },
          { x: svgWidth - fw, y: 0, width: fw, height: svgHeight },
          { x: 0, y: svgHeight - fh, width: svgWidth, height: fh },
        ]
        borders.forEach((s) => {
          const r = document.createElementNS(ns, 'rect')
          Object.entries(s).forEach(([k, v]) => r.setAttribute(k, v))
          r.setAttribute('fill', color)
          el.appendChild(r)
        })
      }
    } else if (frame.type === 'framePhoneIOS') {
      // Draw phone header if enabled
      const freeSpace = drawPhoneHeader(
        phoneHeaderBackgroundColor.value,
        phoneHeaderTextColor.value,
        phoneHeaderTimeInMinutes.value,
      )

      // Volume and power buttons
      drawVolumeAndPowerButtons({
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Build outline path
      const d = buildPhoneOutlinePath(phoneFrameValues)

      // Unified outline rendering
      drawPhoneFrameOutline({
        el,
        d,
        baseStroke: phoneFrameValues.strokeWidth,
        color,
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Dynamic island
      const notchHeight = phoneFrameValues.headerSize * 0.8
      const notchWidth = notchHeight * 4

      const notchRadius = Math.floor(notchHeight * 0.45)

      const notchMarginTop = phoneFrameValues.headerSize - notchHeight
      const notchX = svgWidth / 2 - notchWidth / 2
      const notchY = phoneFrameValues.top + phoneFrameValues.offset + notchMarginTop / 2

      if (freeSpace >= notchWidth * 1.2) {
        const createIsland = (x, y, w, h, r, fill) => {
          const rect = document.createElementNS(ns, 'rect')
          rect.setAttribute('x', x)
          rect.setAttribute('y', y)
          rect.setAttribute('width', w)
          rect.setAttribute('height', h)
          rect.setAttribute('rx', r)
          rect.setAttribute('ry', r)
          rect.setAttribute('fill', fill)
          return rect
        }

        if (frame.phoneOutlineEnabled) {
          // Outer edge
          el.appendChild(
            createIsland(
              notchX,
              notchY,
              notchWidth,
              notchHeight,
              notchRadius,
              frame.phoneOutlineColor,
            ),
          )

          // Inner main island
          el.appendChild(
            createIsland(
              notchX + phoneEdgeStrokeWidth,
              notchY + phoneEdgeStrokeWidth,
              notchWidth - 2 * phoneEdgeStrokeWidth,
              notchHeight - 2 * phoneEdgeStrokeWidth,
              Math.max(notchRadius - phoneEdgeStrokeWidth, 0),
              color,
            ),
          )
        } else {
          // Single fill (classic)
          el.appendChild(createIsland(notchX, notchY, notchWidth, notchHeight, notchRadius, color))
        }

        // Camera
        const camera = document.createElementNS(ns, 'circle')
        camera.setAttribute('cx', svgWidth / 2 + notchWidth * 0.2)
        camera.setAttribute('cy', notchY + notchHeight / 2)
        camera.setAttribute('r', notchHeight * 0.15)
        camera.setAttribute('fill', contrastColor)
        el.appendChild(camera)
      }

      // Navigation (home indicator)
      drawPhoneNavigationButton()
    } else if (frame.type === 'framePhoneIOS2') {
      // Draw phone header if enabled
      drawPhoneHeader(
        phoneHeaderBackgroundColor.value,
        phoneHeaderTextColor.value,
        phoneHeaderTimeInMinutes.value,
      )

      // Volume and power buttons
      drawVolumeAndPowerButtons({
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Build outline path
      const d = buildPhoneOutlinePath(phoneFrameValues)

      // Unified outline rendering
      drawPhoneFrameOutline({
        el,
        d,
        baseStroke: phoneFrameValues.strokeWidth,
        color,
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Notch
      const notchHeight = phoneFrameValues.headerSize
      const notchWidth = notchHeight * 4

      const notchPadding = 1.5
      const notchRadius = notchHeight / 2
      const arcR = Math.floor(notchHeight * 0.4)

      const nw = notchWidth
      const nh = notchHeight
      const nx = svgWidth / 2 - nw / 2

      // BASE geometry
      const baseNy =
        phoneFrameValues.top + phoneFrameValues.strokeWidth * 0.5 - phoneEdgeStrokeWidth

      const bottomNy = baseNy + nh

      const notchFits =
        nx >= phoneFrameValues.left &&
        nx + nw * notchPadding <= phoneFrameValues.right &&
        bottomNy * notchPadding <= phoneFrameValues.bottom &&
        notchHeight >= 5

      if (notchFits) {
        // Cover notch
        const coverNy = baseNy - 0.5
        const coverBottomNy = coverNy + nh

        const coverPath = [
          `M ${nx - arcR} ${coverNy}`,
          `A ${arcR} ${arcR} 0 0 1 ${nx} ${coverNy + arcR}`,
          `V ${coverBottomNy - notchRadius}`,
          `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + notchRadius} ${coverBottomNy}`,
          `H ${nx + nw - notchRadius}`,
          `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + nw} ${coverBottomNy - notchRadius}`,
          `V ${coverNy + arcR}`,
          `A ${arcR} ${arcR} 0 0 1 ${nx + nw + arcR} ${coverNy}`,
          'Z',
        ].join(' ')

        const coverNotch = document.createElementNS(ns, 'path')
        coverNotch.setAttribute('d', coverPath)
        coverNotch.setAttribute('fill', color)
        el.appendChild(coverNotch)

        // Main notch
        const mainPath = [
          `M ${nx - arcR} ${baseNy}`,
          `A ${arcR} ${arcR} 0 0 1 ${nx} ${baseNy + arcR}`,
          `V ${bottomNy - notchRadius}`,
          `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + notchRadius} ${bottomNy}`,
          `H ${nx + nw - notchRadius}`,
          `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + nw} ${bottomNy - notchRadius}`,
          `V ${baseNy + arcR}`,
          `A ${arcR} ${arcR} 0 0 1 ${nx + nw + arcR} ${baseNy}`,
          'Z',
        ].join(' ')

        const notch = document.createElementNS(ns, 'path')
        notch.setAttribute('d', mainPath)
        notch.setAttribute('fill', color)
        el.appendChild(notch)

        // Outline
        if (frame.phoneOutlineEnabled) {
          const arcOffset = phoneEdgeStrokeWidth / 2

          const outlinePath = [
            `M ${nx - arcR} ${baseNy + arcOffset}`,
            `A ${arcR} ${arcR} 0 0 1 ${nx} ${baseNy + arcR}`,
            `V ${bottomNy - notchRadius}`,
            `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + notchRadius} ${bottomNy}`,
            `H ${nx + nw - notchRadius}`,
            `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + nw} ${bottomNy - notchRadius}`,
            `V ${baseNy + arcR}`,
            `A ${arcR} ${arcR} 0 0 1 ${nx + nw + arcR} ${baseNy + arcOffset}`,
          ].join(' ')

          const outline = document.createElementNS(ns, 'path')
          outline.setAttribute('d', outlinePath)
          outline.setAttribute('fill', 'none')
          outline.setAttribute('stroke', frame.phoneOutlineColor)
          outline.setAttribute('stroke-width', phoneEdgeStrokeWidth)
          outline.setAttribute('stroke-linecap', 'round')
          outline.setAttribute('stroke-linejoin', 'round')
          el.appendChild(outline)
        }

        // Speaker
        const speakerWidth = Math.floor(nw * 0.3)
        const speakerHeight = Math.floor(nh * 0.2)
        const speakerX = svgWidth / 2 - speakerWidth / 2
        const speakerY = baseNy + nh * 0.5 - speakerHeight / 2

        const speaker = document.createElementNS(ns, 'rect')
        speaker.setAttribute('x', speakerX)
        speaker.setAttribute('y', speakerY)
        speaker.setAttribute('width', speakerWidth)
        speaker.setAttribute('height', speakerHeight)
        speaker.setAttribute('rx', speakerHeight / 2)
        speaker.setAttribute('ry', speakerHeight / 2)
        speaker.setAttribute('fill', contrastColor)
        el.appendChild(speaker)

        // Camera
        const camera = document.createElementNS(ns, 'circle')
        const cameraRadius = speakerHeight / 1.5
        camera.setAttribute('cx', svgWidth / 2 + nw * 0.25)
        camera.setAttribute('cy', speakerY + speakerHeight / 2)
        camera.setAttribute('r', cameraRadius)
        camera.setAttribute('fill', contrastColor)
        el.appendChild(camera)
      }

      // Navigation (home indicator)
      drawPhoneNavigationButton()
    } else if (frame.type === 'framePhoneAndroid') {
      // Draw phone header if enabled
      drawPhoneHeader(
        phoneHeaderBackgroundColor.value,
        phoneHeaderTextColor.value,
        phoneHeaderTimeInMinutes.value,
      )

      // Volume and power buttons
      drawVolumeAndPowerButtons({
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Build outline path
      const d = buildPhoneOutlinePath(phoneFrameValues)

      // Unified outline rendering
      drawPhoneFrameOutline({
        el,
        d,
        baseStroke: phoneFrameValues.strokeWidth,
        color,
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Camera circle
      const cameraRadius = phoneFrameValues.headerSize / 4

      const cMarginTop = phoneFrameValues.headerSize - cameraRadius * 2
      const cx = svgWidth / 2
      const cy = phoneFrameValues.top + phoneFrameValues.offset + cMarginTop

      const cameraPadding = 1.5
      const cameraFits =
        cx - cameraRadius * cameraPadding >= phoneFrameValues.left &&
        cx + cameraRadius * cameraPadding <= phoneFrameValues.right &&
        cy + cameraRadius * cameraPadding <= phoneFrameValues.bottom

      if (cameraFits) {
        const createCamera = (cx, cy, r, fill) => {
          if (r <= 0) return null
          const c = document.createElementNS(ns, 'circle')
          c.setAttribute('cx', cx)
          c.setAttribute('cy', cy)
          c.setAttribute('r', r)
          c.setAttribute('fill', fill)
          return c
        }

        if (frame.phoneOutlineEnabled) {
          // Outer edge
          const outer = createCamera(cx, cy, cameraRadius, frame.phoneOutlineColor)
          if (outer) el.appendChild(outer)

          // Inner main camera
          const inner = createCamera(cx, cy, cameraRadius - phoneEdgeStrokeWidth, color)
          if (inner) el.appendChild(inner)
        } else {
          // Single fill (classic)
          const camera = createCamera(cx, cy, cameraRadius, color)
          if (camera) el.appendChild(camera)
        }
      }

      // Navigation (home indicator)
      drawPhoneNavigationButton()
    } else if (frame.type === 'framePhoneAndroid2') {
      // Draw phone header if enabled
      drawPhoneHeader(
        phoneHeaderBackgroundColor.value,
        phoneHeaderTextColor.value,
        phoneHeaderTimeInMinutes.value,
      )

      // Volume and power buttons
      drawVolumeAndPowerButtons({
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Build outline path
      const d = buildPhoneOutlinePath(phoneFrameValues)

      // Unified outline rendering
      drawPhoneFrameOutline({
        el,
        d,
        baseStroke: phoneFrameValues.strokeWidth,
        color,
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Drop notch
      const dropHeight = phoneFrameValues.headerSize
      const dropWidth = dropHeight * 1.02
      const arcRadius = 0.5 * dropHeight

      const dropCenterX = svgWidth / 2

      // BASE geometry
      const baseDropTopY =
        phoneFrameValues.top + phoneFrameValues.strokeWidth * 0.5 - phoneEdgeStrokeWidth

      const leftDrop = dropCenterX - dropWidth / 2
      const rightDrop = dropCenterX + dropWidth / 2
      const bottomDrop = baseDropTopY + dropHeight

      const notchPadding = 1.5
      const dropFits =
        leftDrop >= phoneFrameValues.left &&
        rightDrop <= phoneFrameValues.right &&
        bottomDrop * notchPadding <= phoneFrameValues.bottom &&
        dropHeight >= 5

      if (dropFits) {
        // Covering notch
        const coverDropTopY = baseDropTopY - 0.5
        const coverBottomDrop = coverDropTopY + dropHeight

        const coverPath = [
          `M ${leftDrop - arcRadius} ${coverDropTopY}`,
          `A ${arcRadius} ${arcRadius} 0 0 1 ${leftDrop} ${coverDropTopY + arcRadius}`,
          `V ${coverBottomDrop - arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 0 ${leftDrop + arcRadius} ${coverBottomDrop}`,
          `H ${rightDrop - arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 0 ${rightDrop} ${coverBottomDrop - arcRadius}`,
          `V ${coverDropTopY + arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 1 ${rightDrop + arcRadius} ${coverDropTopY}`,
          'Z',
        ].join(' ')

        const coverNotch = document.createElementNS(ns, 'path')
        coverNotch.setAttribute('d', coverPath)
        coverNotch.setAttribute('fill', color)
        el.appendChild(coverNotch)

        // Main drop notch
        const mainPath = [
          `M ${leftDrop - arcRadius} ${baseDropTopY}`,
          `A ${arcRadius} ${arcRadius} 0 0 1 ${leftDrop} ${baseDropTopY + arcRadius}`,
          `V ${bottomDrop - arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 0 ${leftDrop + arcRadius} ${bottomDrop}`,
          `H ${rightDrop - arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 0 ${rightDrop} ${bottomDrop - arcRadius}`,
          `V ${baseDropTopY + arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 1 ${rightDrop + arcRadius} ${baseDropTopY}`,
          'Z',
        ].join(' ')

        const dropPath = document.createElementNS(ns, 'path')
        dropPath.setAttribute('d', mainPath)
        dropPath.setAttribute('fill', color)
        el.appendChild(dropPath)

        // Outline
        if (frame.phoneOutlineEnabled) {
          const arcOffset = phoneEdgeStrokeWidth / 2

          const dropOutlinePath = [
            `M ${leftDrop - arcRadius} ${baseDropTopY + arcOffset}`,
            `A ${arcRadius} ${arcRadius} 0 0 1 ${leftDrop} ${baseDropTopY + arcRadius}`,
            `V ${bottomDrop - arcRadius}`,
            `A ${arcRadius} ${arcRadius} 0 0 0 ${leftDrop + arcRadius} ${bottomDrop}`,
            `H ${rightDrop - arcRadius}`,
            `A ${arcRadius} ${arcRadius} 0 0 0 ${rightDrop} ${bottomDrop - arcRadius}`,
            `V ${baseDropTopY + arcRadius}`,
            `A ${arcRadius} ${arcRadius} 0 0 1 ${rightDrop + arcRadius} ${baseDropTopY + arcOffset}`,
          ].join(' ')

          const dropOutline = document.createElementNS(ns, 'path')
          dropOutline.setAttribute('d', dropOutlinePath)
          dropOutline.setAttribute('fill', 'none')
          dropOutline.setAttribute('stroke', frame.phoneOutlineColor)
          dropOutline.setAttribute('stroke-width', phoneEdgeStrokeWidth)
          dropOutline.setAttribute('stroke-linecap', 'round')
          dropOutline.setAttribute('stroke-linejoin', 'round')
          el.appendChild(dropOutline)
        }

        // Camera circle
        const cameraRadius = dropHeight * 0.18
        const cameraCX = dropCenterX
        const cameraCY = bottomDrop - dropHeight / 2

        const camera = document.createElementNS(ns, 'circle')
        camera.setAttribute('cx', cameraCX)
        camera.setAttribute('cy', cameraCY)
        camera.setAttribute('r', cameraRadius)
        camera.setAttribute('fill', contrastColor)
        el.appendChild(camera)
      }

      // Navigation (home indicator)
      drawPhoneNavigationButton()
    } else if (frame.type === 'framePhoneSimple') {
      // Draw phone header if enabled
      drawPhoneHeader(
        phoneHeaderBackgroundColor.value,
        phoneHeaderTextColor.value,
        phoneHeaderTimeInMinutes.value,
      )

      // Build outline path
      const d = buildPhoneOutlinePath(phoneFrameValues)

      // Volume and power buttons
      drawVolumeAndPowerButtons({
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Unified outline rendering
      drawPhoneFrameOutline({
        el,
        d,
        baseStroke: phoneFrameValues.strokeWidth,
        color,
        outline: frame.phoneOutlineEnabled,
        edgeColor: frame.phoneOutlineColor,
        edgeStroke: phoneEdgeStrokeWidth,
      })

      // Navigation (home indicator)
      drawPhoneNavigationButton()
    } else if (frame.type === 'frameWindowsTaskBar') {
      // Footer bar
      const footerRect = document.createElementNS(ns, 'rect')
      footerRect.setAttribute('x', 0)
      footerRect.setAttribute('y', svgHeight - footer)
      footerRect.setAttribute('width', svgWidth)
      footerRect.setAttribute('height', footer)
      footerRect.setAttribute('fill', color)
      el.appendChild(footerRect)

      // Windows logo
      const logoSize = footer * 0.2
      const logoSpacing = logoSize * 0.2
      const logoStartX = fw + logoSize * 3
      const logoStartY = svgHeight - footer + footer / 2 - logoSize - logoSpacing / 2

      const logoRects = [
        { x: logoStartX, y: logoStartY },
        { x: logoStartX + logoSize + logoSpacing, y: logoStartY },
        { x: logoStartX, y: logoStartY + logoSize + logoSpacing },
        { x: logoStartX + logoSize + logoSpacing, y: logoStartY + logoSize + logoSpacing },
      ]

      const logoFits = logoSize + logoStartX * 2 <= svgWidth

      if (logoFits) {
        logoRects.forEach((pos) => {
          const rect = document.createElementNS(ns, 'rect')
          rect.setAttribute('x', pos.x)
          rect.setAttribute('y', pos.y)
          rect.setAttribute('width', logoSize)
          rect.setAttribute('height', logoSize)
          rect.setAttribute('fill', contrastColor)
          el.appendChild(rect)
        })
      }

      // Search bar
      const searchX = logoStartX + (logoSize + logoSpacing) * 2 + logoSize * 2
      const searchHeight = footer * 0.2 * 2 + footer * 0.1
      const searchWidth = searchHeight * 12
      const searchY = svgHeight - footer / 2 - searchHeight / 2

      const searchFits = searchWidth + searchX + logoSize <= svgWidth

      if (searchFits) {
        const searchBar = document.createElementNS(ns, 'rect')
        searchBar.setAttribute('x', searchX)
        searchBar.setAttribute('y', searchY)
        searchBar.setAttribute('width', searchWidth)
        searchBar.setAttribute('height', searchHeight)
        searchBar.setAttribute('fill', '#ffffff')
        searchBar.setAttribute('opacity', '0.7')
        el.appendChild(searchBar)
      }

      // Outline
      if (frame.outlineEnabled) {
        const borders = [
          { x: 0, y: 0, width: fw, height: svgHeight }, // left
          { x: svgWidth - fw, y: 0, width: fw, height: svgHeight }, // right
          { x: 0, y: 0, width: svgWidth, height: fh }, // top
        ]
        borders.forEach((s) => {
          const r = document.createElementNS(ns, 'rect')
          Object.entries(s).forEach(([k, v]) => r.setAttribute(k, v))
          r.setAttribute('fill', color)
          el.appendChild(r)
        })
      }
    }

    // Round corners for phone frames
    if (isPhoneFrame(imageStore.frame.type)) {
      const radius = Math.max(Math.floor(Math.min(svgWidth, svgHeight) * 0.06), 2) - fh // 6% of the smaller dimension + a bit of padding (100% of frame height)

      const renderedImage = imageStore.getRenderedImage({ t, renderCall: false })
      if (!renderedImage) return

      const w = renderedImage.width
      const h = renderedImage.height

      const roundedCanvas = applyRoundedCorners(
        renderedImage,
        radius,
        w,
        h,
        imageStore.frame.phoneHeaderEnabled && frame.phoneHeaderExpand,
        isLandscapePhone,
      )

      imageStore.setRenderedImage(roundedCanvas, true) // Set only original image, not tmpRenderedImage

      const overlayImage = imageStore.overlayImage
      if (overlayImage) {
        const roundedOverlay = applyRoundedCorners(
          overlayImage,
          radius,
          w,
          h,
          imageStore.frame.phoneHeaderEnabled && frame.phoneHeaderExpand,
          isLandscapePhone,
        )

        imageStore.overlayImage = roundedOverlay
      }
    }

    //Orientation settings
    if (isLandscapePhone) {
      // Rotate whole SVG via CSS
      el.style.transform = 'rotate(-90deg) translateX(-100%)'
      el.style.transformOrigin = 'top left'
    } else {
      // Reset for portrait
      el.style.transform = ''
      el.style.transformOrigin = ''
    }

    el.setAttribute('width', svgWidth)
    el.setAttribute('height', svgHeight)
    el.style.width = `${svgWidth}px`
    el.style.height = `${svgHeight}px`
  }

  /**
   * Apply rounded corners clipping to image
   *
   * @param {CanvasImageSource} srcImage
   * @param {number} radius
   * @param {number} w
   * @param {number} h
   * @param {boolean} hasPhoneHeader
   *
   * @returns {HTMLCanvasElement}
   */
  const applyRoundedCorners = (
    srcImage,
    radius,
    w,
    h,
    hasPhoneHeader,
    isLandscapePhone = false,
  ) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    const path = new Path2D()

    if (isLandscapePhone) {
      if (hasPhoneHeader) {
        path.moveTo(0, 0)
        path.lineTo(0, h)
        path.lineTo(w - radius, h)
        path.quadraticCurveTo(w, h, w, h - radius)
        path.lineTo(w, radius)
        path.quadraticCurveTo(w, 0, w - radius, 0)
        path.lineTo(0, 0)
      } else {
        path.moveTo(0, radius)
        path.lineTo(0, h - radius)
        path.quadraticCurveTo(0, h, radius, h)
        path.lineTo(w - radius, h)
        path.quadraticCurveTo(w, h, w, h - radius)
        path.lineTo(w, radius)
        path.quadraticCurveTo(w, 0, w - radius, 0)
        path.lineTo(radius, 0)
        path.quadraticCurveTo(0, 0, 0, radius)
      }
    } else {
      if (hasPhoneHeader) {
        path.moveTo(0, 0)
        path.lineTo(w, 0)
        path.lineTo(w, h - radius)
        path.quadraticCurveTo(w, h, w - radius, h)
        path.lineTo(radius, h)
        path.quadraticCurveTo(0, h, 0, h - radius)
        path.lineTo(0, 0)
      } else {
        path.moveTo(radius, 0)
        path.lineTo(w - radius, 0)
        path.quadraticCurveTo(w, 0, w, radius)
        path.lineTo(w, h - radius)
        path.quadraticCurveTo(w, h, w - radius, h)
        path.lineTo(radius, h)
        path.quadraticCurveTo(0, h, 0, h - radius)
        path.lineTo(0, radius)
        path.quadraticCurveTo(0, 0, radius, 0)
      }
    }

    path.closePath()

    ctx.save()
    ctx.clip(path)
    ctx.drawImage(srcImage, 0, 0)
    ctx.restore()

    return canvas
  }

  /**
   * Calculate layout inside the frame based on frame settings and file dimensions
   * @param {Object} fileDimensions - Original file dimensions { width, height }
   * @returns {Object} - Calculated layout { finalWidth, finalHeight, targetWidth, targetHeight, offsetX, offsetY }
   */
  const calculateFrameLayout = (fileDimensions) => {
    const frame = imageStore.frame

    const hasHeader = isFrameWithHeader(frame.type)
    const hasFooter = isFrameWithFooter(frame.type)
    const phoneFrame = isPhoneFrame(frame.type)
    const phoneFrameWithExpandedHeader = isPhoneHeaderWithExpandedHeader(
      frame.type,
      frame.phoneHeaderExpand,
    )
    const phoneWithButtons = frame.phoneButtonsEnabled
    const isLandscapePhoneValue = isLandscapePhone(frame.type, frame.phoneFrameOrientation)

    // Target size (image inside frame)
    let targetWidth = fileDimensions.width
    let targetHeight = fileDimensions.height

    let finalWidth = fileDimensions.width
    let finalHeight = fileDimensions.height

    console.warn('Initial file dimensions:', { targetWidth, targetHeight, finalWidth, finalHeight })

    if (phoneFrame && !phoneWithButtons) {
      if (isLandscapePhoneValue) {
        finalHeight -= (frame.width / 3) * 2 // remove space for side buttons if not drawn
      } else {
        finalWidth -= (frame.width / 3) * 2 // remove space for side buttons if not drawn
      }
    }

    if (frame.enabled) {
      // always remove left + right frame
      if (isLandscapePhoneValue) {
        targetWidth -= 2 * frame.height
      } else {
        targetWidth -= 2 * frame.width
      }

      // always remove top + bottom frame
      if (isLandscapePhoneValue) {
        targetHeight -= 2 * frame.width
      } else {
        targetHeight -= 2 * frame.height
      }

      // header / footer are EXTRA space inside frame
      if ((hasHeader && !phoneFrame) || (hasHeader && phoneFrame && phoneFrameWithExpandedHeader)) {
        if (isLandscapePhoneValue) {
          targetWidth -= frame.headerSize
          // targetWidth += frame.height
        } else {
          targetHeight -= frame.headerSize
          if (!phoneFrame) {
            targetHeight += frame.height
          }
        }
      }

      if (hasFooter) {
        targetHeight -= frame.footerSize
        targetHeight += frame.height
      }
    }

    // Offsets inside frame
    const adjustmentForPhoneButtons = frame.phoneButtonsEnabled ? 0 : frame.width / 3

    let offsetX = 0

    if (frame.enabled) {
      if (isLandscapePhoneValue) {
        if (phoneFrameWithExpandedHeader) {
          offsetX = frame.height + frame.headerSize
        } else {
          offsetX = frame.height
        }
      } else {
        offsetX = frame.width - adjustmentForPhoneButtons
      }
    }

    let offsetY = 0

    if (frame.enabled) {
      if (isLandscapePhoneValue) {
        offsetY = frame.width - adjustmentForPhoneButtons
      } else {
        if (hasHeader) {
          if (phoneFrameWithExpandedHeader && phoneFrame) {
            offsetY = frame.headerSize + frame.height
          } else if (hasHeader && !phoneFrame) {
            offsetY = frame.headerSize
          } else {
            offsetY = frame.height
          }
        } else {
          offsetY = frame.height
        }
      }
    }

    console.warn('Calculated frame layout:', {
      finalWidth,
      finalHeight,
      targetWidth,
      targetHeight,
      offsetX,
      offsetY,
    })

    return {
      finalWidth,
      finalHeight,
      targetWidth,
      targetHeight,
      offsetX,
      offsetY,
    }
  }

  return {
    frameColor,
    frameWidthRef,
    frameWidth,
    setFrameWidth,
    applyFrameRender,
    selectedFrameVariant,
    frameOptions,
    handleFrameChange,
    drawOutline,
    phoneOutlineColor,
    setPhoneOutlineColor,
    drawPhoneOutline,
    setPhoneOutline,
    setFrameColor,
    setFrameOutline,
    setPhoneHeader,
    drawPhoneHeader,
    phoneHeaderTextColor,
    setPhoneHeaderTextColor,
    phoneHeaderBackgroundColor,
    setPhoneHeaderBackgroundColor,
    phoneHeaderTimeInMinutes,
    setPhoneHeaderTimeInMinutes,
    isFrameWithHeader,
    isFrameWithFooter,
    isPhoneFrame,
    isLandscapePhone,
    isFrameWithOutline,
    isFrameWithMultiplier,
    isPhoneHeaderWithExpandedHeader,
    drawPhoneButtons,
    setPhoneButtons,
    phoneButtonsCanBeDrawn,
    drawPhoneNavigation,
    setPhoneNavigation,
    headerOverlap,
    setHeaderOverlap,
    useMillimeters,
    setUseMillimeters,
    frameWidthMm,
    setFrameWidthMm,
    maxFrameWidthMm,
    setHeaderSize,
    setHeaderSizeMm,
    setFooterSize,
    setFooterSizeMm,
    maxHeaderFooterSize,
    headerSize,
    headerSizeMm,
    footerSize,
    footerSizeMm,
    userSetHeaderSizeMm,
    setUserSetHeaderSizeMm,
    resetUserSetHeaderSizeMm,
    minUserSetHeaderSizeMm,
    maxUserSetHeaderSizeMm,
    calculateFrameLayout,
    phoneOutlineSize,
    phoneOutlineSizeOptions,
    setPhoneOutlineSize,
    phoneHeaderIconsSize,
    setPhoneHeaderIconsSize,
    phoneHeaderIconsSizeOptions,
    phoneBatteryIconStyle,
    setPhoneBatteryIconStyle,
    phoneBatteryIconStyleOptions,
    phoneFrameOrientation,
    setPhoneFrameOrientation,
    phoneFrameOrientationOptions,
    showOnlyInPortraitMode,
  }
}
