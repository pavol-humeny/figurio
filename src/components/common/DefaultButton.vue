<script setup>
/**
 * @file: DefaultButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable button component that can be used throughout the application. It supports different styles (default, main, error), disabled state, and an optional tooltip. The button emits a click event when pressed.
 */
import ItemTip from './ItemTip.vue'

/**
 * @typedef {Object} TipButtonProps
 * @property {boolean} [disabled=false] - Whether the button is visually disabled (adds 'disabled' class)
 * @property {string} text - Text displayed inside the button
 * @property {string} [tip=''] - Tooltip text shown on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [onlyText=false] - If true, the button is styled as text-only (not button)
 * @property {boolean} [main=false] - If true, applies 'button-main' style for primary actions
 * @property {boolean} [error=false] - If true, applies 'button-error' style for destructive actions
 */

/** @type {TipButtonProps} */
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    required: true,
  },
  tip: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  onlyText: {
    type: Boolean,
    default: false,
  },
  main: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
})

/**
 * Emits a click event when the button is pressed
 * @event click
 */
const emit = defineEmits(['click'])

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <button class="button button-clickable" @click="emit('click')" :class="{
      'button-text': props.onlyText,
      'button-default': !props.onlyText,
      'disabled': props.disabled,
      'button-main': props.main,
      'button-error': props.error,
    }">
      {{ props.text }}
    </button>
  </ItemTip>
</template>

<style scoped></style>
