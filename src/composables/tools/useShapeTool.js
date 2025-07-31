import { ref, watch } from 'vue'

export const objectSettings = ref({
  type: 'rect', // Default type
  fillColor: '#000000', // Default fill color
  strokeEnabled: true, // Default outline enabled
  strokeColor: '#e90000ff', // Default outline color
  strokeWidth: 1, // Default outline width
  width: 0, // Default width
  height: 0, // Default height
  x: 0, // Default x position
  y: 0, // Default y position
})

export function useShapeTool(editorStore, imageStore) {
  const objectTypeOptions = [
    { label: 'Rectangle', value: 'rect' },
    { label: 'Ellipse', value: 'ellipse' },
    { label: 'Line', value: 'line' },
  ]

  const resetObjectSettings = () => {
    objectSettings.value.type = 'rect'
    objectSettings.value.fillColor = '#000000'
    objectSettings.value.strokeEnabled = false
    objectSettings.value.strokeColor = '#000000'
    objectSettings.value.strokeWidth = 1
    objectSettings.value.width = 0
    objectSettings.value.height = 0
    objectSettings.value.x = 0
    objectSettings.value.y = 0
  }

  /**
   * Load text settings when text object is selected
   */
  watch(
    () => imageStore.selectedSvgObjectId,
    (newId) => {
      if (newId !== null) {
        const object = imageStore.getSvgObjectById(newId)
        if (
          object &&
          object.class === editorStore.selectedTabPerTool[editorStore.selectedToolKey]
        ) {
          const { attrs } = object
          objectSettings.value.type = object.tag
          objectSettings.value.x = attrs.x
          objectSettings.value.y = attrs.y
          objectSettings.value.width = attrs.width
          objectSettings.value.height = attrs.height
          objectSettings.value.fillColor = attrs.fill
          objectSettings.value.strokeEnabled = attrs['stroke-width'] > 0
          objectSettings.value.strokeColor = attrs.stroke
          objectSettings.value.strokeWidth = attrs['stroke-width']
        }
      }
    },
    { immediate: true },
  )

  watch(
    () => objectSettings.value,
    (newSettings) => {
      editorStore.selectTab(newSettings.type)
    },
    {
      immediate: true,
      deep: true,
    },
  )

  const getShapeAttributes = () => {
    return {
      type: objectSettings.value.type,
      fillColor: objectSettings.value.fillColor,
      strokeEnabled: objectSettings.value.strokeEnabled,
      strokeColor: objectSettings.value.strokeColor,
      strokeWidth: objectSettings.value.strokeWidth,
      width: objectSettings.value.width,
      height: objectSettings.value.height,
      x: objectSettings.value.x,
      y: objectSettings.value.y,
    }
  }

  return {
    objectSettings,
    objectTypeOptions,
    resetObjectSettings,
    getShapeAttributes,
  }
}
