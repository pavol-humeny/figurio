<script setup>
/**
 * @file: FileTabs.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { useFileTabs } from '@/composables/editor/useFileTabs'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import draggable from 'vuedraggable'

const { t } = useI18n()

/**
 * Reference to the scrollable tabs container
 * @type {import('vue').Ref<HTMLElement | null>}
 */
// const wrapperRef = ref(null)

/**
 * Logic of the file tabs (drag & drop, active tab, closing)
 */
const {
  tabs,
  activeTabIndex,
  setActiveTab,
  closeTab,
  wrapperRef,
  isDraggingTab,
  onDragMove,
  stopAutoScroll,
  onTabsReorder,
} = useFileTabs(useUiStore(), useViewportStore(), useImageStore(), useEditorStore(), t)

</script>

<template>
  <div class="file-tabs">
    <div class="scroll-container" ref="wrapperRef">
      <draggable v-model="tabs" item-key="id" class="tabs-wrapper" :animation="150" :ghost-class="'tab-ghost'"
        :chosen-class="'tab-chosen'" @start="isDraggingTab = true" @end="(e) => {
          isDraggingTab = false
          stopAutoScroll()
          onTabsReorder(e)
        }" @move="onDragMove">
        <template #item="{ element: tab, index: i }">
          <div class="tab" :class="{ active: i === activeTabIndex }" @click="setActiveTab(i)">
            <p>{{ tab.name }}.{{ tab.fileExtension }}</p>
            <span class="tab-close" @click.stop="closeTab(i)">✕</span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<style scoped>
.file-tabs {
  height: 30px;
  width: 100%;
  border-bottom: var(--border-ui);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  z-index: var(--z-index-file-tabs);
  background: var(--background-c);
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.tabs-wrapper {
  display: flex;
  min-width: max-content;
  overflow-x: auto;
  overscroll-behavior: contain;
  height: 100%;
}

.tab {
  padding: 0 8px 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: var(--border-ui);
  border-left: var(--border-ui);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.tab p {
  font-size: var(--file-tabs-name-font-size);
}

.tab:hover {
  background: var(--secondary-c);
}

.tab.active {
  background: var(--secondary-c);
  color: var(--primary-c);
}

.tab-close {
  margin-left: 20px;
  padding-bottom: 2px;
  cursor: pointer;
  opacity: 0.5;
  user-select: none;
}

.tab-close:hover {
  opacity: 1;
}

.tab-ghost {
  opacity: 0;
}
</style>
