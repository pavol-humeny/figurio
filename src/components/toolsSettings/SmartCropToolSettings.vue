<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import ColorPicker from '../common/ColorPicker.vue'

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
          <div class="content-wrapper">
            <div class="content-title">
              <p>Select color to remove</p>
            </div>
            <ColorPicker
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
