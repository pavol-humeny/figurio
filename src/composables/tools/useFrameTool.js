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

  // function applyBrowserFrame(ctx, w, h, type, color) {
  //   const headerHeight = imageStore.frame.headerSize

  //   // const headerHeight = Math.floor(0.04 * imageStore.fileDimensions.height) // 4% of height

  //   const borderSize = imageStore.frame.width
  //   // const borderSize = Math.floor((1 / 200) * imageStore.fileDimensions.height)

  //   imageStore.frame.width = borderSize
  //   imageStore.frame.height = borderSize

  //   imageStore.frame.headerSize = headerHeight

  //   console.log(
  //     '!!!!!!!!!!!!!!!!!Applying browser frame:',
  //     type,
  //     'with header height:',
  //     headerHeight,
  //     'and border size:',
  //     borderSize,
  //   )

  //   // Kresli hlavičku (hore)
  //   ctx.fillStyle = color
  //   ctx.fillRect(0, 0, w, headerHeight)

  //   // Rámiky
  //   ctx.fillRect(0, 0, borderSize, h) // ľavý
  //   ctx.fillRect(w - borderSize, 0, borderSize, h) // pravý
  //   ctx.fillRect(0, h - borderSize, w, borderSize) // dolný

  //   if (type === 'mac') {
  //     const radius = Math.max(4, Math.min(headerHeight * 0.25, 8))
  //     const spacing = radius * 2 + 4 // 4px medzi kruhmi
  //     const startX = borderSize + radius // trochu posun od ľavého rámika
  //     const centerY = headerHeight / 2

  //     const colors = ['#ff5f56', '#ffbd2e', '#27c93f']

  //     colors.forEach((c, i) => {
  //       ctx.beginPath()
  //       ctx.fillStyle = c
  //       ctx.arc(startX + i * spacing, centerY, radius, 0, Math.PI * 2)
  //       ctx.fill()
  //     })
  //   }

  //   if (type === 'windows') {
  //     const size = Math.max(8, headerHeight * 0.3)
  //     const spacing = size + 8
  //     const centerY = headerHeight / 2
  //     const startX = w - borderSize - spacing * 2 - size - 1 // zarovnanie 3 ikon z prava

  //     // mínus (–)
  //     ctx.strokeStyle = '#fff'
  //     ctx.lineWidth = 2
  //     ctx.beginPath()
  //     ctx.moveTo(startX, centerY + 1)
  //     ctx.lineTo(startX + size, centerY + 1)
  //     ctx.stroke()

  //     // štvorec (▢)
  //     ctx.strokeRect(startX + spacing, centerY - size / 2, size, size)

  //     // krížik (×)
  //     const x = startX + spacing * 2
  //     ctx.beginPath()
  //     ctx.moveTo(x, centerY - size / 2)
  //     ctx.lineTo(x + size, centerY + size / 2)
  //     ctx.moveTo(x + size, centerY - size / 2)
  //     ctx.lineTo(x, centerY + size / 2)
  //     ctx.stroke()
  //   }
  // }

  // function applyPhoneFrame(ctx, w, h, type) {
  //   // TODO
  //   ctx.strokeStyle = '#000'
  //   ctx.lineWidth = 8
  //   ctx.strokeRect(4, 4, w - 8, h - 8)

  //   if (type === 'ios') {
  //     ctx.fillStyle = '#000'
  //     ctx.fillRect(w / 2 - 40, 0, 80, 20)
  //   }
  // }

  // const applyFrameRender = (ctx, canvasWidth, canvasHeight) => {
  //   console.log('Applying frame render')
  //   const frame = imageStore.frame
  //   if (!ctx || !frame?.enabled) return

  //   const color = frame.color
  //   const type = frame.type

  //   ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  //   switch (type) {
  //     case 'frameSolid': {
  //       const fw = frame.width
  //       const fh = frame.height
  //       ctx.fillStyle = color
  //       ctx.fillRect(0, 0, canvasWidth, fh) // top
  //       ctx.fillRect(0, canvasHeight - fh, canvasWidth, fh) // bottom
  //       ctx.fillRect(0, fh, fw, canvasHeight - fh * 2) // left
  //       ctx.fillRect(canvasWidth - fw, fh, fw, canvasHeight - fh * 2) // right
  //       break
  //     }

  //     case 'frameMacBrowser':
  //       applyBrowserFrame(ctx, canvasWidth, canvasHeight, 'mac', color)
  //       break

  //     case 'frameWindowsBrowser':
  //       applyBrowserFrame(ctx, canvasWidth, canvasHeight, 'windows', color)
  //       break

  //     case 'framePhoneIOS':
  //       applyPhoneFrame(ctx, canvasWidth, canvasHeight, 'ios')
  //       break

  //     case 'framePhoneAndroid':
  //       applyPhoneFrame(ctx, canvasWidth, canvasHeight, 'android')
  //       break

  //     default:
  //       console.warn(`Unknown frame type: ${type}`)
  //   }
  // }
  const applyFrameRender = (el) => {
    const ns = 'http://www.w3.org/2000/svg'
    const frame = imageStore.frame
    if (!frame?.enabled || !el) return

    const w = imageStore.fileDimensions.width
    const h = imageStore.fileDimensions.height
    const color = frame.color || '#000000'
    let fw = frame.width || 0
    let fh = frame.height || 0

    if (frame.type === 'frameMacBrowser' || frame.type === 'frameWindowsBrowser') {
      fw = Math.floor((1 / 200) * Math.max(w, h))
      fh = fw
      imageStore.frame.width = fw
      imageStore.frame.height = fh
      imageStore.frame.headerSize = Math.floor(0.04 * h)
    } else if (frame.type === 'framePhoneAndroid' || frame.type === 'framePhoneIOS') {
      fw = Math.floor((1 / 100) * Math.max(w, h))
      fh = fw
      imageStore.frame.width = fw
      imageStore.frame.height = fh
      imageStore.frame.headerSize = 0
    }

    const header = frame.headerSize || 0
    const svgWidth = w + fw * 2
    const svgHeight = h + fh * 2 + (header > 0 ? header - fh : 0)

    el.setAttribute('width', svgWidth)
    el.setAttribute('height', svgHeight)
    el.style.left = `-${fw}px`
    el.style.top = `-${header > 0 ? header : fh}px`

    // Vykreslenie podľa typu
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
      const radius = Math.max(4, Math.min(header * 0.25, 8))
      const spacing = radius * 2 + 4
      const startX = fw + radius
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
    } else if (frame.type === 'frameWindowsBrowser') {
      const headerRect = document.createElementNS(ns, 'rect')
      headerRect.setAttribute('x', 0)
      headerRect.setAttribute('y', 0)
      headerRect.setAttribute('width', svgWidth)
      headerRect.setAttribute('height', header)
      headerRect.setAttribute('fill', color)
      el.appendChild(headerRect)

      const iconGroup = document.createElementNS(ns, 'g')
      iconGroup.setAttribute('stroke', 'white')
      iconGroup.setAttribute('stroke-width', 2)

      const size = Math.max(8, header * 0.3)
      const spacing = size + 8
      const startX = svgWidth - fw - spacing * 2 - size - 1
      const centerY = header / 2

      // Minimize
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', startX)
      line.setAttribute('y1', centerY + 1)
      line.setAttribute('x2', startX + size)
      line.setAttribute('y2', centerY + 1)
      iconGroup.appendChild(line)

      // Maximize
      const rect = document.createElementNS(ns, 'rect')
      rect.setAttribute('x', startX + spacing)
      rect.setAttribute('y', centerY - size / 2)
      rect.setAttribute('width', size)
      rect.setAttribute('height', size)
      iconGroup.appendChild(rect)

      // Close
      const cross = document.createElementNS(ns, 'path')
      const x = startX + spacing * 2
      cross.setAttribute(
        'd',
        `M ${x},${centerY - size / 2} L ${x + size},${centerY + size / 2} M ${x + size},${
          centerY - size / 2
        } L ${x},${centerY + size / 2}`,
      )
      iconGroup.appendChild(cross)

      el.appendChild(iconGroup)

      // Outline
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
    } else if (frame.type === 'framePhoneIOS') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', fw)

      // Dimensions and offsets
      const outerRadius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06)
      const r = outerRadius
      const offset = fw / 2
      const left = offset
      const top = offset
      const right = svgWidth - offset
      const bottom = svgHeight - offset

      // Outline
      const d = [
        `M ${left + r} ${top}`,
        `H ${right - r}`,
        `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
        `V ${bottom - r}`,
        `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
        `H ${left + r}`,
        `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
        `V ${top + r}`,
        `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
        'Z',
      ].join(' ')

      outline.setAttribute('d', d)
      el.appendChild(outline)

      // Dynamic island
      const notchWidth = Math.min(Math.floor(svgWidth * 0.22), 150)
      const notchHeight = Math.floor(svgHeight * 0.035)
      const notchRadius = Math.floor(notchHeight * 0.45)
      const notchMarginTop = Math.floor(svgHeight * 0.015)

      const notch = document.createElementNS(ns, 'rect')
      notch.setAttribute('x', svgWidth / 2 - notchWidth / 2)
      notch.setAttribute('y', top + notchMarginTop)
      notch.setAttribute('width', notchWidth)
      notch.setAttribute('height', notchHeight)
      notch.setAttribute('rx', notchRadius)
      notch.setAttribute('ry', notchRadius)
      notch.setAttribute('fill', '#000')
      el.appendChild(notch)

      // Camera
      const camera = document.createElementNS(ns, 'circle')
      camera.setAttribute('cx', svgWidth / 2 + notchWidth * 0.2)
      camera.setAttribute('cy', top + notchMarginTop + notchHeight / 2)
      camera.setAttribute('r', notchHeight * 0.15)
      camera.setAttribute('fill', '#1e88e5')
      el.appendChild(camera)
    } else if (frame.type === 'framePhoneAndroid') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', fw)

      // Dimensions and offsets
      const outerRadius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06)
      const r = outerRadius
      const offset = fw / 2
      const left = offset
      const top = offset
      const right = svgWidth - offset
      const bottom = svgHeight - offset

      // Outline
      const d = [
        `M ${left + r} ${top}`,
        `H ${right - r}`,
        `A ${r} ${r} 0 0 1 ${right} ${top + r}`,
        `V ${bottom - r}`,
        `A ${r} ${r} 0 0 1 ${right - r} ${bottom}`,
        `H ${left + r}`,
        `A ${r} ${r} 0 0 1 ${left} ${bottom - r}`,
        `V ${top + r}`,
        `A ${r} ${r} 0 0 1 ${left + r} ${top}`,
        'Z',
      ].join(' ')

      outline.setAttribute('d', d)
      el.appendChild(outline)

      // Camera circle
      const camera = document.createElementNS(ns, 'circle')
      const cameraRadius = Math.floor(svgHeight * 0.012)
      const cameraOffset = Math.floor(svgHeight * 0.03)

      camera.setAttribute('cx', svgWidth / 2)
      camera.setAttribute('cy', top + cameraOffset)
      camera.setAttribute('r', cameraRadius)
      camera.setAttribute('fill', '#000')
      el.appendChild(camera)
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
