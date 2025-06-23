import { ref, watch } from 'vue'

// One instance of freeCropBox
const freeCropBox = ref({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  dragging: false,
  resizing: false,
  resizeDir: '',
  startX: 0,
  startY: 0,
})

export function useTransformToolSettings(imageStore) {
  watch(
    () => imageStore.fileDimensions,
    (fileDimensions) => {
      if (fileDimensions.width && fileDimensions.height) {
        freeCropBox.value.width = fileDimensions.width
        freeCropBox.value.height = fileDimensions.height
        freeCropBox.value.x = 0
        freeCropBox.value.y = 0
      }
    },
    { immediate: true, deep: true },
  )

  const applyCrop = () => {
    imageStore.applyCrop(freeCropBox.value)
  }

  return {
    freeCropBox,
    applyCrop,
  }
}
