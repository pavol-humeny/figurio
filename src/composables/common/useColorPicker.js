/**
 * @file: useColorPicker.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for managing a color picker component, including HSV/HEX conversion, recent colors, and eye dropper functionality.
 */
import { ref, nextTick, onBeforeUnmount, watch, computed } from 'vue'
import { useEyeDropper } from '@vueuse/core'
import { editorConfig } from '@/config/editorConfig'
const { isSupported, open } = useEyeDropper()

/**
 * Composable for color picker functionality
 * @param {Object} props - Component props
 * @param {Function} emit - Emit function to send events to parent
 */
export function useColorPicker(editorStore, props, emit) {
  /**
   * Reactive color value bound to the input
   */
  const colorValue = ref(props.modelValue)

  /**
   * Recent colors padded with nulls for UI
   */
  const recentColors = computed(() => {
    const colors = editorStore.recentColors || []

    return [...colors, ...Array(editorConfig.minRecentColors * 2 - colors.length).fill(null)].slice(
      0,
      editorConfig.minRecentColors * 2,
    )
  })

  /**
   * Watch for external modelValue changes and update local value
   */
  watch(
    () => props.modelValue,
    (newVal) => {
      colorValue.value = newVal
    },
  )

  /**
   * Updates the internal color value programmatically
   *
   * @param {string} newValue - New color value
   */
  const setValue = (newValue) => {
    colorValue.value = newValue
  }

  /**
   * Whether color picker window is visible
   */
  const isVisible = ref(false)

  /**
   * Color picker window position style
   */
  const panelStyle = ref({ top: '0px', left: '0px' })

  /**
   * Refs
   */
  const previewRef = ref(null)
  const panelRef = ref(null)
  const svCanvasRef = ref(null)
  const hueCanvasRef = ref(null)
  const inputRef = ref(null)

  /**
   * HSV values
   */
  const hue = ref(0)
  const sat = ref(1)
  const val = ref(1)

  /**
   * Indicator positions on canvases
   */
  const svIndicatorX = ref(0)
  const svIndicatorY = ref(0)
  const hueIndicatorX = ref(0)

  /**
   * Whether user is currently picking on SV or Hue canvas
   */
  const pickingSV = ref(false)
  const pickingHue = ref(false)

  /**
   * Hex input value
   */
  const hexValue = ref(colorValue.value)

  /**
   * Color of the hue indicator based on current hue
   */
  const hueIndicatorColor = computed(() => {
    const { r, g, b } = hsvToRgb(hue.value, 1, 1) // Full saturation and value for pure hue
    return `rgb(${r},${g},${b})`
  })

  /**
   * Animation frame for following the preview button
   */
  let followFrame = null

  /**
   * Update panel position to follow the preview button
   */
  const updatePanelPosition = () => {
    if (!previewRef.value || !isVisible.value) return
    const rect = previewRef.value.getBoundingClientRect()

    // Panel height is 390px
    const panelHeight = 390
    let top = rect.top + window.scrollY

    // Move above if not enough space below
    const maxTop = window.scrollY + window.innerHeight - panelHeight - 8 // 8px margin
    if (top > maxTop) top = maxTop

    panelStyle.value = {
      left: `${rect.left + window.scrollX - 220 - 8}px`,
      top: `${top}px`,
    }

    followFrame = requestAnimationFrame(updatePanelPosition)
  }

  /**
   * Stop following the preview button
   */
  const stopFollowing = () => {
    if (followFrame) {
      cancelAnimationFrame(followFrame)
      followFrame = null
    }
  }

  /**
   * Handle ESC key to close color picker
   * @param {KeyboardEvent} event
   */
  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClickOutside(event)
    }
  }

  /**
   * Toggle color picker window visibility
   */
  const toggle = async () => {
    if (props.disabled) return

    isVisible.value = !isVisible.value

    if (isVisible.value) {
      await nextTick()
      updatePanelPosition() // Start following the preview button

      // Initialize canvases and indicators
      initHSVFromColor(colorValue.value)
      drawHueCanvas()
      drawSVCanvas()
      updateIndicators()

      document.addEventListener('mousedown', onClickOutside)
      document.addEventListener('keydown', onKeyDown)
    } else {
      stopFollowing()
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }

  /**
   * Handle clicks outside the color picker to close window
   * @param {MouseEvent} event - Mouse event
   */
  const onClickOutside = (event) => {
    if (isVisible.value === false) return
    if (!previewRef.value || !panelRef.value) return

    if (!previewRef.value.contains(event.target) && !panelRef.value.contains(event.target)) {
      isVisible.value = false
      document.removeEventListener('mousedown', onClickOutside)
    }
  }

  /**
   * HSV to RGB conversion
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-1)
   * @param {number} v - Value (0-1)
   * @returns {{r: number, g: number, b: number}} - RGB values (0-255)
   */
  const hsvToRgb = (h, s, v) => {
    let c = v * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = v - c
    let r = 0,
      g = 0,
      b = 0
    if (h < 60) {
      r = c
      g = x
      b = 0
    } else if (h < 120) {
      r = x
      g = c
      b = 0
    } else if (h < 180) {
      r = 0
      g = c
      b = x
    } else if (h < 240) {
      r = 0
      g = x
      b = c
    } else if (h < 300) {
      r = x
      g = 0
      b = c
    } else {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  /**
   * RGB to HEX conversion
   * @param {{r: number, g: number, b: number}} param0 - RGB values (0-255)
   * @returns {string} - HEX color string
   */
  const rgbToHex = ({ r, g, b }) =>
    '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')

  /**
   * Handle HEX input changes (live typing)
   */
  const onHexInput = () => {
    let hex = hexValue.value.trim()

    // Ensure it starts with #
    if (hex && !hex.startsWith('#')) {
      hex = '#' + hex
      hexValue.value = hex
    }

    // If short form do not expand yet, just apply
    if (/^#([0-9A-Fa-f]{3})$/.test(hex)) {
      const expanded =
        '#' +
        hex
          .slice(1)
          .split('')
          .map((ch) => ch + ch)
          .join('')
      applyHexColor(expanded)
      return
    }

    // Apply if valid full form
    if (/^#([0-9A-Fa-f]{6})$/.test(hex)) {
      applyHexColor(hex)
    }
  }

  /**
   * Handle HEX input enter key (blur input)
   */
  const onEnter = () => {
    inputRef.value.blur()
  }

  /**
   * Handle HEX input blur (normalize on leave)
   */
  const onHexBlur = () => {
    let hex = hexValue.value.trim()

    if (!hex) return

    // Ensure #
    if (!hex.startsWith('#')) {
      hex = '#' + hex
    }

    // Extend short format
    if (/^#([0-9A-Fa-f]{3})$/.test(hex)) {
      hex =
        '#' +
        hex
          .slice(1)
          .split('')
          .map((ch) => ch + ch)
          .join('')
    }

    // Validate
    if (!/^#([0-9A-Fa-f]{6})$/.test(hex)) {
      // Revert to last valid value
      hexValue.value = colorValue.value
      return
    }

    // Set normalized value
    hexValue.value = hex.toLowerCase()
    applyHexColor(hexValue.value)
  }

  /**
   * Apply a HEX color from input
   * @param {string} hex - HEX color string
   */
  const applyHexColor = (hex) => {
    colorValue.value = hex.toLowerCase()

    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    val.value = max / 255
    sat.value = max === 0 ? 0 : (max - min) / max
    let h
    if (max === min) h = 0
    else if (max === r) h = 60 * ((g - b) / (max - min))
    else if (max === g) h = 60 * (2 + (b - r) / (max - min))
    else h = 60 * (4 + (r - g) / (max - min))
    if (h < 0) h += 360
    hue.value = h

    drawHueCanvas()
    drawSVCanvas()
    updateIndicators()
    commitChanges()
  }

  /**
   * Initialize HSV values from a given color string (HEX or RGB)
   */
  const initHSVFromColor = (color) => {
    let r, g, b
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16)
      g = parseInt(color.slice(3, 5), 16)
      b = parseInt(color.slice(5, 7), 16)
    } else {
      return
    }

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    val.value = max / 255
    sat.value = max === 0 ? 0 : (max - min) / max
    let h
    if (max === min) h = 0
    else if (max === r) h = 60 * ((g - b) / (max - min))
    else if (max === g) h = 60 * (2 + (b - r) / (max - min))
    else h = 60 * (4 + (r - g) / (max - min))
    if (h < 0) h += 360
    hue.value = h
  }

  /**
   * Draw the hue gradient on the hue canvas
   */
  const drawHueCanvas = () => {
    const canvas = hueCanvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
    const hues = [0, 60, 120, 180, 240, 300, 360]
    hues.forEach((h) => gradient.addColorStop(h / 360, `hsl(${h},100%,50%)`))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  /**
   * Draw the saturation-value gradient on the SV canvas based on current hue
   */
  const drawSVCanvas = () => {
    const canvas = svCanvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width,
      height = canvas.height
    const satGradient = ctx.createLinearGradient(0, 0, width, 0)
    satGradient.addColorStop(0, 'white')
    satGradient.addColorStop(1, `hsl(${hue.value},100%,50%)`)
    ctx.fillStyle = satGradient
    ctx.fillRect(0, 0, width, height)

    const valGradient = ctx.createLinearGradient(0, 0, 0, height)
    valGradient.addColorStop(0, 'rgba(0,0,0,0)')
    valGradient.addColorStop(1, 'black')
    ctx.fillStyle = valGradient
    ctx.fillRect(0, 0, width, height)
  }

  /**
   * Update indicator positions based on current HSV values
   */
  const updateIndicators = () => {
    if (svCanvasRef.value && hueCanvasRef.value) {
      svIndicatorX.value = sat.value * (svCanvasRef.value.width - 8) + 4
      svIndicatorY.value = (1 - val.value) * (svCanvasRef.value.height - 8) + 4
      hueIndicatorX.value = (hue.value / 360) * (hueCanvasRef.value.width - 10) + 5
    }
  }

  /**
   * SV Canvas picking handlers
   * @param {MouseEvent} event - Mouse event
   */
  const startSVPick = (event) => {
    pickingSV.value = true
    pickSV(event)
    window.addEventListener('mousemove', pickSV)
    window.addEventListener('mouseup', stopSVPick)
  }

  /**
   * Handle SV picking
   * @param {MouseEvent} event - Mouse event
   */
  const pickSV = (event) => {
    if (!pickingSV.value || !svCanvasRef.value) return
    const rect = svCanvasRef.value.getBoundingClientRect()

    const margin = 0
    const x = Math.min(Math.max(margin, event.clientX - rect.left), rect.width - margin)
    const y = Math.min(Math.max(margin, event.clientY - rect.top), rect.height - margin)

    sat.value = x / rect.width
    val.value = 1 - y / rect.height
    updateColorValue()
  }

  /**
   * Stop SV picking
   */
  const stopSVPick = () => {
    pickingSV.value = false
    window.removeEventListener('mousemove', pickSV)
    window.removeEventListener('mouseup', stopSVPick)
    commitChanges()
  }

  /**
   * Hue Canvas picking handlers
   * @param {MouseEvent} event - Mouse event
   */
  const startHuePick = (event) => {
    pickingHue.value = true
    pickHue(event)
    window.addEventListener('mousemove', pickHue)
    window.addEventListener('mouseup', stopHuePick)
  }

  /**
   * Handle Hue picking
   * @param {MouseEvent} event - Mouse event
   */
  const pickHue = (event) => {
    if (!pickingHue.value || !hueCanvasRef.value) return
    const rect = hueCanvasRef.value.getBoundingClientRect()
    const x = Math.min(Math.max(0, event.clientX - rect.left), rect.width)
    hue.value = (x / rect.width) * 360
    drawSVCanvas()
    updateColorValue()
  }

  /**
   * Stop Hue picking
   */
  const stopHuePick = () => {
    pickingHue.value = false
    window.removeEventListener('mousemove', pickHue)
    window.removeEventListener('mouseup', stopHuePick)
    commitChanges()
  }

  /**
   * Select a recent color
   * @param {string} color - Color to select
   */
  const selectRecentColor = (color) => {
    if (!color) return

    // Set new color
    setValue(color)
    hexValue.value = color

    // Init HSV from color
    initHSVFromColor(color)

    // Update indicators and canvases
    updateIndicators()
    drawSVCanvas()
    drawHueCanvas()

    emit('update:modelValue', colorValue.value)
    emit('update', colorValue.value)
  }

  /**
   * Commit changes and emit event to parent
   */
  const commitChanges = () => {
    editorStore.addRecentColor(colorValue.value)

    emit('update:modelValue', colorValue.value)
    emit('commit', colorValue.value)
  }

  /**
   * Update colorValue, hexValue and emit changes
   */
  const updateColorValue = () => {
    const { r, g, b } = hsvToRgb(hue.value, sat.value, val.value)
    colorValue.value = rgbToHex({ r, g, b })
    hexValue.value = colorValue.value

    emit('update:modelValue', colorValue.value)
    emit('update', colorValue.value)
    updateIndicators()
  }

  // Cleanup listener on unmount
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onClickOutside)
    document.removeEventListener('keydown', onKeyDown)
  })

  /**
   * Use Eye Dropper to pick color from screen
   */
  const pickColor = async () => {
    const result = await open()
    if (result?.sRGBHex) {
      hexValue.value = result.sRGBHex
      applyHexColor(result.sRGBHex)
    }
  }

  /**
   * Remove recent color
   * @param {string} color
   */
  const removeRecentColor = (color) => {
    editorStore.removeRecentColor(color)
  }

  return {
    colorValue,
    hueIndicatorColor,
    onHexInput,
    onHexBlur,
    hexValue,
    isVisible,
    panelStyle,
    previewRef,
    panelRef,
    svCanvasRef,
    hueCanvasRef,
    svIndicatorX,
    svIndicatorY,
    hueIndicatorX,
    toggle,
    startSVPick,
    startHuePick,
    recentColors,
    selectRecentColor,
    commitChanges,
    setValue,
    onEnter,
    inputRef,
    isSupported,
    pickColor,
    removeRecentColor,
    onClickOutside,
  }
}
