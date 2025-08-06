<script setup>
import { useContextMenu } from '@/composables/common/useContextMenu'
import { computed } from 'vue'

/**
 * @typedef {Object} ContextMenuItem
 * @property {string} label - Text to display
 * @property {Function} action - Function to call on click
 */

/**
 * @typedef {Object} Props
 * @property {ContextMenuItem[]} items - Array of context menu items
 */
const props = defineProps({
  /**
   * Array of context menu items
   * {label: string, action: function}
   * label: Text to display
   * action: Function to call on click
   * disabled: Whether the item is disabled
   */
  items: {
    type: Array,
    required: true,
  },
})

/**
 * Logic for the context menu
 */
const {
  wrapperRef,
  isVisible,
  contextMenuStyle,
  showMenu,
  closeMenu,
  handleMenuEnter,
  handleMenuLeave,
} = useContextMenu()

/**
 * Computed property to filter out hidden items
 */
const visibleItems = computed(() => props.items.filter(item => !item.hide))

/**
 * Whether to show the context menu
 */
const showContextMenu = computed(() => visibleItems.value.length > 0)
</script>

<template>
  <div ref="wrapperRef" @contextmenu="showMenu">
    <slot></slot>
  </div>

  <teleport to="body">
    <div v-if="isVisible && showContextMenu" class="context-menu-wrapper" :style="contextMenuStyle"
      @mouseenter="handleMenuEnter" @mouseleave="handleMenuLeave">
      <div v-for="(item, index) in visibleItems" :key="index" class="context-menu-wrapper-item"
        @click="() => { item.action(); closeMenu() }" :class="{ disabled: item.disabled }">
        {{ item.label }}
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.context-menu-wrapper {
  background: var(--secondary-c);
  color: var(--text-c);
  border-radius: 6px;
  box-shadow: var(--box-shadow-ui);
  min-width: 120px;
  user-select: none;
  font-size: var(--content-modal-font-size);
  font-weight: var(--content-modal-font-weight);
}

.context-menu-wrapper-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: var(--default-transition);
}

.context-menu-wrapper-item:hover {
  background: var(--background-c);
}
</style>
