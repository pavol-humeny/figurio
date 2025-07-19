<script setup>
import { ref, onMounted } from 'vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { storeToRefs } from 'pinia'

const wrapperRef = ref(null)
const isDragging = ref(false)
const startX = ref(0)

const workspaceStore = useWorkspaceStore()
const { tabs, activeTabIndex } = storeToRefs(workspaceStore)

const setActiveTab = (index) => {
  if (index !== activeTabIndex.value) {
    workspaceStore.updateCurrentTabState()
    workspaceStore.switchToTab(index)
  }
}

const closeTab = (index) => {
  workspaceStore.updateCurrentTabState()
  workspaceStore.closeTab(index)
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

const onMouseMove = (e) => {
  const element = wrapperRef.value
  if (!element) return
  const deltaX = e.clientX - startX.value
  element.scrollBy({ left: -deltaX, behavior: 'auto' })
  startX.value = e.clientX
}

const onMouseUp = () => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  isDragging.value = false
}

const startDragging = (e) => {
  const element = wrapperRef.value
  if (!element) return
  const canScroll = element.scrollWidth > element.clientWidth
  if (!canScroll) return
  e.preventDefault()
  isDragging.value = true
  startX.value = e.clientX
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="file-tabs">
    <div class="scroll-container" ref="wrapperRef">
      <div class="tabs-wrapper">
        <div v-for="(tab, i) in tabs" :key="tab.id" class="tab"
          :class="{ active: i === activeTabIndex, grabbing: isDragging }" @mousedown="startDragging">
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

.tab.grabbing {
  cursor: grabbing;
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
