<script setup>
import { useFileTabs } from '@/composables/editor/useFileTabs'
import { useUiStore } from '@/stores/uiStore'
import { useI18n } from 'vue-i18n'

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
  onTabDragStart,
  onTabDrop,
  wrapperRef,
} = useFileTabs(useUiStore(), t)

</script>

<template>
  <div class="file-tabs">
    <div class="scroll-container" ref="wrapperRef">
      <div class="tabs-wrapper">
        <div v-for="(tab, i) in tabs" :key="tab.id" class="tab" draggable="true" @dragstart="onTabDragStart(i)"
          @drop.prevent="onTabDrop(i)" @dragover.prevent :class="{ active: i === activeTabIndex }"
          @click="setActiveTab(i)">
          <p>{{ tab.name }}</p>
          <span class="tab-close" @click.stop="closeTab(i)">✕</span>
        </div>
      </div>
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
  overflow-x: auto;
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
  height: 100%;
}

.tab {
  padding: 0 8px 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  border-right: var(--border-ui);
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
</style>
