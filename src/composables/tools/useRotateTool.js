import { ref } from 'vue'
import { useMath } from '../common/useMath'
import { useConfirmModal } from '../modals/useConfirmModal'

export function useRotateTool(imageStore, historyStore, t) {
  const { clamp } = useMath()
  const { showConfirmModal } = useConfirmModal()
  const rotationAngle = ref(0)
  const rotationAngleInputRef = ref(null)

  // const applyRotation90 = (direction) => {
  //   let angle = 0
  //   if (direction === 'left') {
  //     angle = -90
  //   } else if (direction === 'right') {
  //     angle = 90
  //   }
  //   imageStore.applyRotation(angle, t)
  //   rotationAngle.value = 0
  // }

  // const applyRotation = (angle, apply = false) => {
  //   if (apply) {
  //     rotationAngle.value = 0
  //   }
  //   angle = clamp(angle, -45, 45)
  //   rotationAngleInputRef.value.setValue(angle)

  //   imageStore.applyRotation(angle, t, apply)
  // }

  const applyRotation = async (angle, applyCrop = false) => {
    if (!imageStore.renderedImage || !angle) return

    if (applyCrop) {
      rotationAngle.value = 0
    }

    if (imageStore.svgObjects.length > 0) {
      const confirmed = await showConfirmModal(
        t('tools.confirmNeedRasterization.title'),
        t('tools.confirmNeedRasterization.message'),
        t('tools.confirmNeedRasterization.cancel'),
        t('tools.confirmNeedRasterization.confirm'),
      )
      if (!confirmed) {
        rotationAngle.value = 0
        return
      }

      await imageStore.rasterize()
    }

    const isRightAngle = Math.abs(angle) % 90 === 0

    if (!isRightAngle) {
      angle = clamp(angle, -45, 45)
    }

    const radians = (angle * Math.PI) / 180

    if (imageStore.tmpImage === null) {
      imageStore.tmpImage = imageStore.renderedImage
      imageStore.tmpImageDimensions = { ...imageStore.fileDimensions }
    }

    const oldCanvas = imageStore.tmpImage
    const oldWidth = oldCanvas.width
    const oldHeight = oldCanvas.height

    const sin = Math.abs(Math.sin(radians))
    const cos = Math.abs(Math.cos(radians))

    const rotatedWidth = Math.round(oldWidth * cos + oldHeight * sin)
    const rotatedHeight = Math.round(oldWidth * sin + oldHeight * cos)

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = rotatedWidth
    tempCanvas.height = rotatedHeight
    const tempCtx = tempCanvas.getContext('2d')

    tempCtx.translate(rotatedWidth / 2, rotatedHeight / 2)
    tempCtx.rotate(radians)
    tempCtx.drawImage(oldCanvas, -oldWidth / 2, -oldHeight / 2)

    let finalCanvas, finalWidth, finalHeight

    if (!isRightAngle) {
      // Calculate the maximum inner rectangle that fits within the rotated image
      const theta = Math.abs(radians % (Math.PI / 2))
      const cosTheta = Math.cos(theta)
      const sinTheta = Math.sin(theta)

      const w = oldWidth
      const h = oldHeight

      const boundW = w * cosTheta + h * sinTheta
      const boundH = w * sinTheta + h * cosTheta

      let scale = 1
      if (w / h > boundW / boundH) {
        scale = boundH / h
      } else {
        scale = boundW / w
      }

      const cropWidth = (w * 1) / scale
      const cropHeight = (h * 1) / scale

      const cropX = (rotatedWidth - cropWidth) / 2
      const cropY = (rotatedHeight - cropHeight) / 2

      finalCanvas = document.createElement('canvas')
      finalCanvas.width = oldWidth
      finalCanvas.height = oldHeight
      const finalCtx = finalCanvas.getContext('2d')

      finalCtx.drawImage(
        tempCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        finalCanvas.width,
        finalCanvas.height,
      )

      finalWidth = finalCanvas.width
      finalHeight = finalCanvas.height

      if (applyCrop) {
        imageStore.tmpImage = null
        imageStore.tmpImageDimensions = null
      }
    } else {
      finalCanvas = tempCanvas
      finalWidth = rotatedWidth
      finalHeight = rotatedHeight
      imageStore.tmpImage = null
      imageStore.tmpImageDimensions = null
    }

    imageStore.renderedImage = finalCanvas
    imageStore.fileDimensions.width = finalWidth
    imageStore.fileDimensions.height = finalHeight
    imageStore.fileDimensions.fileAspectRatio = finalWidth / finalHeight || 1
    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
    imageStore.previewUrl = finalCanvas.toDataURL()

    if (isRightAngle || applyCrop) {
      historyStore.push(imageStore.getSnapshot())
    }
  }

  // const resetRotationAngle = () => {
  //   rotationAngle.value = 0
  //   imageStore.resetRotationPreview()
  // }
  const resetRotationAngle = () => {
    rotationAngle.value = 0

    if (!imageStore.tmpImage) return

    imageStore.renderedImage = imageStore.tmpImage
    imageStore.previewUrl = imageStore.tmpImage.toDataURL()
    imageStore.fileDimensions = { ...imageStore.tmpImageDimensions }
    imageStore.newFileDimensions = { ...imageStore.fileDimensions }
  }

  return {
    // applyRotation90,
    applyRotation,
    rotationAngle,
    resetRotationAngle,
    rotationAngleInputRef,
  }
}
