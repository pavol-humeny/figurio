<script setup>
import { defineProps } from 'vue'
import { useEditorStore } from '@/stores/editorStore'
import { useToolsSettingsTabs } from '@/composables/toolsSettings/useToolsSettingsTabs'

const editorStore = useEditorStore()

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  }
})

const {
  activeTab,
  wrapperRef,
  setActiveTab
} = useToolsSettingsTabs(editorStore, props.tabs[0])

</script>

<template>
  <div class="settings-tabs">
    <div
      class="tabs-wrapper"
      ref="wrapperRef"
    >
      <div
        class="tab"
        v-for="tab in props.tabs"
        :key="tab"
        :class="{ active: tab === activeTab }"
        @click="setActiveTab(tab)"
      >
        {{ tab }}
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
  padding-right: 30px;
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
.tab.active {
  background: var(--secondary-c);
  color: var(--primary-c);
}
</style>
