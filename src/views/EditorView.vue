<script setup>
import ToolsPanel from '@/components/tools/ToolsPanel.vue';
import CollapsiblePanel from '@/components/common/CollapsiblePanel.vue';
import ToolsSettingsPanel from '@/components/toolsSettings/ToolsSettingsPanel.vue';
import ViewportWrapper from '@/components/editor/ViewportWrapper.vue';
</script>

<template>
  <div class="editor-view">
    <ToolsPanel />
    <div class="editor-content">
      <ViewportWrapper />
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
  justify-content: space-between;
  width: 100%;
  height: 100%;
}

.editor-content {
  flex: 1;
}

</style>
