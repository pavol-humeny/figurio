<script setup>
/**
 * @file: ToolsSettingsPanel.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the tools settings panel in the editor. Dynamically renders the settings component for the currently selected tool and manages the display of the SVG objects list based on the selected tool and presence of SVG objects.
 */
import { computed, onMounted } from 'vue'
import { useToolsSettingsPanel } from '@/composables/toolsSettings/useToolsSettingsPanel';
import { useEditorStore } from '@/stores/editorStore';
import { useUiStore } from '@/stores/uiStore'
import { useImageStore } from '@/stores/imageStore';

const uiStore = useUiStore()
const editorStore = useEditorStore()
const imageStore = useImageStore()

/**
 * Logic of the tools settings panel
 */
const {
  settingsComponent
} = useToolsSettingsPanel(useEditorStore());

/**
 * CSS variables for the panel styling
 */
const panelVars = computed(() => {
  return {
    '--panel-height-opposite': uiStore.svgObjectsListDisplayed ? `${uiStore.svgObjectsListHeight}%` : '0%'
  }
})

/**
 * Check tool on component mount and display SVG objects list
 */
onMounted(() => {
  if (
    editorStore.selectedToolKey === 'shape' ||
    editorStore.selectedToolKey === 'blur' ||
    editorStore.selectedToolKey === 'magnifyArea' ||
    editorStore.selectedToolKey === 'text' ||
    editorStore.selectedToolKey === 'select'
  ) {
    if (
      imageStore.svgObjects.length > 0 ||
      imageStore.blurObjects.length > 0 ||
      imageStore.magnifyObjects.length > 0
    ) {
      uiStore.svgObjectsListDisplayed = true
    } else {
      uiStore.svgObjectsListDisplayed = false
    }
  } else {
    uiStore.svgObjectsListDisplayed = false
  }
})

</script>

<template>
  <div class="tools-settings-panel" :style="panelVars">
    <component :is="settingsComponent" v-if="settingsComponent" />
    <p v-else class="no-settings no-value">
      {{ $t('tools.noToolSelected.label') }}
    </p>
  </div>
</template>

<style scoped>
.tools-settings-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - var(--panel-height-opposite));
  z-index: var(--z-index-tools-settings-panel);
}

.no-settings {
  color: var(--text-c);
  font-size: var(--text-font-size);
  text-align: center;
  padding: 20px 0;
}
</style>
