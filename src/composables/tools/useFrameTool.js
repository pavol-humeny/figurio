import { ref, watch, computed } from 'vue'
import { useToastModal } from '../modals/useToastModal'

export function useFrameTool(imageStore, historyStore, editorStore, t) {
  const { showToastModal } = useToastModal()

  const frameColor = ref(imageStore.frame.color || '#000000')
  watch(
    () => imageStore.frame.color,
    (newColor) => {
      frameColor.value = newColor
    },
  )
  const frameWidth = ref(imageStore.frame.width || 0)
  watch(
    () => imageStore.frame.width,
    (newWidth) => {
      frameWidth.value = newWidth
    },
  )
  const drawOutline = ref(false)
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
    {
      label: t('tools.frame.settings.general.frameVariants.framePhoneSimple'),
      value: 'framePhoneSimple',
    },
    {
      label: t('tools.frame.settings.general.frameVariants.frameWindowsTaskBar'),
      value: 'frameWindowsTaskBar',
    },
  ])

  const selectedFrameVariant = computed(() => imageStore.frame.type || 'none')

  const handleFrameChange = (value) => {
    console.log('Selected frame variant:', value)
    imageStore.frame.type = value

    applyFrame()
  }

  // Color
  const setFrameColor = (color) => {
    frameColor.value = color
    if (frameWidth.value > 0) {
      applyFrame()
    }
  }

  // watch type
  watch(selectedFrameVariant, (newType) => {
    if (newType !== 'frameSolid') {
      frameWidth.value = 0
    }
    imageStore.phoneButtonsCanNotBeDrawnToastFlag = false // Reset flag when changing frame type
  })

  // drawOutline
  const setFrameOutline = (value) => {
    drawOutline.value = value
    applyFrame()
  }

  const setFrameWidth = (width) => {
    if (width < 0) {
      if (
        selectedFrameVariant.value === 'frameMacBrowser' ||
        selectedFrameVariant.value === 'frameWindowsBrowser' ||
        selectedFrameVariant.value === 'frameWindowsTaskBar'
      ) {
        width = Math.floor(
          (1 / 200) * Math.max(imageStore.fileDimensions.width, imageStore.fileDimensions.height),
        )
      } else {
        width = 0
      }
    }
    frameWidthRef.value.setValue(width)
    frameWidth.value = width
    applyFrame()
  }

  const applyFrame = () => {
    // TODO - copy without reference
    const width = frameWidth.value
    const color = frameColor.value
    const type = selectedFrameVariant.value
    const outlineEnabled = drawOutline.value

    imageStore.frame.color = color
    imageStore.frame.type = type
    imageStore.frame.enabled = true
    imageStore.frame.outlineEnabled = outlineEnabled

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
    } else {
      imageStore.frame.width = width
      imageStore.frame.height = width
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

  const applyFrameRender = (el, width = null, height = null, updateNewFrame = false) => {
    console.log('Applying frame render...')

    const ns = 'http://www.w3.org/2000/svg'
    const frame = imageStore.frame
    if (!frame?.enabled || !el) return

    const w = width ?? imageStore.fileDimensions.width
    const h = height ?? imageStore.fileDimensions.height
    const color = frame.color
    const contrastColor = getContrastColor(color)

    let fw = frame.width
    let fh = frame.height

    // UPDATE new frame type
    if (frame.type === 'frameMacBrowser' || frame.type === 'frameWindowsBrowser') {
      if (!frame.outlineEnabled) {
        fw = 0
        fh = 0
      }
      if (!updateNewFrame) {
        imageStore.frame.headerSize = Math.max(Math.floor(0.04 * h), 5)
        imageStore.frame.footerSize = 0
      } else {
        imageStore.newFrame.headerSize = Math.max(Math.floor(0.04 * h), 5)
        imageStore.newFrame.footerSize = 0
      }
    } else if (
      frame.type === 'framePhoneAndroid' ||
      frame.type === 'framePhoneAndroid2' ||
      frame.type === 'framePhoneIOS' ||
      frame.type === 'framePhoneIOS2' ||
      frame.type === 'framePhoneSimple'
    ) {
      fw = Math.max(Math.floor((1 / 100) * Math.max(w, h)), 2) * 1.5
      fh = fw / 1.5
      if (!updateNewFrame) {
        imageStore.frame.headerSize = 0
        imageStore.frame.footerSize = 0
      } else {
        imageStore.newFrame.headerSize = 0
        imageStore.newFrame.footerSize = 0
      }
    } else if (frame.type === 'frameWindowsTaskBar') {
      if (!frame.outlineEnabled) {
        fw = 0
        fh = 0
      }
      if (!updateNewFrame) {
        imageStore.frame.footerSize = Math.max(Math.floor(0.04 * h), 5)
        imageStore.frame.headerSize = 0
      } else {
        imageStore.newFrame.footerSize = Math.max(Math.floor(0.04 * h), 5)
        imageStore.newFrame.headerSize = 0
      }
    } else {
      if (!updateNewFrame) {
        imageStore.frame.headerSize = 0
        imageStore.frame.footerSize = 0
      } else {
        imageStore.newFrame.headerSize = 0
        imageStore.newFrame.footerSize = 0
      }
    }

    if (!updateNewFrame) {
      imageStore.frame.width = fw
      imageStore.frame.height = fh
    } else {
      imageStore.newFrame.width = fw
      imageStore.newFrame.height = fh
    }

    const header = frame.headerSize
    const footer = frame.footerSize
    const svgWidth = w + fw * 2
    const svgHeight = h + fh * 2 + (header > 0 ? header - fh : 0) + (footer > 0 ? footer - fh : 0)
    const phoneCornerRadius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06)

    // Values for phone frames
    const strokeWidth = (fw / 3) * 2 // 2/3 of frame width
    const offset = strokeWidth / 2

    const phoneFrameValues = {
      strokeWidth,
      radius: phoneCornerRadius,
      offset,
      left: strokeWidth,
      top: offset,
      right: svgWidth - strokeWidth,
      bottom: svgHeight - offset,
    }

    el.setAttribute('width', svgWidth)
    el.setAttribute('height', svgHeight)
    el.style.left = `-${fw}px`
    el.style.top = `-${header > 0 ? header : fh}px`

    // Button rendering function (rounded only on one side)
    const drawSideButton = (x, y, width, height, radius, side) => {
      const path = document.createElementNS(ns, 'path')

      const d =
        side !== 'right'
          ? [
              `M ${x + width} ${y}`, // top-right
              `H ${x + radius}`, // move left before corner
              `A ${radius} ${radius} 0 0 0 ${x} ${y + radius}`, // top-left corner
              `V ${y + height - radius}`, // down
              `A ${radius} ${radius} 0 0 0 ${x + radius} ${y + height}`, // bottom-left corner
              `H ${x + width}`, // right
              'Z',
            ]
          : [
              `M ${x} ${y}`, // top-left
              `H ${x + width - radius}`, // move right before corner
              `A ${radius} ${radius} 0 0 1 ${x + width} ${y + radius}`, // top-right corner
              `V ${y + height - radius}`, // down
              `A ${radius} ${radius} 0 0 1 ${x + width - radius} ${y + height}`, // bottom-right corner
              `H ${x}`, // left
              'Z',
            ]

      path.setAttribute('d', d.join(' '))
      path.setAttribute('fill', color)
      return path
    }

    const drawVolumeAndPowerButtons = () => {
      // Volume buttons (left side)
      const volumeButtonWidth = fw / 3 // 1/3 of frame width
      const volumeButtonHeight = volumeButtonWidth * 25
      const volumeButtonRadius = volumeButtonWidth
      const volumeButtonX = 0
      const volumeUpY = svgHeight * 0.22
      const volumeDownY = volumeUpY + volumeButtonHeight + volumeButtonWidth * 3

      if (volumeDownY + volumeButtonHeight + 50 + phoneCornerRadius > svgHeight) {
        if (!imageStore.phoneButtonsCanNotBeDrawnToastFlag) {
          showToastModal(
            'warning',
            t('tools.frame.settings.general.phoneButtonsCanNotBeDrawn.title'),
            t('tools.frame.settings.general.phoneButtonsCanNotBeDrawn.message'),
          )
          imageStore.phoneButtonsCanNotBeDrawnToastFlag = true
        }
        return
      }

      el.appendChild(
        drawSideButton(
          volumeButtonX,
          volumeUpY,
          volumeButtonWidth + fh * 0.3,
          volumeButtonHeight,
          volumeButtonRadius,
          'left',
        ),
      )

      el.appendChild(
        drawSideButton(
          volumeButtonX,
          volumeDownY,
          volumeButtonWidth + fh * 0.3,
          volumeButtonHeight,
          volumeButtonRadius,
          'left',
        ),
      )

      // Power button (right side)
      const powerButtonWidth = fw / 3 // 1/3 of frame width
      const powerButtonHeight = powerButtonWidth * 17
      const powerButtonRadius = powerButtonWidth
      const powerButtonX = svgWidth - powerButtonWidth
      const powerButtonY = svgHeight * 0.35

      el.appendChild(
        drawSideButton(
          powerButtonX - fh * 0.3,
          powerButtonY,
          powerButtonWidth + fh * 0.3,
          powerButtonHeight,
          powerButtonRadius,
          'right',
        ),
      )
    }
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
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', phoneFrameValues.strokeWidth)

      // Outline
      const d = [
        `M ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        `H ${phoneFrameValues.right - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right} ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `V ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right - phoneFrameValues.radius} ${phoneFrameValues.bottom}`,
        `H ${phoneFrameValues.left + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left} ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `V ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        'Z',
      ].join(' ')

      outline.setAttribute('d', d)
      el.appendChild(outline)

      let notchWidth, notchHeight
      const aspectRatio = 1 / 4
      if (svgWidth >= svgHeight) {
        notchWidth = Math.floor(svgWidth * 0.22)
        notchHeight = Math.floor(notchWidth * aspectRatio)
      } else {
        notchHeight = Math.floor(svgHeight * 0.035)
        notchWidth = Math.floor(notchHeight / aspectRatio)
      }

      const notchMarginTop = phoneFrameValues.strokeWidth * 1.5
      const notchRadius = Math.floor(notchHeight * 0.45)

      const notchX = svgWidth / 2 - notchWidth / 2
      const notchY = phoneFrameValues.top + notchMarginTop

      // Check if notch fits inside the frame area
      const notchPadding = 1.5
      const notchFits =
        notchX >= phoneFrameValues.left &&
        notchX + notchWidth * notchPadding <= phoneFrameValues.right &&
        notchY + notchHeight * notchPadding <= phoneFrameValues.bottom &&
        notchHeight >= 5

      if (notchFits) {
        const notch = document.createElementNS(ns, 'rect')
        notch.setAttribute('x', notchX)
        notch.setAttribute('y', notchY)
        notch.setAttribute('width', notchWidth)
        notch.setAttribute('height', notchHeight)
        notch.setAttribute('rx', notchRadius)
        notch.setAttribute('ry', notchRadius)
        notch.setAttribute('fill', color)
        el.appendChild(notch)

        // Camera
        const camera = document.createElementNS(ns, 'circle')
        camera.setAttribute('cx', svgWidth / 2 + notchWidth * 0.2)
        camera.setAttribute('cy', notchY + notchHeight / 2)
        camera.setAttribute('r', notchHeight * 0.15)
        camera.setAttribute('fill', contrastColor)
        el.appendChild(camera)
      }

      // Volume and power buttons
      drawVolumeAndPowerButtons()
    } else if (frame.type === 'framePhoneIOS2') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', phoneFrameValues.strokeWidth)

      // Dimensions and offsets

      // Outline
      const d = [
        `M ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        `H ${phoneFrameValues.right - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right} ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `V ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right - phoneFrameValues.radius} ${phoneFrameValues.bottom}`,
        `H ${phoneFrameValues.left + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left} ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `V ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        'Z',
      ].join(' ')

      outline.setAttribute('d', d)
      el.appendChild(outline)

      // Notch
      const aspectRatio = 1 / 4
      let notchWidth, notchHeight

      if (svgWidth >= svgHeight) {
        notchWidth = Math.floor(svgWidth * 0.26)
        notchHeight = Math.floor(notchWidth * aspectRatio)
      } else {
        notchHeight = Math.floor(svgHeight * 0.04)
        notchWidth = Math.floor(notchHeight / aspectRatio)
      }

      const notchPadding = 1.5
      const notchRadius = notchHeight / 2
      const arcR = Math.floor(notchHeight * 0.4)

      const nw = notchWidth
      const nh = notchHeight
      const nx = svgWidth / 2 - nw / 2
      const ny = phoneFrameValues.top + phoneFrameValues.strokeWidth * 0.5 - 1 // Slightly above the top edge

      const notchFits =
        nx >= phoneFrameValues.left &&
        nx + nw * notchPadding <= phoneFrameValues.right &&
        ny + nh * notchPadding <= phoneFrameValues.bottom &&
        notchHeight >= 5

      // Render notch only if it fits
      if (notchFits) {
        // Notch with rounded corners and top arcs
        const notch = document.createElementNS(ns, 'path')
        const notchPath = [
          `M ${nx - arcR} ${ny}`,
          `A ${arcR} ${arcR} 0 0 1 ${nx} ${ny + arcR}`,
          `V ${ny + nh - notchRadius}`,
          `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + notchRadius} ${ny + nh}`,
          `H ${nx + nw - notchRadius}`,
          `A ${notchRadius} ${notchRadius} 0 0 0 ${nx + nw} ${ny + nh - notchRadius}`,
          `V ${ny + arcR}`,
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
        const speakerY = ny + nh * 0.25
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
      }

      // Volume and power buttons
      drawVolumeAndPowerButtons()
    } else if (frame.type === 'framePhoneAndroid') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', phoneFrameValues.strokeWidth)

      // Outline
      const d = [
        `M ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        `H ${phoneFrameValues.right - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right} ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `V ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right - phoneFrameValues.radius} ${phoneFrameValues.bottom}`,
        `H ${phoneFrameValues.left + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left} ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `V ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        'Z',
      ].join(' ')

      outline.setAttribute('d', d)
      el.appendChild(outline)

      // Camera circle
      const cameraRadius = Math.floor(svgHeight * 0.012)
      const cameraOffset = Math.floor(svgHeight * 0.03)
      const cx = svgWidth / 2
      const cy = phoneFrameValues.top + cameraOffset

      const cameraPadding = 1.5
      const cameraFits =
        cx - cameraRadius * cameraPadding >= phoneFrameValues.left &&
        cx + cameraRadius * cameraPadding <= phoneFrameValues.right &&
        cy + cameraRadius * cameraPadding <= phoneFrameValues.bottom

      if (cameraFits) {
        const camera = document.createElementNS(ns, 'circle')
        camera.setAttribute('cx', cx)
        camera.setAttribute('cy', cy)
        camera.setAttribute('r', cameraRadius)
        camera.setAttribute('fill', color)
        el.appendChild(camera)
      }

      // Volume and power buttons
      drawVolumeAndPowerButtons()
    } else if (frame.type === 'framePhoneAndroid2') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', phoneFrameValues.strokeWidth)

      // Outline
      const d = [
        `M ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        `H ${phoneFrameValues.right - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right} ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `V ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right - phoneFrameValues.radius} ${phoneFrameValues.bottom}`,
        `H ${phoneFrameValues.left + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left} ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `V ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        'Z',
      ].join(' ')
      outline.setAttribute('d', d)
      el.appendChild(outline)

      // Drop notch
      const dropHeight = svgHeight * 0.035
      const dropWidth = dropHeight * 1.02
      const arcRadius = 0.5 * dropHeight

      const dropCenterX = svgWidth / 2
      const dropTopY = phoneFrameValues.top + phoneFrameValues.strokeWidth * 0.5 - 1 // Slightly above the top edge
      const leftDrop = dropCenterX - dropWidth / 2
      const rightDrop = dropCenterX + dropWidth / 2
      const bottomDrop = dropTopY + dropHeight

      const notchPadding = 1.5
      const dropFits =
        leftDrop >= phoneFrameValues.left &&
        rightDrop <= phoneFrameValues.right &&
        bottomDrop * notchPadding <= phoneFrameValues.bottom &&
        dropHeight >= 5

      if (dropFits) {
        // === Drop notch path ===
        const dropPath = document.createElementNS(ns, 'path')
        const path = [
          `M ${leftDrop - arcRadius} ${dropTopY}`,
          `A ${arcRadius} ${arcRadius} 0 0 1 ${leftDrop} ${dropTopY + arcRadius}`,
          `V ${bottomDrop - arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 0 ${leftDrop + arcRadius} ${bottomDrop}`,
          `H ${rightDrop - arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 0 ${rightDrop} ${bottomDrop - arcRadius}`,
          `V ${dropTopY + arcRadius}`,
          `A ${arcRadius} ${arcRadius} 0 0 1 ${rightDrop + arcRadius} ${dropTopY}`,
          'Z',
        ].join(' ')
        dropPath.setAttribute('d', path)
        dropPath.setAttribute('fill', color)
        el.appendChild(dropPath)

        // === Camera inside drop notch ===
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

      // Volume and power buttons
      drawVolumeAndPowerButtons()
    } else if (frame.type === 'framePhoneSimple') {
      const outline = document.createElementNS(ns, 'path')
      outline.setAttribute('fill', 'none')
      outline.setAttribute('stroke', color)
      outline.setAttribute('stroke-width', phoneFrameValues.strokeWidth)

      // Outline
      const d = [
        `M ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        `H ${phoneFrameValues.right - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right} ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `V ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.right - phoneFrameValues.radius} ${phoneFrameValues.bottom}`,
        `H ${phoneFrameValues.left + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left} ${phoneFrameValues.bottom - phoneFrameValues.radius}`,
        `V ${phoneFrameValues.top + phoneFrameValues.radius}`,
        `A ${phoneFrameValues.radius} ${phoneFrameValues.radius} 0 0 1 ${phoneFrameValues.left + phoneFrameValues.radius} ${phoneFrameValues.top}`,
        'Z',
      ].join(' ')

      outline.setAttribute('d', d)
      el.appendChild(outline)

      // Volume and power buttons
      drawVolumeAndPowerButtons()
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

      // Search bar (vedľa loga)
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
        searchBar.setAttribute('rx', footer * 0.1)
        searchBar.setAttribute('fill', '#ffffff33') // semi-transparent white
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
    // UPDATE new frame type
    if (
      imageStore.frame.type === 'framePhoneIOS' ||
      imageStore.frame.type === 'framePhoneIOS2' ||
      imageStore.frame.type === 'framePhoneAndroid' ||
      imageStore.frame.type === 'framePhoneAndroid2' ||
      imageStore.frame.type === 'framePhoneSimple'
    ) {
      const header = imageStore.frame.headerSize || 0
      const svgWidth = imageStore.fileDimensions.width + imageStore.frame.width * 2
      const svgHeight =
        imageStore.fileDimensions.height +
        imageStore.frame.height * 2 +
        (header > 0 ? header - imageStore.frame.height : 0)

      const radius = Math.floor(Math.min(svgWidth, svgHeight) * 0.06) - fh * 0.3 // 6% of the smaller dimension + a bit of padding (20% of frame height)

      const renderedImage = imageStore.getRenderedImage()
      if (!renderedImage) return

      const w = renderedImage.width
      const h = renderedImage.height

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')

      const path = new Path2D()

      // Create rounded rectangle path
      path.moveTo(radius, 0)
      path.lineTo(w - radius, 0)
      path.quadraticCurveTo(w, 0, w, radius)
      path.lineTo(w, h - radius)
      path.quadraticCurveTo(w, h, w - radius, h)
      path.lineTo(radius, h)
      path.quadraticCurveTo(0, h, 0, h - radius)
      path.lineTo(0, radius)
      path.quadraticCurveTo(0, 0, radius, 0)
      path.closePath()

      // Round corners by clipping
      ctx.save()
      ctx.clip(path)
      ctx.drawImage(renderedImage, 0, 0)
      ctx.restore()

      imageStore.setRenderedImage(canvas, true) // Set only original image, not tmpRenderedImage
      imageStore.previewUrl = canvas.toDataURL()

      console.log(`--------------Rounding corners ${radius}px`)
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
    setFrameColor,
    setFrameOutline,
  }
}
