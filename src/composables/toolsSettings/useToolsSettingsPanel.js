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

  const hasSettings = computed(() => !!toolDefinition.value?.settingsComponent)

  /**
   * Dynamically import the settings component (lazy load the settings component)
   */
  const settingsComponent = computed(() => {
    if (!hasSettings.value) return null
    return defineAsyncComponent(toolDefinition.value.settingsComponent)
  })

  return {
    settingsComponent,
  }
}
