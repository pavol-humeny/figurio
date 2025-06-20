import { onMounted, watch, ref, nextTick } from 'vue'

export function useImageRenderer(imageStore, contentRef) {
  const canvasRef = ref(null)
  const svgRef = ref(null)

  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.renderedImage || !contentRef.value) return

    const canvas = canvasRef.value
    const content = contentRef.value
    const ctx = canvas.getContext('2d')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    // 1. Set canvas size
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // 2. Manually set content size to match canvas
    content.style.width = `${width}px`
    content.style.height = `${height}px`

    // 3. Render image
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(imageStore.renderedImage, 0, 0)

  }

  // const renderSvg = () => {
  //   if (!svgRef.value) return
  //   svgRef.value.innerHTML = ''

  //   imageStore.svgObjects.forEach((obj) => {
  //     const el = document.createElementNS('http://www.w3.org/2000/svg', obj.tag)
  //     Object.entries(obj.attrs).forEach(([key, value]) => {
  //       el.setAttribute(key, value)
  //     })
  //     svgRef.value.appendChild(el)
  //   })
  // }

  onMounted(() => {
    nextTick(() => {
      renderCanvas()
    })
  })
  watch(
    () => imageStore.renderedImage,
    (newImage) => {
      if (newImage) {
        nextTick(() => {
          renderCanvas()
        })
      }
    },
  )
  // watch(() => imageStore.svgObjects, renderSvg, { deep: true })

  return {
    canvasRef,
    svgRef,
  }
}
