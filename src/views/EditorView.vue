<script setup>
import ToolsPanel from '@/components/tools/ToolsPanel.vue';
import CollapsiblePanel from '@/components/common/CollapsiblePanel.vue';
import ToolsSettingsPanel from '@/components/toolsSettings/ToolsSettingsPanel.vue';
</script>

<template>
  <div class="editor-view">
    <ToolsPanel />
    <div class="editor-content">
      a
    </div>
    <div class="right-panel">
      <CollapsiblePanel>
        <ToolsSettingsPanel />
      </CollapsiblePanel>
    </div>
  </div>
</template>

<style scoped>
.editor-view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
}

.editor-content {
  background: rgb(51, 146, 146);
  flex: 1;
}

</style>
