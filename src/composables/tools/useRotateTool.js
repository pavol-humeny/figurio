import { ref } from 'vue'

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
  }

  const applyRotation = (angle) => {
    imageStore.applyRotation(angle, t)
  }

  const resetRotation = () => {
    imageStore.resetRotation()
  }

  return {
    applyRotation90,
    resetRotation,
    applyRotation,
    rotationAngle,
  }
}
