import { onMounted, watch, ref, nextTick } from 'vue'

export function useImageRenderer(imageStore, contentRef) {
  const canvasRef = ref(null)
  const svgRef = ref(null)

  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.renderedImage || !contentRef.value) return

    const canvas = canvasRef.value
    const content = contentRef.value
    const svg = svgRef.value

    const ctx = canvas.getContext('2d')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    canvas.width = width
    canvas.height = height

    // Set canvas and svg size
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    svg.style.width = `${width}px`
    svg.style.height = `${height}px`

    // Set content size
    content.style.width = `${width}px`
    content.style.height = `${height}px`

    // Render image
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(imageStore.renderedImage, 0, 0)
  }

  const renderSvg = () => {
    if (!svgRef.value || !imageStore.svgObjects) return

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
    renderCanvas()
    renderSvg()
  }

  onMounted(() => {
    nextTick(() => {
      if (imageStore.renderedImage) {
        console.log("Rendering image on mount")
        renderAll()
      }
    })
  })

  watch(
    () => imageStore.renderedImage,
    (newImage) => {
      if (newImage) {
        nextTick(() => {
          console.log("Rendering image on change")
          renderAll()
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
