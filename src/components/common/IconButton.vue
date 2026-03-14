<script setup>
/**
 * @file: IconButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable icon button component that can be used throughout the application. It supports an icon, tooltip, disabled state, active state, and scaling. The button emits a click event when pressed.
 */
import ItemTip from './ItemTip.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue';

/**
 * @typedef {Object} IconButtonProps
 * @property {boolean} [disabled=false] - Whether the button is visually disabled (adds 'disabled' class)
 * @property {string} icon - Name of the icon to display (required)
 * @property {number|string} [size=20] - Size of the icon in pixels
 * @property {string} [color='var(--primary-c)'] - Color of the icon
 * @property {string} [tip=''] - Tooltip text shown on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [active=false] - Whether the button is in an active state (adds 'active' class)
 * @property {number} [scale=1] - Scale factor for the button (default is 1, which means no scaling)
 */

/** @type {IconButtonProps} */
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  icon: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  color: {
    type: String,
    default: 'var(--primary-c)',
  },
  active: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Number,
    default: 1,
  },
})

/**
 * Emits a click event when the button is pressed
 * @event click
 */
const emit = defineEmits(['click'])

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position" :style="{ transform: `scale(${props.scale})` }">
    <button class="button button-icon button-clickable" @click="emit('click')" :class="{
      'disabled': props.disabled,
      'active': props.active,
    }">
      <BaseIcon :name="props.icon" :size="props.size" :color="props.color" />
    </button>
  </ItemTip>
</template>

<style scoped>
.button-icon {
  width: 35px;
  height: 35px;
  border-radius: 8px;
}

.button-icon:hover {
  transition: none;
  box-shadow: none;
}
</style>
