<script setup>
import { ref, onMounted } from 'vue'

const wrapperRef = ref(null)

const isDragging = ref(false)
const startX = ref(0)

const tabs = ref([
  { name: 'Untitled-1' },
  { name: 'Untitled-2' },
  { name: 'Untitled-3' },
  { name: 'Untitled-4' },
  { name: 'Untitled-5' },
])
const activeTabIndex = ref(0)

const setActiveTab = (index) => {
  activeTabIndex.value = index
}

const closeTab = (index) => {
  tabs.value.splice(index, 1)
  if (index === activeTabIndex.value) {
    // If active tab was removed
    activeTabIndex.value = Math.max(0, index - 1)
  } else if (index < activeTabIndex.value) {
    // Adjust active index if removed tab was before it
    activeTabIndex.value--
  }
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

  // Check if horizontal scrolling is possible
  const canScroll = element.scrollWidth > element.clientWidth
  if (!canScroll) return // prevent dragging if not scrollable

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
        <div v-for="(tab, i) in tabs" :key="i" class="tab"
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
  /* border: solid 1px blue; */
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
