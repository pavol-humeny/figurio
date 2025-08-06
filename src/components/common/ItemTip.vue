<script setup>
import { useItemTip } from '@/composables/common/useItemTip'
import { computed } from 'vue'

/**
 * @typedef {Object} ItemTipProps
 * @property {string} text - Tooltip text (required)
 * @property {string} [position='top'] - Tooltip position (e.g. 'top', 'bottom-right')
 * @property {boolean} [advance=false] - Whether to use advanced layout with title and shortcut
 * @property {string} [title=''] - Optional title for advanced tooltip
 * @property {string} [shortcut=''] - Optional keyboard shortcut to show in advanced tooltip
 */

/** @type {ItemTipProps} */
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'top',
  },
  advance: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  shortcut: {
    type: String,
    default: '',
  },
})

/**
 * Logic of the item tooltip
 */
const { isVisible, wrapper, itemTipStyle, handleMouseEnter, handleMouseLeave } = useItemTip({
  position: props.position,
  text: props.text,
})

/**
 * Whether to show the tooltip (text must be non-empty)
 */
const showTip = computed(() => props.text !== '')
</script>

<template>
  <div class="item-tip" ref="wrapper" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <slot></slot>

    <teleport to="body">
      <div v-if="isVisible && showTip" :style="itemTipStyle" :class="['item-tip-bubble', props.position]">
        <template v-if="props.advance">
          <div class="item-tip-title-row">
            <span class="tip-title">{{ props.title }}</span>
            <span v-if="props.shortcut" class="tip-shortcut">{{ props.shortcut }}</span>
          </div>
          <div class="tip-description">{{ props.text }}</div>
        </template>

        <template v-else>
          {{ props.text }}
        </template>
        <div class="item-tip-arrow" :class="props.position"></div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.item-tip {
  width: fit-content;
}

.item-tip-bubble {
  background: var(--secondary-c);
  color: var(--secondary-c);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: var(--tip-font-size);
  white-space: nowrap;
  box-shadow: var(--box-shadow-ui);
}

.item-tip-bubble {
  position: absolute;
  transform: translate(-50%, -50%);
}

.item-tip-bubble.top {
  transform: translate(-50%, -100%);
}

.item-tip-bubble.top-right {
  transform: translate(0, -100%);
}

.item-tip-bubble.top-left {
  transform: translate(-100%, -100%);
}

.item-tip-bubble.bottom {
  transform: translate(-50%, 0);
}

.item-tip-bubble.left {
  transform: translate(-100%, -50%);
}

.item-tip-bubble.right {
  transform: translate(0, -50%);
}

.item-tip-bubble.bottom-right {
  transform: translate(0, 0);
}

.item-tip-bubble.bottom-left {
  transform: translate(-100%, 0);
}

.item-tip-arrow {
  position: absolute;
  width: 0;
  height: 0;
}

.item-tip-arrow.top {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.top-right {
  bottom: -6px;
  left: 20px;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.top-left {
  bottom: -6px;
  right: 20px;
  transform: translateX(50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

.item-tip-arrow.left {
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid var(--secondary-c);
}

.item-tip-arrow.right {
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom-right {
  left: 20px;
  top: -6px;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

.item-tip-arrow.bottom-left {
  right: 20px;
  top: -6px;
  transform: translateX(50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid var(--secondary-c);
}

/* Advance tip */
.item-tip-title-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;

  font-size: calc(var(--tip-font-size) + 2px);
  margin-bottom: 4px;
  white-space: nowrap;
}

.tip-title {
  font-weight: var(--tip-title-font-weight);
  color: var(--text-c);
}

.tip-shortcut {
  background-color: var(--border-c);
  color: var(--text-c);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
  font-family: monospace;
}

.tip-description {
  color: var(--text-c);
  font-size: var(--tip-font-size);
  white-space: nowrap;
}
</style>
