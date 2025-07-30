import { ref, watch } from 'vue'

/**
 * Current text settings for editing
 */
export const textSettings = ref({
  text: '',
  size: 16,
  color: '#000000',
  fontFamily: 'Arial',
})

/**
 * Text editing logic for SVG text objects
 * @param {Object} imageStore - Store containing svgObjects
 * @param {Function} t - Translation function
 */
export function useTextTool(imageStore) {
  const textSizeOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]

  const textFontOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Verdana', value: 'Verdana' },
  ]

  const resetTextSettings = () => {
    textSettings.value = {
      text: '',
      size: 16,
      color: '#000000',
      fontFamily: 'Arial',
    }
  }

  /**
   * Load text settings when text object is selected
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId != null) {
        const object = imageStore.getSvgObjectById(newId)
        if (object && object.tag === 'text') {
          const { attrs, content } = object
          textSettings.value.text = content || ''
          textSettings.value.size = parseInt(attrs['font-size']) || 16
          textSettings.value.color = attrs.fill || '#000000'
          textSettings.value.fontFamily = attrs['font-family'] || 'Arial'
        } else {
          resetTextSettings()
        }
      } else {
        resetTextSettings()
      }
    },
    { immediate: true },
  )

  /**
   * Update the SVG object when textSettings change
   */
  watch(
    textSettings,
    (newVal) => {
      const id = imageStore.selectedSvgObjectId
      if (id == null) return
      const object = imageStore.getSvgObjectById(id)
      if (!object || object.tag !== 'text') return

      object.content = newVal.text
      object.attrs['font-size'] = `${newVal.size}px`
      object.attrs.fill = newVal.color
      object.attrs['font-family'] = newVal.fontFamily
    },
    { deep: true },
  )

  /**
   * Add new text object to imageStore
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  const addTextObject = (x, y) => {
    const id = Date.now()
    const fontSize = textSettings.value.size

    console.log(`Adding text object at (${x}, ${y}) with size ${fontSize}`, textSettings.value)

    // if text is empty, do not add
    if (!textSettings.value.text.trim()) return

    imageStore.svgObjects.push({
      id,
      tag: 'text',
      class: 'text',
      content: textSettings.value.text || '',
      attrs: {
        x,
        y: y + fontSize / 2,
        'font-size': `${textSettings.value.size}px`,
        fill: textSettings.value.color,
        'font-family': textSettings.value.fontFamily,
        transform: 'rotate(0, 0, 0)', // default
      },
    })

    imageStore.selectedSvgObjectId = id
  }

  return {
    textSizeOptions,
    textFontOptions,
    textSettings,
    resetTextSettings,
    addTextObject,
  }
}
