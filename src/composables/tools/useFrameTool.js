import { ref, watch, computed } from 'vue'

export function useFrameTool(imageStore, historyStore, editorStore, t) {
  const frameColor = ref(imageStore.frame.color || '#000000')
  const frameWidth = ref(imageStore.frame.width || 0)
  const frameWidthRef = ref(null)

  // UPDATE new frame type
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
    historyStore.push(imageStore.getSnapshot())
  }

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

  const applyFrameRender = (el) => {
    const ns = 'http://www.w3.org/2000/svg'
    const frame = imageStore.frame
    if (!frame?.enabled || !el) return

    const w = imageStore.fileDimensions.width
    const h = imageStore.fileDimensions.height
    const color = frame.color || '#000000'
    const contrastColor = getContrastColor(color)

    let fw = frame.width || 0
    let fh = frame.height || 0

    console.log('Applying frame render:', frame.type, 'with color:', color)
    console.log('Frame dimensions:', fw, fh)

    // UPDATE new frame type
    if (frame.type === 'frameMacBrowser' || frame.type === 'frameWindowsBrowser') {
      fw = Math.floor((1 / 200) * Math.max(w, h))
      fh = fw
      imageStore.frame.width = fw
      imageStore.frame.height = fh
      imageStore.frame.headerSize = Math.floor(0.04 * h)
    } else if (
      frame.type === 'framePhoneAndroid' ||
      frame.type === 'framePhoneAndroid2' ||
      frame.type === 'framePhoneIOS' ||
      frame.type === 'framePhoneIOS2'
    ) {
      fw = Math.floor((1 / 100) * Math.max(w, h))
      console.log('Calculated frame width:', fw)
      fh = fw
      imageStore.frame.width = fw
      imageStore.frame.height = fh
      imageStore.frame.headerSize = 0
    } else {
      imageStore.frame.headerSize = 0
    }

    const header = frame.headerSize || 0
    const svgWidth = w + fw * 2
    const svgHeight = h + fh * 2 + (header > 0 ? header - fh : 0)

    el.setAttribute('width', svgWidth)
    el.setAttribute('height', svgHeight)
    el.style.left = `-${fw}px`
    el.style.top = `-${header > 0 ? header : fh}px`

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

      const strokeWidth = Math.max(1, Math.floor(header * 0.07))

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
      line.setAttribute('y1', centerY + 1)
      line.setAttribute('x2', startX + size)
      line.setAttribute('y2', centerY + 1)
      iconGroup.appendChild(line)

      // Maximize
      const maximizeScale = 0.1
      const rect = document.createElementNS(ns, 'rect')
      rect.setAttribute('x', startX + spacing + size * maximizeScale)
      rect.setAttribute('y', centerY - size / 2 + size * maximizeScale)
      rect.setAttribute('width', size - size * maximizeScale * 2)
      rect.setAttribute('height', size - size * maximizeScale * 2)
      rect.setAttribute('fill', color)
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
      const offset = fw
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
      const notchWidth = Math.max(Math.floor(svgWidth * 0.22), 150)
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
      notch.setAttribute('fill', color)
      el.appendChild(notch)

      // Camera
      const camera = document.createElementNS(ns, 'circle')
      camera.setAttribute('cx', svgWidth / 2 + notchWidth * 0.2)
      camera.setAttribute('cy', top + notchMarginTop + notchHeight / 2)
      camera.setAttribute('r', notchHeight * 0.15)
      camera.setAttribute('fill', contrastColor)
      el.appendChild(camera)
    } else if (frame.type === 'framePhoneIOS2') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', fw)

      // Dimensions and offsets
      const outerRadius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06)
      const r = outerRadius
      const offset = fw
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

      // Notch with rounded bottom corners and top arcs
      const notchWidth = Math.max(Math.floor(svgWidth * 0.26), 150)
      const notchHeight = Math.floor(svgHeight * 0.04)
      const notchRadius = notchHeight / 2

      const nw = notchWidth
      const nh = notchHeight
      const nx = svgWidth / 2 - nw / 2
      const ny = top + fh / 2 - 1
      const r2 = notchRadius
      const arcR = nh * 0.4

      const notch = document.createElementNS(ns, 'path')

      const notchPath = [
        // Left top arc
        `M ${nx - arcR} ${ny}`,
        `A ${arcR} ${arcR} 0 0 1 ${nx} ${ny + arcR}`,

        // Right side
        `V ${ny + nh - r2}`,
        `A ${r2} ${r2} 0 0 0 ${nx + r2} ${ny + nh}`,
        `H ${nx + nw - r2}`,
        `A ${r2} ${r2} 0 0 0 ${nx + nw} ${ny + nh - r2}`,
        `V ${ny + arcR}`,

        // Right top arc
        `A ${arcR} ${arcR} 0 0 1 ${nx + nw + arcR} ${ny}`,
        'Z',
      ].join(' ')

      notch.setAttribute('d', notchPath)
      notch.setAttribute('fill', color)
      el.appendChild(notch)

      // Speaker (slim oval)
      const speaker = document.createElementNS(ns, 'rect')
      const speakerWidth = Math.floor(nw * 0.3)
      const speakerHeight = Math.floor(nh * 0.2)
      const speakerX = svgWidth / 2 - speakerWidth / 2
      const speakerY = ny + nh * 0.25 + fh / 2
      speaker.setAttribute('x', speakerX)
      speaker.setAttribute('y', speakerY)
      speaker.setAttribute('width', speakerWidth)
      speaker.setAttribute('height', speakerHeight)
      speaker.setAttribute('rx', speakerHeight / 2)
      speaker.setAttribute('ry', speakerHeight / 2)
      speaker.setAttribute('fill', contrastColor)
      el.appendChild(speaker)

      // Camera (small circle)
      const camera = document.createElementNS(ns, 'circle')
      const cameraRadius = speakerHeight / 1.5
      camera.setAttribute('cx', svgWidth / 2 + nw * 0.25)
      camera.setAttribute('cy', speakerY + speakerHeight / 2)
      camera.setAttribute('r', cameraRadius)
      camera.setAttribute('fill', contrastColor)
      el.appendChild(camera)
    } else if (frame.type === 'framePhoneAndroid') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', fw)

      // Dimensions and offsets
      const outerRadius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06)
      const r = outerRadius
      // const offset = fw / 2
      const offset = fw
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
      camera.setAttribute('fill', color)
      el.appendChild(camera)
    } else if (frame.type === 'framePhoneAndroid2') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', fw)

      // Dimensions and offsets
      const outerRadius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06)
      const r = outerRadius
      const offset = fw
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

      // Drop notch
      const dropHeight = svgHeight * 0.055
      const dropWidth = dropHeight * 1.05
      const arcRadius = 0.5 * dropHeight

      const dropCenterX = svgWidth / 2
      const dropTopY = top + fh / 2 - 1
      const leftDrop = dropCenterX - dropWidth / 2
      const rightDrop = dropCenterX + dropWidth / 2
      const bottomDrop = dropTopY + dropHeight

      const dropPath = document.createElementNS(ns, 'path')

      const path = [
        // Start to the left of the notch (arc transition into the notch)
        `M ${leftDrop - arcRadius} ${dropTopY}`,
        `A ${arcRadius} ${arcRadius} 0 0 1 ${leftDrop} ${dropTopY + arcRadius}`,

        // Right edge of the rectangle with rounded bottom right corner
        `V ${bottomDrop - arcRadius}`,
        `A ${arcRadius} ${arcRadius} 0 0 0 ${leftDrop + arcRadius} ${bottomDrop}`,

        // Bottom edge
        `H ${rightDrop - arcRadius}`,

        // Bottom left corner
        `A ${arcRadius} ${arcRadius} 0 0 0 ${rightDrop} ${bottomDrop - arcRadius}`,

        // Right edge up to the notch
        `V ${dropTopY + arcRadius}`,

        // Final right top arc
        `A ${arcRadius} ${arcRadius} 0 0 1 ${rightDrop + arcRadius} ${dropTopY}`,

        'Z',
      ].join(' ')

      dropPath.setAttribute('d', path)
      dropPath.setAttribute('fill', color)
      el.appendChild(dropPath)

      // Camera in the center of the drop notch
      const camera = document.createElementNS(ns, 'circle')
      const cameraRadius = dropHeight * 0.18
      const cameraCX = dropCenterX
      const cameraCY = bottomDrop - dropHeight / 2

      camera.setAttribute('cx', cameraCX)
      camera.setAttribute('cy', cameraCY)
      camera.setAttribute('r', cameraRadius)
      camera.setAttribute('fill', contrastColor)
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
