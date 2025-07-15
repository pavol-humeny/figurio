<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useCollapsiblePanel } from '@/composables/common/useCollapsiblePanel'
import { useUiStore } from '@/stores/uiStore'

/**
 * @typedef {Object} CollapsiblePanelState
 * @property {boolean} isVisible - Whether the panel is currently visible
 * @property {Function} toggleVisibility - Toggles visibility of the panel
 * @property {number} rightSidePanelWidth - Total width of the visible panel (including collapse button)
 * @property {number} collapseButtonWidth - Width of the toggle button
 * @property {Function} startResize - Starts panel resize on mousedown
 */

/**
 * @type {CollapsiblePanelState}
 */
const { isVisible, toggleVisibility, rightSidePanelWidth, collapseButtonWidth, startResize } =
  useCollapsiblePanel(useUiStore())
</script>

<template>
  <div class="collapsible-panel" :style="{ width: rightSidePanelWidth + 'px' }">
    <div class="toggle-button" @click="toggleVisibility" :style="{ width: collapseButtonWidth + 'px' }">
      <BaseIcon :name="isVisible ? 'IconArrowRight' : 'IconArrowLeft'" size="24" color="var(--border-c)" />
    </div>

    <div class="panel-content" :class="{ hidden: !isVisible }">
      <slot></slot>
    </div>

    <div class="resize-handle" @mousedown="startResize" :class="{ hidden: !isVisible }"></div>
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
  cursor: pointer;
  border-left: var(--border-ui);
  border-right: var(--border-ui);
}

.panel-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
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
