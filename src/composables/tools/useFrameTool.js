import { ref, watch, computed } from 'vue'

export function useFrameTool(imageStore, historyStore, editorStore, t) {
  const frameColor = ref(imageStore.frame.color || '#000000')
  const frameWidth = ref(imageStore.frame.width || 0)
  const frameWidthRef = ref(null)

  const frameOptions = computed(() => [
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
      label: t('tools.frame.settings.general.frameVariants.framePhoneAndroid'),
      value: 'framePhoneAndroid',
    },
  ])

  const selectedFrameVariant = ref(imageStore.frame.type || 'none')

  const handleFrameChange = (value) => {
    console.log('Selected frame variant:', value)
    imageStore.frame.type = value
    // Apply frame

    applyFrame()
  }

  // watch color
  watch(frameColor, (newColor) => {
    if (newColor) {
      applyFrame()
    }
  })

  // watch type
  watch(selectedFrameVariant, (newType) => {
    if (newType !== 'frameSolid') {
      frameWidth.value = 0
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
    const width = frameWidth.value
    const color = frameColor.value
    const type = selectedFrameVariant.value

    imageStore.frame.color = color
    imageStore.frame.type = type
    imageStore.frame.enabled = true

    if (selectedFrameVariant.value === 'none') {
      imageStore.frame.enabled = false
      imageStore.frame.width = 0
      imageStore.frame.height = 0
    } else if (selectedFrameVariant.value === 'frameSolid') {
      imageStore.frame.width = width
      imageStore.frame.height = width

      if (width <= 0) {
        imageStore.frame.enabled = false
      }
    }
    // else if (
    //   selectedFrameVariant.value === 'framePhoneAndroid' ||
    //   selectedFrameVariant.value === 'framePhoneIOS'
    // ) {
    //   // For phone Android frame, we can use a fixed width
    //   imageStore.frame.width = 5
    //   imageStore.frame.height = 5
    // } else if (
    //   selectedFrameVariant.value === 'frameMacBrowser' ||
    //   selectedFrameVariant.value === 'frameWindowsBrowser'
    // ) {
    //   // For other frames, we can use a fixed width
    //   imageStore.frame.width = Math.floor((1 / 200) * imageStore.fileDimensions.height)
    //   imageStore.frame.height = Math.floor((1 / 200) * imageStore.fileDimensions.height)
    //   imageStore.frame.headerSize = Math.floor(0.04 * imageStore.fileDimensions.height) // 4% of height
    // }

    historyStore.push(imageStore.getSnapshot())
  }

  function applyBrowserFrame(ctx, w, h, type, color) {
    const headerHeight = imageStore.frame.headerSize

    // const headerHeight = Math.floor(0.04 * imageStore.fileDimensions.height) // 4% of height

    const borderSize = imageStore.frame.width
    // const borderSize = Math.floor((1 / 200) * imageStore.fileDimensions.height)

    imageStore.frame.width = borderSize
    imageStore.frame.height = borderSize

    imageStore.frame.headerSize = headerHeight

    console.log(
      '!!!!!!!!!!!!!!!!!Applying browser frame:',
      type,
      'with header height:',
      headerHeight,
      'and border size:',
      borderSize,
    )

    // Kresli hlavičku (hore)
    ctx.fillStyle = color
    ctx.fillRect(0, 0, w, headerHeight)

    // Rámiky
    ctx.fillRect(0, 0, borderSize, h) // ľavý
    ctx.fillRect(w - borderSize, 0, borderSize, h) // pravý
    ctx.fillRect(0, h - borderSize, w, borderSize) // dolný

    if (type === 'mac') {
      const radius = Math.max(4, Math.min(headerHeight * 0.25, 8))
      const spacing = radius * 2 + 4 // 4px medzi kruhmi
      const startX = borderSize + radius // trochu posun od ľavého rámika
      const centerY = headerHeight / 2

      const colors = ['#ff5f56', '#ffbd2e', '#27c93f']

      colors.forEach((c, i) => {
        ctx.beginPath()
        ctx.fillStyle = c
        ctx.arc(startX + i * spacing, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    if (type === 'windows') {
      const size = Math.max(8, headerHeight * 0.3)
      const spacing = size + 8
      const centerY = headerHeight / 2
      const startX = w - borderSize - spacing * 2 - size - 1 // zarovnanie 3 ikon z prava

      // mínus (–)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(startX, centerY + 1)
      ctx.lineTo(startX + size, centerY + 1)
      ctx.stroke()

      // štvorec (▢)
      ctx.strokeRect(startX + spacing, centerY - size / 2, size, size)

      // krížik (×)
      const x = startX + spacing * 2
      ctx.beginPath()
      ctx.moveTo(x, centerY - size / 2)
      ctx.lineTo(x + size, centerY + size / 2)
      ctx.moveTo(x + size, centerY - size / 2)
      ctx.lineTo(x, centerY + size / 2)
      ctx.stroke()
    }
  }

  function applyPhoneFrame(ctx, w, h, type) {
    // TODO
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, w - 8, h - 8)

    if (type === 'ios') {
      ctx.fillStyle = '#000'
      ctx.fillRect(w / 2 - 40, 0, 80, 20)
    }
  }

  const applyFrameRender = (ctx, canvasWidth, canvasHeight) => {
    console.log('Applying frame render')
    const frame = imageStore.frame
    if (!ctx || !frame?.enabled) return

    const color = frame.color
    const type = frame.type

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    switch (type) {
      case 'frameSolid': {
        const fw = frame.width
        const fh = frame.height
        ctx.fillStyle = color
        ctx.fillRect(0, 0, canvasWidth, fh) // top
        ctx.fillRect(0, canvasHeight - fh, canvasWidth, fh) // bottom
        ctx.fillRect(0, fh, fw, canvasHeight - fh * 2) // left
        ctx.fillRect(canvasWidth - fw, fh, fw, canvasHeight - fh * 2) // right
        break
      }

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
