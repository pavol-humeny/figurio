import { ref, watch } from 'vue'

/**
 * Local editable settings for text tool
 */
const localTextSettings = ref({
  text: '',
  size: 16,
  color: '#000000',
  fontFamily: 'Arial',
})

/**
 * Text editing logic for SVG text objects
 * @param {Object} imageStore - Store containing svgObjects
 * @param {Object} historyStore - History store
 * @param {Function} t - Translation function
 */
export function useTextTool(imageStore, historyStore, t) {
  const activeObject = ref(null)

  const textSizeOptions = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72]
  const textFontOptions = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Verdana', value: 'Verdana' },
  ]

  /**
   * Reset local settings to defaults
   */
  const resetTextSettings = () => {
    localTextSettings.value = {
      text: '',
      size: 16,
      color: '#000000',
      fontFamily: 'Arial',
    }
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
          activeObject.value = obj
          const { attrs, content } = obj

          localTextSettings.value.text = content || ''
          localTextSettings.value.size = parseInt(attrs['font-size']) || 16
          localTextSettings.value.color = attrs.fill || '#000000'
          localTextSettings.value.fontFamily = attrs['font-family'] || 'Arial'
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
   * Apply current local settings to the selected text object
   */
  const applyLocalTextSettings = () => {
    const object = activeObject.value
    if (!object || object.tag !== 'text') return

    const s = localTextSettings.value
    object.content = s.text
    object.attrs['font-size'] = `${s.size}px`
    object.attrs.fill = s.color
    object.attrs['font-family'] = s.fontFamily

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
      },
    })

    imageStore.selectedSvgObjectId = id
    historyStore.push(imageStore.getSnapshot(t))
  }

  return {
    localTextSettings,
    textSizeOptions,
    textFontOptions,
    resetTextSettings,
    applyLocalTextSettings,
    addTextObject,
  }
}
