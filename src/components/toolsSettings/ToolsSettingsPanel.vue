<script setup>
import { computed } from 'vue'
import { useToolsSettingsPanel } from '@/composables/toolsSettings/useToolsSettingsPanel';
import { useEditorStore } from '@/stores/editorStore';
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

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
