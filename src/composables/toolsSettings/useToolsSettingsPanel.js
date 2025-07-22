import { computed, defineAsyncComponent } from 'vue'
import { toolsDefinitions } from '@/config/toolsDefinitions'

/**
 * Logic for loading the settings panel component
 *
 * @param {object} editorStore - Editor store managing the current selected tool and its state
 * @returns {{
 *   settingsComponent: import('vue').ComputedRef<ReturnType<typeof defineAsyncComponent> | null>
 * }}
 */
export function useToolsSettingsPanel(editorStore) {
  /**
   * Return the tool definition of the currently selected tool
   */
  const toolDefinition = computed(() =>
    toolsDefinitions.find((t) => t.key === editorStore.selectedToolKey),
  )

  /**
   * Dynamically import the settings component (lazy load the settings component)
   */
  const settingsComponent = computed(() => {
    if (!toolDefinition.value) return null
    return toolDefinition.value.settingsComponent
      ? defineAsyncComponent(toolDefinition.value.settingsComponent)
      : null
  })

  return {
    settingsComponent,
  }
}
