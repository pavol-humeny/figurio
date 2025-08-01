import { ref, watch, watchEffect, computed } from 'vue'
import { useMath } from '../common/useMath'

/**
 * Local editable settings for text tool
 */
const localTextSettings = ref({
  x: 0,
  y: 0,
  text: '',
  size: 16,
  color: '#000000',
  fontFamily: 'Arial',
  rotation: 0,
  opacity: 1,
  letterSpacing: 0,
  bold: false,
  italic: false,
  underline: false,
})

/**
 * Text editing logic for SVG text objects
 * @param {Object} imageStore - Store containing svgObjects
 * @param {Object} historyStore - History store
 * @param {Function} t - Translation function
 */
export function useTextTool(imageStore, historyStore, editorStore, t) {
  const { round } = useMath()

  /**
   * Hide position settings in the text tool settings
   */
  const hidePosition = ref(false)

  /**
   * Currently active text object being edited
   */
  const activeObject = ref(null)

  /**
   * Text size options for the text tool settings
   */
  const textSizeOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]

  /**
   * Font family options for the text tool settings
   */
  const textFontOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Tahoma', value: 'Tahoma' },
    { label: 'Impact', value: 'Impact' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS' },

    { label: 'Trebuchet MS', value: 'Trebuchet MS' },
    { label: 'Palatino Linotype', value: 'Palatino Linotype' },
    { label: 'Lucida Console', value: 'Lucida Console' },
    { label: 'Lucida Sans Unicode', value: 'Lucida Sans Unicode' },
    { label: 'Segoe UI', value: 'Segoe UI' },
    { label: 'Gill Sans', value: 'Gill Sans' },
    { label: 'Calibri', value: 'Calibri' },
    { label: 'Cambria', value: 'Cambria' },
  ]

  /**
   * Calculate maximum and minimal position for text
   */
  const maxTextPositionX = computed(() => {
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    const bboxWidth = object?.textBBox?.width ?? 0
    return round(imageStore.fileDimensions.width - bboxWidth)
  })
  const maxTextPositionY = computed(() => {
    return imageStore.fileDimensions.height
  })
  const minTextPositionY = computed(() => {
    const object = imageStore.getSvgObjectById(imageStore.selectedSvgObjectId)
    if (!object || !object.textBBox) return 0

    return round(object.textBBox.height / 2)
  })

  /**
   * Reset local settings to defaults
   */
  const resetTextSettings = () => {
    localTextSettings.value.text = ''
    localTextSettings.value.size = 16
    localTextSettings.value.color = '#000000'
    localTextSettings.value.fontFamily = 'Arial'
    localTextSettings.value.rotation = 0
    localTextSettings.value.opacity = 1
    localTextSettings.value.letterSpacing = 0
    localTextSettings.value.bold = false
    localTextSettings.value.italic = false
    localTextSettings.value.underline = false

    activeObject.value = null
  }

  /**
   * Load settings from selected text object
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (id) => {
      if (id !== null) {
        const obj = imageStore.getSvgObjectById(id)
        if (obj?.tag === 'text') {
          hidePosition.value = false

          activeObject.value = obj
          const { attrs, content } = obj

          // Position
          localTextSettings.value.x = parseFloat(attrs.x) || 0
          localTextSettings.value.y = parseFloat(attrs.y) || 0

          // Text content
          localTextSettings.value.text = content || ''

          // Size
          localTextSettings.value.size = parseInt(attrs['font-size']) || 16

          // Color
          localTextSettings.value.color = attrs.fill || '#000000'

          // Font family
          localTextSettings.value.fontFamily = attrs['font-family'] || 'Arial'

          // Rotation angle
          localTextSettings.value.rotation = attrs.transform
            ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
            : 0

          // Opacity
          localTextSettings.value.opacity = attrs.opacity !== undefined ? attrs.opacity : 1

          // Letter spacing
          localTextSettings.value.letterSpacing = attrs['letter-spacing']
            ? parseFloat(attrs['letter-spacing'])
            : 1

          // Bold, italic, underline
          localTextSettings.value.bold = attrs['font-weight'] === 'bold'
          localTextSettings.value.italic = attrs['font-style'] === 'italic'
          localTextSettings.value.underline = attrs['text-decoration'] === 'underline'
        } else {
          resetTextSettings()
        }
      } else {
        resetTextSettings()
        hidePosition.value = true
      }
    },
    { immediate: true },
  )

  /**
   * Update the localTextSettings when activeObject changes outside this composable
   */
  watchEffect(() => {
    const object = activeObject.value
    if (!object || editorStore.selectedToolKey !== 'text') return

    const { attrs } = object

    // Position
    localTextSettings.value.x = parseFloat(attrs.x) || 0
    localTextSettings.value.y = parseFloat(attrs.y) || 0

    // Rotation angle
    localTextSettings.value.rotation = attrs.transform
      ? parseFloat(attrs.transform.match(/rotate\(([^)]+)\)/)?.[1]) || 0
      : 0
  })

  /**
   * Apply current local settings to the selected text object
   */
  const applyLocalTextSettings = () => {
    const object = activeObject.value

    if (!object || object.tag !== 'text') return

    const { attrs } = object
    const settings = localTextSettings.value

    // Update position
    attrs.x = settings.x
    attrs.y = settings.y // Adjust Y to center text vertically

    // Content
    object.content = settings.text

    // Size
    attrs['font-size'] = `${settings.size}px`

    // Color
    attrs.fill = settings.color

    // Font family
    attrs['font-family'] = settings.fontFamily

    // Rotation
    attrs.transform = `rotate(${settings.rotation}, ${object.textBBox.x + object.textBBox.width / 2}, ${object.textBBox.y + object.textBBox.height / 2})`

    // Opacity
    attrs.opacity = settings.opacity

    // Letter spacing
    attrs['letter-spacing'] = `${settings.letterSpacing}px`

    // Bold, italic, underline
    attrs['font-weight'] = settings.bold ? 'bold' : 'normal'
    attrs['font-style'] = settings.italic ? 'italic' : 'normal'
    attrs['text-decoration'] = settings.underline ? 'underline' : 'none'

    attrs.style = `
      font-weight: ${settings.bold ? 'bold' : 'normal'};
      font-style: ${settings.italic ? 'italic' : 'normal'};
      text-decoration: ${settings.underline ? 'underline' : 'none'};
      letter-spacing: ${settings.letterSpacing}px;
    `

    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Add new text object to canvas
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  const addTextObject = (x, y) => {
    if (!localTextSettings.value.text.trim()) return

    const id = Date.now()
    const fontSize = localTextSettings.value.size

    imageStore.svgObjects.push({
      id,
      tag: 'text',
      class: 'text',
      content: localTextSettings.value.text,
      attrs: {
        x,
        y: y + fontSize / 2,
        'font-size': `${fontSize}px`,
        fill: localTextSettings.value.color,
        'font-family': localTextSettings.value.fontFamily,
        transform: 'rotate(0, 0, 0)',
        opacity: localTextSettings.value.opacity,
        'letter-spacing': `${localTextSettings.value.letterSpacing}px`,
        'font-weight': localTextSettings.value.bold ? 'bold' : 'normal',
        'font-style': localTextSettings.value.italic ? 'italic' : 'normal',
        'text-decoration': localTextSettings.value.underline ? 'underline' : 'none',

        style: `
          font-weight: ${localTextSettings.value.bold ? 'bold' : 'normal'};
          font-style: ${localTextSettings.value.italic ? 'italic' : 'normal'};
          text-decoration: ${localTextSettings.value.underline ? 'underline' : 'none'};
          letter-spacing: ${localTextSettings.value.letterSpacing}px;
        `,
      },
    })

    imageStore.selectedSvgObjectId = id
    historyStore.push(imageStore.getSnapshot(t))
  }

  /**
   * Reset the opacity of the text object
   */
  const resetOpacity = () => {
    localTextSettings.value.opacity = 1
    applyLocalTextSettings()
  }

  /**
   * Reset the rotation angle of the shape object
   */
  const resetRotationAngle = () => {
    localTextSettings.value.rotation = 0
    applyLocalTextSettings()
  }

  /**
   * Reset the letter spacing of the text object
   */
  const resetLetterSpacing = () => {
    localTextSettings.value.letterSpacing = 0
    applyLocalTextSettings()
  }

  /**
   * Toggle bold style for the text object
   */
  const setBoldStyle = () => {
    localTextSettings.value.bold = !localTextSettings.value.bold
    applyLocalTextSettings()
  }

  /**
   * Toggle italic style for the text object
   */
  const setItalicStyle = () => {
    localTextSettings.value.italic = !localTextSettings.value.italic
    applyLocalTextSettings()
  }

  /**
   * Toggle underline style for the text object
   */
  const setUnderlineStyle = () => {
    localTextSettings.value.underline = !localTextSettings.value.underline
    applyLocalTextSettings()
  }

  return {
    localTextSettings,
    textSizeOptions,
    textFontOptions,
    resetTextSettings,
    applyLocalTextSettings,
    addTextObject,
    resetRotationAngle,
    resetOpacity,
    resetLetterSpacing,
    setBoldStyle,
    setItalicStyle,
    setUnderlineStyle,
    maxTextPositionX,
    maxTextPositionY,
    minTextPositionY,
    hidePosition,
  }
}
