<script setup>
/**
 * @file: ExplainItem.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import ItemTip from './ItemTip.vue';
import BaseIcon from '../icons/BaseIcon.vue';
import { computed } from 'vue';

/**
 * @typedef {Object} ExplainItemProps
 * @property {string} text - The text to display in the item
 * @property {string} title - The title of the item
 * @property {string} shortcut - The keyboard shortcut for the item
 * @property {string} position - The position of the item (e.g., "left", "right")
 * @property {string} textPosition - The position of the item tip
 */

/** @type {ExplainItemProps} */
const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    default: 'left',
  },
  textPosition: {
    type: String,
    default: 'bottom',
  },
  title: {
    type: String,
    required: true
  },
  shortcut: {
    type: String,
    default: '',
  },
})

/**
 * Compute the style for the wrapper element based on the position prop.
 */
const wrapperStyle = computed(() => {
  if (props.position === 'left') {
    return { left: '0', top: '0' }
  } else {
    return { right: '0', top: '0' }
  }
})
</script>

<template>
  <div class="explain-item-wrapper" :style="wrapperStyle">
    <ItemTip :title="props.title" :shortcut="props.shortcut" advance :text="props.text" :position="props.textPosition"
      :delay="0">
      <BaseIcon class="icon-explain" name="IconExplain" :size="18" color="var(--text-c)" />
    </ItemTip>
  </div>

</template>

<style scoped>
.explain-item-wrapper {
  position: absolute;
  padding: 5px 7px;
}

.icon-explain {
  cursor: help;
}
</style>
