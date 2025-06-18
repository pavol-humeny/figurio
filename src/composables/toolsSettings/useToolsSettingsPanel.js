import { computed, defineAsyncComponent } from 'vue';
import { toolsDefinitions } from '@/config/toolsDefinitions'

export function useToolsSettingsPanel(editorStore) {
  const toolDefinition = computed(() =>
    toolsDefinitions.find(t => t.key === editorStore.selectedToolKey)
  )

  // Lazy load the settings component
  const settingsComponent = computed(() => {
    if (!toolDefinition.value) return null
    return toolDefinition.value.settingsComponent
      ? defineAsyncComponent(toolDefinition.value.settingsComponent)
      : null
  })

  return {
    settingsComponent
  }
}
