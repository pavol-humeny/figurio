<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'

const editorStore = useEditorStore()

const tabs = ['auto', 'manual']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <div
        v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'auto'"
        class="specific-settings"
      >
        <div class="settings-content-wrapper">
          
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
