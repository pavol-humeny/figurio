import { ref } from 'vue'
import { editorConfig } from '@/config/editorConfig.js'

export function useBrushTool(imageStore, historyStore, t) {
  const brushToolType = ref('brush')
  const brushToolSize = ref(editorConfig.defaultManualToolSize)
  const brushColor = ref('#000000')

  return {
    brushColor,
    brushToolType,
    brushToolSize,
  }
}
