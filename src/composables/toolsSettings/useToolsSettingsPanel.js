/**
 * @file: useToolsSettingsPanel.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Composable for loading the settings panel component for the currently selected tool in the editor, using dynamic imports to load only the necessary settings component based on the selected tool key.
 */
import { computed, defineAsyncComponent } from 'vue'
import { toolsDefinitions } from '@/config/toolsDefinitions'

/**
 * Logic for loading the settings panel component
 * @param {object} editorStore - Editor store managing the current selected tool and its state
 */
export function useToolsSettingsPanel(editorStore) {
  const asyncComponentsMap = Object.fromEntries(
    toolsDefinitions
      .filter((t) => t.settingsComponent)
      .map((t) => [
        t.key,
        defineAsyncComponent({
          loader: t.settingsComponent,
          suspensible: false,
        }),
      ]),
  )

  /**
   * Computed property to get the settings component for the currently selected tool, or null if there is no settings component defined for that tool
   */
  const settingsComponent = computed(() => {
    return asyncComponentsMap[editorStore.selectedToolKey] || null
  })

  return {
    settingsComponent,
  }
}
