/**
 * @file: useImageAnalysis.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { globalConfig } from '@/config/globalConfig'
import { viewportConfig } from '@/config/viewportConfig'
import { computed, ref, watch } from 'vue'
import { useConsole } from '@/composables/common/useConsole.js'
const { log } = useConsole()
import { useApi } from '@/composables/common/useApi'
const { addUserEvent } = useApi()
import { useToastModal } from '../modals/useToastModal'
import { useWarningList } from '../modals/useWarningList'
import { editorConfig } from '@/config/editorConfig'
import { useImagePipeline } from '../editor/useImagePipeline'
import { useToolsPanel } from './useToolsPanel'

const { showToastModal } = useToastModal()

/**
 * Current noise level in the image (ratio of noisy pixels)
 */
const noiseLevel = ref(0)

/**
 * Last noise detection result.
 * Valid ONLY immediately after detection.
 */
const lastNoiseAnalysis = ref(null)

/**
 * Noise detection sensitivity (multiplier for Laplacian threshold)
 */
const noiseSensitivity = ref(1)

/**
 * Composable for analyzing image artifacts (noise) and managing overlay display
 */
export function useImageAnalysis(
  imageStore,
  viewportStore,
  uiStore,
  historyStore,
  editorStore,
  workspaceStore,
  t,
) {
  const {
    addWarning,
    isWarningDefined,
    hideWarningById,
    deleteWarningById,
    isWarningExpanded,
    removeWarning,
  } = useWarningList(imageStore, uiStore)
  const { renderUpTo } = useImagePipeline(imageStore, uiStore)

  /**
   * Whether noise detection can be run (no existing artifact warnings)
   */
  const noiseDetectionCanBeRun = computed(() => {
    return isWarningDefined('artifact-warning') === false
  })

  /**
   * Watch for changes in noise sensitivity and remove warning if it exists
   */
  watch(noiseSensitivity, () => {
    if (isWarningDefined('artifact-warning')) {
      removeWarning('artifact-warning')
    }
  })

  /**
   * Calculate image artifacts (noise) based on similarity to background color.
   * Marks pixels that are close to background color but locally isolated.
   *
   * @return {boolean} - True if noise detected and overlay shown, else false
   */
  const calculateArtifacts = async () => {
    log('[ImageAnalysis] Starting artifact calculation (background similarity)...')
    if (globalConfig.featureFlags.enableNoiseDetectionOnStart === false) return

    await new Promise((resolve) => setTimeout(resolve, 100))

    const img = imageStore.getRenderedImage({ t, renderCall: false })
    if (!img) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

    const overlay = new ImageData(width, height)
    const odata = overlay.data

    // CONFIG
    const colorDistanceThreshold = editorConfig.colorDistanceThreshold
    let minNoisyPixelsRatio = editorConfig.minNoisyPixelsRatio

    const bgCoverageThreshold = editorConfig.bgCoverageThreshold
    const borderCoverageThreshold = editorConfig.borderCoverageThreshold
    const borderSize = editorConfig.borderSize

    // Adjust sensitivity for PNG images
    if (imageStore.fileFormat === 'png') {
      minNoisyPixelsRatio *= 10
    }

    /**
     * Detect dominant background color by sampling image edges
     * @return {Object} - RGB color object {r, g, b}
     */
    const detectBgColor = () => {
      const counts = {}
      const add = (i) => {
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`
        counts[key] = (counts[key] || 0) + 1
      }

      for (let x = 0; x < width; x++) {
        add((0 * width + x) * 4)
        add(((height - 1) * width + x) * 4)
      }
      for (let y = 0; y < height; y++) {
        add((y * width + 0) * 4)
        add((y * width + (width - 1)) * 4)
      }

      const dominant = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b))
      const [r, g, b] = dominant.split(',').map(Number)
      return { r, g, b }
    }

    const bgColor = detectBgColor()

    // Global background coverage check
    let bgCount = 0
    const pixelCount = width * height

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
        `[ImageAnalysis] Skipping bg-similarity detection — coverage ${(bgCoverage * 100).toFixed(
          1,
        )}%`,
      )
      return
    }

    // Border background consistency check
    let borderBgCount = 0
    let borderPixelCount = 0

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isBorder =
          x < borderSize || x >= width - borderSize || y < borderSize || y >= height - borderSize
        if (!isBorder) continue

        const idx = (y * width + x) * 4
        const dr = data[idx] - bgColor.r
        const dg = data[idx + 1] - bgColor.g
        const db = data[idx + 2] - bgColor.b
        const dist = Math.sqrt(dr * dr + dg * dg + db * db)

        borderPixelCount++
        if (dist < colorDistanceThreshold) borderBgCount++
      }
    }

    const borderBgCoverage = borderBgCount / borderPixelCount
    if (borderBgCoverage < borderCoverageThreshold) {
      log(
        `[ImageAnalysis] Skipping bg-similarity detection — border coverage ${(
          borderBgCoverage * 100
        ).toFixed(1)}%`,
      )
      return
    }

    // Mask of detected noisy pixels
    const noisyMask = new Uint8Array(width * height)
    let noisyPixelCount = 0

    const isBgLike = (i) => {
      const dr = data[i] - bgColor.r
      const dg = data[i + 1] - bgColor.g
      const db = data[i + 2] - bgColor.b
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)

      const sensitivityMultiplier = noiseSensitivity.value
      return (
        dist >= editorConfig.bgColorDistanceFrom &&
        dist <= editorConfig.bgColorDistanceTo * sensitivityMultiplier
      )
    }

    // Detect isolated background-like pixels
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4
        if (!isBgLike(idx)) continue

        const p = y * width + x
        noisyMask[p] = 1

        odata[idx] = 255
        odata[idx + 1] = 0
        odata[idx + 2] = 0
        odata[idx + 3] = 160
        noisyPixelCount++
      }
    }

    const noiseRatio = noisyPixelCount / pixelCount
    const noiseDetected = noiseRatio > minNoisyPixelsRatio

    const baseCanvas = document.querySelector('.image-canvas')
    const overlayCanvas = document.querySelector('.overlay-canvas-artifacts')
    if (!baseCanvas || !overlayCanvas) return

    overlayCanvas.style.display = 'block'
    overlayCanvas.width = baseCanvas.width
    overlayCanvas.height = baseCanvas.height

    const oCtx = overlayCanvas.getContext('2d')

    if (noiseDetected) {
      lastNoiseAnalysis.value = {
        mask: noisyMask,
        width,
        height,
        noisyPixelCount,
        replaceColor: bgColor,
      }

      oCtx.putImageData(overlay, 0, 0)

      addWarning(
        'artifact-warning',
        'tools.artifactsWarning.message',
        'tools.artifactsWarning.tip.text',
        'tools.artifactsWarning.tip.title',
        'warning',
        'open',
        hideArtifactsClick,
        onWarningOpen,
        hideArtifacts,
      )

      log(
        `[ImageAnalysis] BG-noise detected — ${noisyPixelCount} pixels (${(
          noiseRatio * 100
        ).toFixed(3)}%)`,
      )

      return true
    } else {
      log(
        `[ImageAnalysis] No significant BG-noise detected — ${noisyPixelCount} pixels (${(
          noiseRatio * 100
        ).toFixed(3)}%)`,
      )
      lastNoiseAnalysis.value = null
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
      return false
    }
  }

  /**
   * Whether noise can be removed (only immediately after detection and if noise was detected)
   */
  const noiseCanBeRemoved = computed(() => {
    return isWarningExpanded('artifact-warning')
  })

  /**
   * Apply remove-noise operation and push to history
   * Requires prior noise detection
   */
  const removeNoise = async () => {
    if (!noiseCanBeRemoved.value) return

    const { mask, width, height, noisyPixelCount, replaceColor } = lastNoiseAnalysis.value

    imageStore.addImageOperation({
      type: 'removeNoise',
      params: {
        mask: new Uint8Array(mask), // Copy of mask to avoid transfer issues
        width,
        height,
        replaceColor: replaceColor
          ? { r: replaceColor.r, g: replaceColor.g, b: replaceColor.b }
          : null,
      },
      cost: 'medium',
      affectsGeometry: false,
    })

    await renderUpTo(imageStore.renderPipeline.currentOpIndex + 1, { t, imageStore })

    historyStore.push(imageStore.getSnapshot())

    addUserEvent('applyOperation', {
      tool: 'removeNoise',
      settings: {
        noisyPixelCount,
      },
    })

    lastNoiseAnalysis.value = null
    removeWarning('artifact-warning')
  }

  const { toggleTool } = useToolsPanel(editorStore, imageStore, uiStore, viewportStore, t)

  /**
   * Function that is called when the artifact warning is opened. It calculates artifacts and opens the image analysis tool if not already open.
   */
  const onWarningOpen = () => {
    calculateArtifacts()
    // Open tool image analysis if not open
    toggleTool('imageAnalysis', null, false)
  }

  /**
   * Watch for changes in pixelate mode or zoom level and update image rendering style
   */
  watch(
    [() => uiStore.viewportPixelateMode, () => viewportStore.zoomLevel],
    ([mode, zoom]) => {
      // Get overlay canvas element
      const canvas = document.getElementsByClassName('overlay-canvas-artifacts')[0]

      if (!canvas) return

      if (mode === 'always') {
        canvas.style.imageRendering = 'pixelated'
      } else if (mode === 'never') {
        canvas.style.imageRendering = 'auto'
      } else if (mode === 'auto') {
        canvas.style.imageRendering =
          zoom > viewportConfig.pixelateAutoZoomThreshold ? 'pixelated' : 'auto'
      }
    },
    { immediate: true },
  )

  /**
   * Hide artifacts overlay on user click
   */
  const hideArtifactsClick = () => {
    imageStore.imageArtifactsCanceledByUser = true
    hideArtifacts()
  }

  /**
   * Hide artifacts overlay
   */
  const hideArtifacts = () => {
    const overlay = document.querySelector('.overlay-canvas-artifacts')
    if (overlay) {
      overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height)
    }

    // Hide warning if defined
    if (isWarningDefined('artifact-warning')) {
      // if click on warning-list do not hide
      const warningList = document.getElementById('warning-list')
      if (event?.target && warningList.contains(event.target)) {
        return
      }

      hideWarningById('artifact-warning')
    }
  }

  /**
   * Create image warning object with callbacks
   * @param {string} id - Unique ID
   * @param {string} type - 'warning' | 'info' | 'error'
   * @param {string} message - Warning message
   * @param {string} tipTitle - Tip title
   * @param {string} tipText - Tip text
   * @returns {Object} - Image warning object
   */
  const createImageWarning = (id, type, message, tipTitle, tipText) => {
    return {
      id,
      type,
      message,
      tipTitle,
      tipText,

      onOpen() {
        onWarningOpen()
      },

      onClose() {
        hideArtifacts()
      },

      onRemove() {
        hideArtifactsClick()
      },
    }
  }

  /**
   * Analyze noise in the image and show info if no noise detected
   */
  const analyzeNoise = async () => {
    if (!noiseDetectionCanBeRun.value) {
      deleteWarningById('artifact-warning')
    }

    const result = await calculateArtifacts()

    if (!result) {
      // Show info if no noise detected
      showToastModal(
        'info',
        t('tools.imageAnalysis.settings.noiseDetection.noNoiseDetected.title'),
        t('tools.imageAnalysis.settings.noiseDetection.noNoiseDetected.message'),
      )
    }
  }

  return {
    noiseLevel,
    calculateArtifacts,
    hideArtifacts,
    hideArtifactsClick,
    createImageWarning,
    analyzeNoise,
    removeNoise,
    noiseCanBeRemoved,
    noiseSensitivity,
  }
}
