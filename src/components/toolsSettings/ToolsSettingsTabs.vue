<script setup>
import { defineProps } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { useToolsSettingsTabs } from '@/composables/toolsSettings/useToolsSettingsTabs'

const editorStore = useEditorStore()

/**
 * @typedef {Object} ToolsSettingsTabsProps
 * @property {string[]} tabs - List of tab keys to display
 */

/** @type {ToolsSettingsTabsProps} */
const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
})

/**
 * Logic for managing active tab
 */
const { activeTab, isDragging, wrapperRef, setActiveTab, startDragging } = useToolsSettingsTabs(
  useEditorStore(),
  props.tabs[0],
)
</script>

<template>
  <div class="settings-tabs">
    <div class="tabs-wrapper" ref="wrapperRef">
      <div class="tab" v-for="tab in props.tabs" :key="tab" :class="{ active: tab === activeTab, grabbing: isDragging }"
        @click="setActiveTab(tab)" @mousedown="startDragging">
        {{ $t(`tools.${editorStore.selectedToolKey}.settings.${tab}.label`) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-tabs {
  width: 100%;
  height: 40px;
  border-bottom: var(--border-ui);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.tabs-wrapper {
  flex: 1;
  display: flex;
  overflow-x: auto;
  height: 100%;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE a starý Edge */
}

.tabs-wrapper::-webkit-scrollbar {
  display: none;
}

.tab {
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: var(--border-ui);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab:hover {
  background: var(--secondary-c);
}

.tab.grabbing {
  cursor: grabbing;
}

.tab.active {
  background: var(--secondary-c);
  color: var(--primary-c);
}
</style>
