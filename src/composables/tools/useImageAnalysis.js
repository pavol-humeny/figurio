import { globalConfig } from '@/config/globalConfig'
import { viewportConfig } from '@/config/viewportConfig'
import { ref, watch } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()

import { useWarningList } from '../modals/useWarningList'

/**
 * Whether to expand the artifacts warning message
 */
const expandArtifactsWarning = ref(false)

/**
 * Current noise level in the image (ratio of noisy pixels)
 */
const noiseLevel = ref(0)

/**
 * Composable for analyzing image artifacts (noise) and managing overlay display
 */
export function useImageAnalysis(imageStore, workspaceStore, uiStore, t) {
  const { addWarning, isWarningExpanded, isWarningDefined, hideWarningById } = useWarningList(
    imageStore,
    uiStore,
  )

  const noiseThreshold = viewportConfig.noiseThreshold // adjustable block noise threshold
  const noiseTopThreshold = viewportConfig.noiseTopThreshold // Upper limit to ignore blocks with extreme noise - solid color blocks similar to background
  const bgCoverageThreshold = viewportConfig.bgCoverageThreshold // minimal percentage of background area required to analyze noise
  const colorDistanceThreshold = viewportConfig.colorDistanceThreshold // color distance from background considered as near-background

  /**
   * Detect the most common background color by sampling the image edges
   * @returns {Object} - RGBA color object
   */
  const detectBgColor = () => {
    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return { r: 255, g: 255, b: 255, a: 255 }

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const counts = {}

    const addPixel = (i) => {
      const key = `${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3]}`
      counts[key] = (counts[key] || 0) + 1
    }

    const { width, height } = canvas
    for (let x = 0; x < width; x++) {
      addPixel((0 * width + x) * 4)
      addPixel(((height - 1) * width + x) * 4)
    }
    for (let y = 0; y < height; y++) {
      addPixel((y * width + 0) * 4)
      addPixel((y * width + (width - 1)) * 4)
    }

    const picked = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b))
    const [r, g, b, a] = picked.split(',').map(Number)
    return { r, g, b, a }
  }

  /**
   * Calculate image artifacts (noise) using local blocks
   * and display overlay if needed
   */
  const calculateArtifacts = async () => {
    if (globalConfig.featureFlags.enableNoiseDetectionOnStart === false) return

    await new Promise((resolve) => setTimeout(resolve, 100))

    if (imageStore.fileType !== 'image') {
      expandArtifactsWarning.value = false
      imageStore.imageHasArtifacts = false
      return
    }

    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    const bgColor = detectBgColor()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const overlay = new ImageData(width, height)
    const odata = overlay.data

    const pixelCount = width * height

    // Background coverage
    let bgCount = 0
    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - bgColor.r
      const dg = data[i + 1] - bgColor.g
      const db = data[i + 2] - bgColor.b
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)
      if (dist < colorDistanceThreshold) bgCount++
    }
    const bgCoverage = bgCount / pixelCount
    if (bgCoverage < bgCoverageThreshold) {
      log(
        `[ImageAnalysis] Skipping noise detection — background coverage ${(bgCoverage * 100).toFixed(1)}% is below threshold (${bgCoverageThreshold * 100}%)`,
      )
      expandArtifactsWarning.value = false
      imageStore.imageHasArtifacts = false
      return
    } else {
      log(
        `[ImageAnalysis] Background coverage (#${bgColor.r}, ${bgColor.g}, ${bgColor.b}): ${(bgCoverage * 100).toFixed(1)}%`,
      )
    }

    // Local block noise detection
    const blockSize = 32
    const blocksX = Math.ceil(width / blockSize)
    const blocksY = Math.ceil(height / blockSize)
    let noisyBlocks = 0

    for (let by = 0; by < blocksY; by++) {
      for (let bx = 0; bx < blocksX; bx++) {
        let blockNoiseCount = 0

        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const px = bx * blockSize + x
            const py = by * blockSize + y
            if (px >= width || py >= height) continue
            const idx = (py * width + px) * 4

            const dr = data[idx] - bgColor.r
            const dg = data[idx + 1] - bgColor.g
            const db = data[idx + 2] - bgColor.b
            const dist = Math.sqrt(dr * dr + dg * dg + db * db)

            if (dist > 0 && dist < colorDistanceThreshold) {
              blockNoiseCount++
            }
          }
        }

        const blockPixels = blockSize * blockSize
        const blockNoiseRatio = blockNoiseCount / blockPixels

        if (blockNoiseRatio > noiseThreshold && blockNoiseRatio < noiseTopThreshold) {
          // Adjustable block noise threshold
          noisyBlocks++

          // Mark noisy pixels in overlay
          for (let y = 0; y < blockSize; y++) {
            for (let x = 0; x < blockSize; x++) {
              const px = bx * blockSize + x
              const py = by * blockSize + y
              if (px >= width || py >= height) continue
              const idx = (py * width + px) * 4

              const dr = data[idx] - bgColor.r
              const dg = data[idx + 1] - bgColor.g
              const db = data[idx + 2] - bgColor.b
              const dist = Math.sqrt(dr * dr + dg * dg + db * db)
              if (dist > 0 && dist < colorDistanceThreshold) {
                odata[idx] = 255
                odata[idx + 1] = 0
                odata[idx + 2] = 0
                odata[idx + 3] = 180
              } else {
                odata[idx + 3] = 0
              }
            }
          }
        }
      }
    }

    // Overall noise level
    const showWarning = noisyBlocks > 0

    const baseCanvas = document.querySelector('.image-canvas')
    const overlayCanvas = document.querySelector('.overlay-canvas')

    if (!baseCanvas || !overlayCanvas) return

    // Show overlay canvas
    overlayCanvas.style.display = 'block'
    const oCtx = overlayCanvas.getContext('2d')
    overlayCanvas.width = baseCanvas.width
    overlayCanvas.height = baseCanvas.height

    // Calculate noise level overlay
    if (showWarning) {
      oCtx.putImageData(overlay, 0, 0)
      expandArtifactsWarning.value = true
      imageStore.imageHasArtifacts = true

      addWarning(
        'artifact-warning', // id
        'tools.artifactsWarning.message', // message
        'tools.artifactsWarning.tip.text', // tipText
        'tools.artifactsWarning.tip.title', // tipTitle
        'warning', // type: 'warning' | 'info' | 'error'
        'open', // startState
        hideArtifactsClick, // onRemove
        calculateArtifacts, // onOpen
        hideArtifacts, // onClose
      )

      log(`[ImageAnalysis] Noise detected in ${noisyBlocks} blocks — artifacts shown`)

      addUserEvent('applyOperation', { tool: 'imageNoiseDetected', settings: {} })
    } else {
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
      expandArtifactsWarning.value = false
      imageStore.imageHasArtifacts = false

      log(`[ImageAnalysis] No significant noise detected`)
    }
  }

  /**
   * Hide artifacts overlay on user click
   */
  const hideArtifactsClick = () => {
    imageStore.imageHasArtifacts = false
    imageStore.imageArtifactsCanceledByUser = true
    hideArtifacts()
  }

  /**
   * Hide artifacts overlay
   */
  const hideArtifacts = () => {
    // Do nothing if no artifacts
    // if (!imageStore.imageHasArtifacts) return

    const overlay = document.querySelector('.overlay-canvas')
    if (overlay) overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height)
    expandArtifactsWarning.value = false

    // Hide warning if defined
    if (isWarningDefined('artifact-warning')) {
      // if click on warning-list do not hide
      const warningList = document.getElementById('warning-list')
      if (warningList && warningList.contains(event.target)) {
        return
      }

      hideWarningById('artifact-warning')
    }
  }

  /**
   * Calculate artifacts when active tab changes
   */
  watch(
    () => workspaceStore.activeTabIndex,
    (oldValue, newValue) => {
      if (newValue === undefined) return

      if (!imageStore.imageArtifactsCanceledByUser) {
        if (isWarningDefined('artifact-warning')) {
          if (isWarningExpanded('artifact-warning')) {
            calculateArtifacts()
          }
        } else {
          calculateArtifacts()
        }
      }
    },
  )

  return {
    noiseLevel,
    expandArtifactsWarning,
    calculateArtifacts,
    hideArtifacts,
    hideArtifactsClick,
  }
}
