import { computed, ref, watch } from 'vue'

export function useImageAnalysis(imageStore, workspaceStore, t) {
  const noiseLevel = ref(0)
  const noiseThreshold = 0.15 // minimal ratio of noisy pixels to show warning
  const bgCoverageThreshold = 0.3 // minimal percentage of background area required to analyze noise
  const showWarning = ref(false)
  const colorDistanceThreshold = 35 // color distance from background considered as near-background

  const imageHasArtifacts = computed({
    get: () => imageStore.isArtifactsVisible,
    set: (val) => {
      imageStore.isArtifactsVisible = val
    },
  })

  // --- Detect dominant background color from image borders ---
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

  // --- Compute noise and draw overlay only if above threshold ---
  const calculateArtifacts = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
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
    const threshold = colorDistanceThreshold
    let similarCount = 0
    let bgCount = 0

    for (let i = 0; i < data.length; i += 4) {
      const dr = data[i] - bgColor.r
      const dg = data[i + 1] - bgColor.g
      const db = data[i + 2] - bgColor.b
      const dist = Math.sqrt(dr * dr + dg * dg + db * db)

      // count background-like pixels
      if (dist < threshold) bgCount++

      // count slightly deviating pixels as potential noise
      if (dist > 0 && dist < threshold) {
        similarCount++
        odata[i] = 255
        odata[i + 1] = 0
        odata[i + 2] = 0
        odata[i + 3] = 80
      } else {
        odata[i + 3] = 0
      }
    }

    const bgCoverage = bgCount / pixelCount
    if (bgCoverage < bgCoverageThreshold) {
      console.log(
        `[ImageAnalysis] Skipping noise detection — background coverage ${(
          bgCoverage * 100
        ).toFixed(1)}% is below threshold (${bgCoverageThreshold * 100}%)`,
      )
      return
    }

    noiseLevel.value = similarCount / pixelCount
    showWarning.value = noiseLevel.value >= noiseThreshold

    const baseCanvas = document.querySelector('.image-canvas')
    const overlayCanvas = document.querySelector('.overlay-canvas')
    if (!baseCanvas || !overlayCanvas) return

    const oCtx = overlayCanvas.getContext('2d')
    overlayCanvas.width = baseCanvas.width
    overlayCanvas.height = baseCanvas.height

    if (showWarning.value) {
      oCtx.putImageData(overlay, 0, 0)
      imageHasArtifacts.value = true
      console.log(
        `[ImageAnalysis] Noise level: ${(noiseLevel.value * 100).toFixed(2)}% — artifacts shown`,
      )
    } else {
      oCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height)
      imageHasArtifacts.value = false
      console.log(
        `[ImageAnalysis] Noise level: ${(noiseLevel.value * 100).toFixed(2)}% — no artifacts`,
      )
    }
  }

  // --- Hide overlay manually ---
  const hideArtifacts = () => {
    const overlay = document.querySelector('.overlay-canvas')
    if (overlay) overlay.getContext('2d').clearRect(0, 0, overlay.width, overlay.height)
    imageHasArtifacts.value = false
  }

  // --- Toggle overlay manually ---
  const toggleArtifacts = () => {
    if (imageHasArtifacts.value) hideArtifacts()
    else calculateArtifacts()
  }

  // --- Log and recalculate on tab change ---
  watch(
    () => workspaceStore.tabs.length,
    (newLength, oldLength) => {
      if (newLength > oldLength) {
        calculateArtifacts()
      }
    },
    { immediate: true },
  )

  // --- Watch visibility toggle ---
  watch(
    () => imageStore.isArtifactsVisible,
    (newValue) => {
      if (newValue) calculateArtifacts()
      else hideArtifacts()
    },
    { immediate: true },
  )

  return {
    noiseLevel,
    showWarning,
    imageHasArtifacts,
    calculateArtifacts,
    hideArtifacts,
    toggleArtifacts,
  }
}
