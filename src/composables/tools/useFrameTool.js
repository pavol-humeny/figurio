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
    if (width < 0) {
      width = 0
    }
    frameWidthRef.value.setValue(width)
    frameWidth.value = width
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

    console.log('Width:', width, 'Color:', color, 'Type:', type)

    if (selectedFrameVariant.value === 'frameSolid') {
      imageStore.imageOperations.frame.width = width
      imageStore.imageOperations.frame.height = width

      if (width <= 0) {
        imageStore.imageOperations.frame.enabled = false
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

  function applyBrowserFrame(ctx, w, h, type, color) {
    const headerHeight = 30
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, headerHeight)

    if (type === 'mac') {
      const r = 6
      const padding = 10
      const colors = ['#ff5f56', '#ffbd2e', '#27c93f']
      colors.forEach((c, i) => {
        ctx.beginPath()
        ctx.fillStyle = c
        ctx.arc(padding + i * 15, headerHeight / 2, r, 0, Math.PI * 2)
        ctx.fill()
      })
    } else if (type === 'windows') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(w - 50, 8, 10, 10)
      ctx.fillRect(w - 35, 8, 10, 10)
      ctx.beginPath()
      ctx.moveTo(w - 15, 8)
      ctx.lineTo(w - 5, 18)
      ctx.strokeStyle = '#fff'
      ctx.stroke()
    }
  }

  function applyPhoneFrame(ctx, w, h, type) {
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, w - 8, h - 8)

    if (type === 'ios') {
      ctx.fillStyle = '#000'
      ctx.fillRect(w / 2 - 40, 0, 80, 20)
    }
  }

  const applyFrameRender = (ctx, canvasWidth, canvasHeight) => {
    const frame = imageStore.imageOperations.frame
    if (!ctx || !frame?.enabled) return

    const fw = frame.width
    const fh = frame.height
    const color = frame.color
    const type = frame.type

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    switch (type) {
      case 'frameSolid':
        ctx.fillStyle = color
        ctx.fillRect(0, 0, canvasWidth, fh) // top
        ctx.fillRect(0, canvasHeight - fh, canvasWidth, fh) // bottom
        ctx.fillRect(0, fh, fw, canvasHeight - fh * 2) // left
        ctx.fillRect(canvasWidth - fw, fh, fw, canvasHeight - fh * 2) // right
        break

      case 'frameMacBrowser':
        applyBrowserFrame(ctx, canvasWidth, canvasHeight, 'mac', color)
        break

      case 'frameWindowsBrowser':
        applyBrowserFrame(ctx, canvasWidth, canvasHeight, 'windows', color)
        break

      case 'framePhoneIOS':
        applyPhoneFrame(ctx, canvasWidth, canvasHeight, 'ios')
        break

      case 'framePhoneAndroid':
        applyPhoneFrame(ctx, canvasWidth, canvasHeight, 'android')
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
