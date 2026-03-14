<script setup>
/**
 * @file: CollapsiblePanel.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable collapsible panel component with a toggle button and resizable width. The panel can be shown or hidden, and its width can be adjusted by dragging the resize handle. Double-clicking the resize handle resets the panel to its default width.
 */
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useCollapsiblePanel } from '@/composables/common/useCollapsiblePanel'
import { useUiStore } from '@/stores/uiStore'

/**
 * Logic of the collapsible panel
 */
const {
  isVisible,
  toggleVisibility,
  rightSidePanelWidth,
  collapseButtonWidth,
  startResize,
  resetPanelWidth,
} =
  useCollapsiblePanel(useUiStore())
</script>

<template>
  <div class="collapsible-panel" :style="{ width: rightSidePanelWidth + 'px' }">
    <div class="toggle-button" @click="toggleVisibility" :style="{ width: collapseButtonWidth + 'px' }">
      <BaseIcon :name="isVisible ? 'IconArrowRight' : 'IconArrowLeft'" size="24" color="var(--primary-c)"
        style="cursor: pointer;" />
    </div>

    <div class="panel-content" :class="{ hidden: !isVisible }">
      <slot></slot>
    </div>

    <div class="resize-handle" @dblclick="resetPanelWidth" @mousedown="startResize" :class="{ hidden: !isVisible }">
    </div>
  </div>
</template>

<style scoped>
.collapsible-panel {
  display: flex;
  flex-direction: row;
  position: relative;
  height: 100%;
  background: var(--background-c);
}

.toggle-button {
  height: 100%;
  padding: 0 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: var(--border-ui);
  border-right: var(--border-ui);
}

.toggle-button:hover {
  background: var(--secondary-c);
  cursor: pointer;
}

.panel-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  flex-direction: column;
}

.panel-content.hidden {
  display: none;
}

.resize-handle.hidden {
  display: none;
}

.resize-handle {
  width: 5px;
  cursor: ew-resize;
  background: transparent;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}

.resize-handle:hover {
  border-left: var(--border-modal);
}
</style>
