import { ref } from 'vue'
import { useMath } from '../common/useMath'

export function useRotateTool(imageStore, t) {
  const { clamp } = useMath()
  const rotationAngle = ref(0)
  const rotationAngleInputRef = ref(null)

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
    angle = clamp(angle, -45, 45)
    rotationAngleInputRef.value.setValue(angle)

    imageStore.applyRotation(angle, t, apply)
  }

  const resetRotationAngle = () => {
    rotationAngle.value = 0
    imageStore.resetRotationPreview()
  }

  return {
    applyRotation90,
    applyRotation,
    rotationAngle,
    resetRotationAngle,
    rotationAngleInputRef,
  }
}
