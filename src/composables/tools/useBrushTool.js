import { ref } from 'vue'

export function useBrushTool(imageStore, historyStore, t) {
  const brushToolType = ref('brush')
  const brushColor = ref('#000000')

  return {
    brushColor,
    brushToolType,
  }
}
