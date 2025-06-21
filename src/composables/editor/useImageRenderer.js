import { onMounted, watch, ref, nextTick } from 'vue'

export function useImageRenderer(imageStore, contentRef) {
  const canvasRef = ref(null)
  const svgRef = ref(null)
  const pdfWrapperRef = ref(null) // pre zobrazenie renderedPdf

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
    if (pdfWrapperRef.value) {
      pdfWrapperRef.value.style.width = `${width}px`
      pdfWrapperRef.value.style.height = `${height}px`
    }
  }

  const renderCanvas = () => {
    if (!canvasRef.value || !imageStore.renderedImage || imageStore.fileType === 'pdf') return

    const ctx = canvasRef.value.getContext('2d')
    const width = imageStore.fileDimensions.width
    const height = imageStore.fileDimensions.height

    canvasRef.value.width = width
    canvasRef.value.height = height

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

  const renderPdf = () => {
    if (!pdfWrapperRef.value || imageStore.fileType !== 'pdf' || !imageStore.renderedPdf) return

    pdfWrapperRef.value.innerHTML = ''
    const decoded = decodeURIComponent(imageStore.renderedPdf.slice(imageStore.renderedPdf.indexOf(',') + 1))
    pdfWrapperRef.value.innerHTML = decoded
  }

  const renderAll = async () => {
    updateSizes()
    renderCanvas()
    renderSvg()
    renderPdf()
  }

  onMounted(() => {
    nextTick(() => {
      if (imageStore.renderedImage || imageStore.renderedPdf) {
        renderAll()
      }
    })
  })

  watch(
    () => [imageStore.renderedImage, imageStore.renderedPdf],
    () => {
      nextTick(() => {
        renderAll()
      })
    },
    { deep: false }
  )

  return {
    canvasRef,
    svgRef,
    pdfWrapperRef,
  }
}
