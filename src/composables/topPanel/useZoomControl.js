import { ref, computed, watch } from 'vue'
import { useToastModal } from '@/composables/modals/useToastModal'

export function useZoomControl(viewportStore, t) {
  const { showToastModal } = useToastModal()

  const zoomLevelInput = ref(Math.round(viewportStore.zoomLevel * 100))

  watch(() => viewportStore.zoomLevel, (newZoom) => {
    zoomLevelInput.value = Math.round(newZoom * 100)
  })

  const canZoomIn = computed(() => viewportStore.zoomLevel < viewportStore.maxZoomLevel)
  const canZoomOut = computed(() => viewportStore.zoomLevel > viewportStore.minZoomLevel)

  const setZoomLevel = (value) => {
    const level = Number(value)
    if (isNaN(level) || level <= 0) {
      showToastModal(
        "error",
        t("topPanel.zoomControl.toast.errorNaN.title"),
        t("topPanel.zoomControl.toast.errorNaN.message")
      )
      zoomLevelInput.value = Math.round(viewportStore.zoomLevel * 100)
      return
    }

    const newLevel = level / 100
    if (newLevel < viewportStore.minZoomLevel || newLevel > viewportStore.maxZoomLevel) {
      showToastModal(
        "error",
        t("topPanel.zoomControl.toast.errorOutOfRange.title"),
        t("topPanel.zoomControl.toast.errorOutOfRange.message", {
          min: viewportStore.minZoomLevel * 100,
          max: viewportStore.maxZoomLevel * 100
        })
      )
      zoomLevelInput.value = Math.round(viewportStore.zoomLevel * 100)
      return
    }

    viewportStore.setZoomLevel(newLevel)
  };

  const zoomIn = (step) => {
    step = Number(step) || 0.1
    if (!canZoomIn.value) return
    viewportStore.zoomIn(step)
  }

  const zoomOut = (step) => {
    step = Number(step) || 0.1
    if (!canZoomOut.value) return
    viewportStore.zoomOut(step)
  }

  const resetZoom = () => {
    viewportStore.setZoomLevel(viewportStore.defaultZoomLevel)
  }

  const wheelZoom = (e) => {
    if (e.deltaY < 0) {
      zoomIn(0.01);
    } else if (e.deltaY > 0) {
      zoomOut(0.01);
    }
  }

  return {
    zoomLevel: zoomLevelInput,
    setZoomLevel,
    zoomIn,
    zoomOut,
    wheelZoom,
    resetZoom,
    canZoomIn,
    canZoomOut
  }
}
