import { onUnmounted, ref } from 'vue'

export function useRotateTool(imageStore, t) {
  const rotationAngle = ref(0)

  const applyRotation90 = (direction) => {
    let angle = 0
    if (direction === 'left') {
      angle = -90
    } else if (direction === 'right') {
      angle = 90
    }
    imageStore.applyRotation(angle, t)
    rotationAngle.value = 0
  }

  const applyRotation = (angle, apply = false) => {
    if (apply) {
      rotationAngle.value = 0
    }
    imageStore.applyRotation(angle, t, apply)
  }

  const resetRotationAngle = () => {
    rotationAngle.value = 0
    imageStore.resetRotationPreview()
  }

  const setRotationAngleByScroll = (event) => {
    event.preventDefault()

    const delta = event.deltaY > 0 ? -1 : 1
    const newAngle = Math.max(-45, Math.min(45, rotationAngle.value + delta))
    rotationAngle.value = newAngle
    imageStore.applyRotation(rotationAngle.value, t)
  }

  onUnmounted(() => {
    console.log('Rotate tool unmounted, cleaning up...')
  })

  return {
    applyRotation90,
    applyRotation,
    rotationAngle,
    resetRotationAngle,
    setRotationAngleByScroll,
  }
}
