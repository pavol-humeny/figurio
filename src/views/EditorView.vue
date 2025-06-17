<script setup>
import ToolsPanel from '@/components/tools/ToolsPanel.vue';
</script>

<template>
  <div class="editor-view">
    <ToolsPanel />
    <div class="editor-content">
a
    </div>
    <div class="right-panel">
      a
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

.right-panel {
  background: rgb(93, 168, 63);
  width: 300px;
}
</style>
