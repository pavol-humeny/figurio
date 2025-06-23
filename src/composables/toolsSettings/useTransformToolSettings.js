import { ref, watch } from 'vue'

// One instance of cropBox
const cropBox = ref({
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
        cropBox.value.width = fileDimensions.width
        cropBox.value.height = fileDimensions.height
        cropBox.value.x = 0
        cropBox.value.y = 0
      }
    },
    { immediate: true, deep: true },
  )

  const applyCrop = () => {
    imageStore.applyCrop(cropBox.value)
  }

  return {
    cropBox,
    applyCrop,
  }
}
