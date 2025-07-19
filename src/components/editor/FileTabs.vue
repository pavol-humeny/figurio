<script setup>
import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/uiStore'

const uiStore = useUiStore()

const wrapperRef = ref(null)
const dragIndex = ref(null)

const workspaceStore = useWorkspaceStore()
const { tabs, activeTabIndex } = storeToRefs(workspaceStore)

const setActiveTab = async (index) => {
  if (index !== activeTabIndex.value) {
    uiStore.isLoading = true

    await new Promise((resolve) => setTimeout(resolve, 50))

    workspaceStore.updateCurrentTabState()
    workspaceStore.switchToTab(index)

    await new Promise((resolve) => setTimeout(resolve, 300))

    uiStore.isLoading = false
  }
}

const closeTab = (index) => {
  workspaceStore.updateCurrentTabState()
  workspaceStore.closeTab(index)
}

const onTabDragStart = (index) => {
  dragIndex.value = index
}

const onTabDrop = (index) => {
  if (dragIndex.value === null || dragIndex.value === index) return
  const movedTab = tabs.value.splice(dragIndex.value, 1)[0]
  tabs.value.splice(index, 0, movedTab)
  if (activeTabIndex.value === dragIndex.value) {
    activeTabIndex.value = index
  } else if (
    activeTabIndex.value > dragIndex.value && activeTabIndex.value <= index
  ) {
    activeTabIndex.value--
  } else if (
    activeTabIndex.value < dragIndex.value && activeTabIndex.value >= index
  ) {
    activeTabIndex.value++
  }
  dragIndex.value = null
}

onMounted(() => {
  const element = wrapperRef.value
  if (!element) return
  element.addEventListener(
    'wheel',
    (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        element.scrollBy({ left: e.deltaY / 4, behavior: 'auto' })
      }
    },
    { passive: false },
  )
})

</script>

<template>
  <div class="file-tabs">
    <div class="scroll-container" ref="wrapperRef">
      <div class="tabs-wrapper">
        <div v-for="(tab, i) in tabs" :key="tab.id" class="tab" draggable="true" @dragstart="onTabDragStart(i)"
          @drop.prevent="onTabDrop(i)" @dragover.prevent :class="{ active: i === activeTabIndex }">
          <p @click="setActiveTab(i)">{{ tab.name }}</p>
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
