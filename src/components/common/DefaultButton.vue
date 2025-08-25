<script setup>
import ItemTip from './ItemTip.vue'

/**
 * @typedef {Object} TipButtonProps
 * @property {boolean} [disabled=false] - Whether the button is visually disabled (adds 'disabled' class)
 * @property {string} text - Text displayed inside the button
 * @property {string} [tip=''] - Tooltip text shown on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [onlyText=false] - If true, the button is styled as text-only (not button)
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
  }
})

/**
 * Emits a click event when the button is pressed
 * @event click
 */
const emit = defineEmits(['click'])

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <button class="button" @click="emit('click')" :class="{
      'button-text': props.onlyText,
      'button-default': !props.onlyText,
      'disabled': props.disabled,
      'button-main': props.main,
    }">
      {{ props.text }}
    </button>
  </ItemTip>
</template>

<style scoped></style>
