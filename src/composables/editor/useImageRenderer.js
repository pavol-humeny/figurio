import { onMounted, watch, ref, nextTick } from 'vue'
import { useFlipTool } from '../tools/useFlipTool'
import { useRotateTool } from '../tools/useRotateTool'
import { useFrameTool } from '../tools/useFrameTool'
import { useSmartCropTool } from '../tools/useSmartCropTool'
import { useCropTool } from '../tools/useCropTool'
// import { useViewportStore } from '@/stores/viewportStore'

export function useImageRenderer(
  imageStore,
  historyStore,
  editorStore,
  viewportStore,
  contentRef,
  t,
) {
  const canvasRef = ref(null)
  const svgRef = ref(null)

  const updateSizes = () => {
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    if (contentRef.value) {
      contentRef.value.style.width = `${width}px`
      contentRef.value.style.height = `${height}px`
    }
    if (svgRef.value) {
      svgRef.value.style.width = `${width}px`
      svgRef.value.style.height = `${height}px`
    }
    if (canvasRef.value) {
      canvasRef.value.style.width = `${width}px`
      canvasRef.value.style.height = `${height}px`
      canvasRef.value.width = width
      canvasRef.value.height = height
    }
    // if (pdfWrapperRef.value) {
    //   pdfWrapperRef.value.style.width = `${width}px`
    //   pdfWrapperRef.value.style.height = `${height}px`
    // }
  }

  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.renderedImage || imageStore.fileType === 'pdf') return

    console.log('Rendering canvas...')

    const ctx = canvasRef.value.getContext('2d')

    let width = 0
    let height = 0

    if (imageStore.imageOperations.frame?.enabled) {
      width = imageStore.imageOperations.frame.width * 2 + imageStore.fileDimensions.width
      height = imageStore.imageOperations.frame.width * 2 + imageStore.fileDimensions.height
      console.log('Applying frame dimensions:', width, height)
    } else {
      width = imageStore.fileDimensions.width
      height = imageStore.fileDimensions.height
    }

    canvasRef.value.width = width
    canvasRef.value.height = height

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(imageStore.renderedImage, 0, 0)

    if (historyStore.history.length === 0) {
      historyStore.push(imageStore.getSnapshot())
    }

    imageStore.previewUrl = canvasRef.value.toDataURL()
  }

  const renderSvg = () => {
    if (!svgRef.value || !imageStore.svgObjects) return

    console.log('Rendering SVG...')

    const svg = svgRef.value
    svg.innerHTML = ''

    imageStore.svgObjects.forEach((obj) => {
      if (!obj.tag) return

      const el = document.createElementNS('http://www.w3.org/2000/svg', obj.tag)

      if (obj.attrs && typeof obj.attrs === 'object') {
        for (const [key, value] of Object.entries(obj.attrs)) {
          el.setAttribute(key, value)
        }
      }

      svg.appendChild(el)
    })
  }

  const renderAll = async () => {
    updateSizes()
    renderCanvas()
    renderSvg()
  }

  onMounted(() => {
    nextTick(() => {
      if (imageStore.renderedImage || imageStore.renderedPdf) {
        renderAll()
      }
    })
  })

  watch(
    () => [imageStore.originalImage, imageStore.imageOperations],
    async () => {
      imageStore.renderedImage = imageStore.originalImage
      imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

      console.log('[watch] Original image or operations changed, applying operations')
      if (imageStore.imageOperations.transformations?.length > 0) {
        console.log('Applying transformations:', imageStore.imageOperations.transformations)

        const transformations = imageStore.getTransformations()

        for (const operation of transformations) {
          switch (operation.type) {
            case 'flip':
              console.log('Applying flip operation:', operation.value)
              await useFlipTool(imageStore, historyStore).applyFlipRender(operation.value)
              break
            case 'rotate':
              console.log('Applying rotate operation:', operation.value)
              await useRotateTool(imageStore, historyStore, t).applyRotationRender(operation.value)
              break
            case 'crop':
              console.log('Applying crop operation:', operation.value)
              await useCropTool(
                imageStore,
                viewportStore,
                editorStore,
                historyStore,
                t,
              ).applyCropRender(operation.value)
              break
          }
        }
      }

      if (imageStore.imageOperations.smartCrop?.enabled) {
        console.log('Applying smart crop operation')
        await useSmartCropTool(imageStore, historyStore, editorStore, t).applyAutoSmartCropRender()
      }

      if (imageStore.imageOperations.frame?.enabled) {
        console.log('Applying frame operation')
        await useFrameTool(imageStore, historyStore, editorStore, t).applyFrameRender()
      }

      // await nextTick()
      renderAll()
    },
    { deep: true },
  )

  // let previousImageOperations = JSON.stringify(imageStore.imageOperations)
  // let suspendWatch = false

  // watch(
  //   () => [imageStore.imageOperations],
  //   async ([imageOperations]) => {
  //     if (suspendWatch) return // Zablokuj rekurziu

  //     await nextTick()

  //     const currentOps = JSON.stringify(imageOperations)

  //     if (currentOps !== previousImageOperations) {
  //       previousImageOperations = currentOps
  //       console.log('[watch] imageOperations changed, applying operations')

  //       suspendWatch = true // 🔒 Zablokuj spätné spustenie počas úprav

  //       // Obnov pôvodný obrázok
  //       imageStore.renderedImage = imageStore.originalImage
  //       imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

  //       // Aplikuj všetky transformácie
  //       if (imageOperations.transformations?.length > 0) {
  //         for (const operation of imageOperations.transformations) {
  //           switch (operation.type) {
  //             case 'flip':
  //               console.log('Applying flip operation:', operation.value)
  //               await useFlipTool(imageStore, historyStore).applyFlipRender(operation.value)
  //               break
  //             case 'rotate':
  //               console.log('Applying rotate operation:', operation.value)
  //               await useRotateTool(imageStore, historyStore, t).applyRotationRender(
  //                 operation.value,
  //               )
  //               break
  //           }
  //         }
  //       }

  //       if (imageOperations.smartCrop?.enabled) {
  //         console.log('Applying smart crop operation')
  //         await useSmartCropTool(
  //           imageStore,
  //           historyStore,
  //           editorStore,
  //           t,
  //         ).applyAutoSmartCropRender()
  //       }

  //       if (imageOperations.frame?.enabled) {
  //         console.log('Applying frame operation')
  //         await useFrameTool(imageStore, historyStore, editorStore, t).applyFrameRender()
  //       }

  //       await nextTick()
  //       renderAll()

  //       suspendWatch = false // 🔓 Opäť povol reakciu
  //     }
  //     // else {
  //     //   // Ak sa nezmenili operácie, iba prekresli
  //     //   console.log('[watch] only renderedImage changed')
  //     //   renderAll()
  //     // }
  //   },
  //   { deep: true },
  // )

  // watch(
  //   () => imageStore.originalImage,
  //   () => {
  //     if (imageStore.historyRestore) {
  //       imageStore.historyRestore = false
  //       imageStore.renderedImage = imageStore.originalImage
  //       imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

  //       console.log('[watch] History restore in progress, skipping original image change')
  //       return
  //     }

  //     console.log('[watch] Original image changed, resetting operations')

  //     imageStore.renderedImage = imageStore.originalImage
  //     imageStore.fileDimensions = { ...imageStore.originalFileDimensions }

  //     renderAll()
  //   },
  // )

  return {
    canvasRef,
    svgRef,
  }
}
