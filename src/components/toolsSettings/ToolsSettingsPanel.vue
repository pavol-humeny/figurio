<script setup>
import { useToolsSettingsPanel } from '@/composables/toolsSettings/useToolsSettingsPanel';
import { useEditorStore } from '@/stores/editorStore';

/**
 * Logic of the tools settings panel
 */
const {
  settingsComponent
} = useToolsSettingsPanel(useEditorStore());

</script>

<template>
  <div class="tools-settings-panel">
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
  height: 100%;
  z-index: var(--z-index-tools-settings-panel);
}

.no-settings {
  color: var(--text-c);
  font-size: var(--text-font-size);
  text-align: center;
  padding: 20px 0;
}
</style>


