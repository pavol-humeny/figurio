/**
 * @file: useToolsSettingsPanel.js
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
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

  const settingsComponent = computed(() => {
    return asyncComponentsMap[editorStore.selectedToolKey] || null
  })

  return {
    settingsComponent,
  }
}
