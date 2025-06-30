import { ref, watch, computed } from 'vue'

export function useFrameTool(imageStore, historyStore, editorStore, t) {
  const frameColor = ref(imageStore.imageOperations.frame.color || '#000000')
  const frameWidth = ref(imageStore.imageOperations.frame.width || 0)
  const frameWidthRef = ref(null)

  const frameOptions = computed(() => [
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

  const selectedFrameVariant = ref('frameSolid')

  const handleFrameChange = (value) => {
    console.log('Selected frame variant:', value)
    imageStore.imageOperations.frame.type = value
    // Apply frame

    applyFrame()
  }

  // watch color
  watch(frameColor, (newColor) => {
    if (newColor) {
      applyFrame()
    }
  })

  const setFrameWidth = (width) => {
    if (width <= 0) {
      width = 0
    }
    frameWidth.value = width
    frameWidthRef.value.setValue(width)
    applyFrame()
  }

  const applyFrame = () => {
    console.log('Applying frame with color:', frameColor.value, 'and width:', frameWidth.value)
    const width = frameWidth.value
    const color = frameColor.value
    const type = selectedFrameVariant.value

    imageStore.imageOperations.frame.color = color
    imageStore.imageOperations.frame.type = type
    imageStore.imageOperations.frame.enabled = true

    if (selectedFrameVariant.value === 'frameSolid') {
      if (width <= 0) {
        imageStore.imageOperations.frame.enabled = false
      } else {
        imageStore.imageOperations.frame.width = width
        imageStore.imageOperations.frame.height = width
      }
    } else if (
      selectedFrameVariant.value === 'framePhoneAndroid' ||
      selectedFrameVariant.value === 'framePhoneIOS'
    ) {
      // For phone Android frame, we can use a fixed width
      imageStore.imageOperations.frame.width = 5
      imageStore.imageOperations.frame.height = 5
    } else if (
      selectedFrameVariant.value === 'frameMacBrowser' ||
      selectedFrameVariant.value === 'frameWindowsBrowser'
    ) {
      // For other frames, we can use a fixed width
      imageStore.imageOperations.frame.width = 5
      imageStore.imageOperations.frame.height = 5
    }

    historyStore.push(imageStore.getSnapshot())
  }

  // const applyFrameRender = () => {
  //   const sourceCanvas = imageStore.renderedImage
  //   if (!sourceCanvas) return

  //   // Use different frame for different variants
  //   switch (imageStore.imageOperations.frame.type) {
  //     case 'frameSolid':
  //       break
  //     case 'frameMacBrowser':
  //       break
  //     case 'frameWindowsBrowser':
  //       break
  //     case 'framePhoneIOS':
  //       break
  //     case 'framePhoneAndroid':
  //       break
  //   }

  //   const fw = imageStore.imageOperations.frame.width
  //   const newWidth = imageStore.fileDimensions.width + fw * 2
  //   const newHeight = imageStore.fileDimensions.height + fw * 2

  //   const canvas = document.createElement('canvas')
  //   canvas.width = newWidth
  //   canvas.height = newHeight

  //   const ctx = canvas.getContext('2d')

  //   // Draw frame
  //   ctx.fillStyle = imageStore.imageOperations.frame.color
  //   ctx.fillRect(0, 0, newWidth, newHeight)

  //   // Draw the original image in the center
  //   ctx.drawImage(sourceCanvas, fw, fw)

  //   // Update store
  //   imageStore.renderedImage = canvas
  // }
  const applySolidFrame = () => {
    const sourceCanvas = imageStore.renderedImage
    if (!sourceCanvas) return

    const fw = imageStore.imageOperations.frame.width
    const newWidth = imageStore.fileDimensions.width + fw * 2
    const newHeight = imageStore.fileDimensions.height + fw * 2

    const canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight

    const ctx = canvas.getContext('2d')

    // Draw frame
    ctx.fillStyle = imageStore.imageOperations.frame.color
    ctx.fillRect(0, 0, newWidth, newHeight)

    // Draw the original image in the center
    ctx.drawImage(sourceCanvas, fw, fw)

    // Update store
    imageStore.renderedImage = canvas
  }

  const applyPhoneAndroidFrame = () => {}
  const applyPhoneIOSFrame = () => {}
  const applyMacBrowserFrame = () => {}
  const applyWindowsBrowserFrame = () => {}

  const applyFrameRender = () => {
    const type = imageStore.imageOperations.frame.type

    if (imageStore.imageOperations.frame.enabled === false) {
      // Skip rendering if frame is not enabled
      return
    }

    switch (type) {
      case 'frameSolid':
        applySolidFrame()
        break
      case 'framePhoneAndroid':
        applyPhoneAndroidFrame()
        break
      case 'frameMacBrowser':
        applyMacBrowserFrame()
        break
      case 'frameWindowsBrowser':
        applyWindowsBrowserFrame()
        break
      case 'framePhoneIOS':
        applyPhoneIOSFrame()
        break
      default:
        console.warn(`Unknown frame type: ${type}`)
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
  }
}
