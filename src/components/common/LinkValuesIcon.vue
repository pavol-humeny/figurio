<script setup>
/**
 * @file: LinkValuesIcon.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable icon component that represents a link/unlink state. It displays a link icon when linked and an unlink icon when unlinked. The component supports tooltips for both states, customizable size and color, and a disabled state. It emits an update:modelValue event when the link state is toggled.
 */
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useLinkValuesIcon } from '@/composables/common/useLinkValuesIcon'

/**
 * @typedef {Object} LinkToggleIconProps
 * @property {boolean} [modelValue=false] - Current link state (true = linked, false = unlinked)
 * @property {string} [tipLinked=''] - Tooltip text shown when linked
 * @property {string} [tipUnlinked=''] - Tooltip text shown when unlinked
 * @property {string} [position='bottom'] - Tooltip position
 * @property {number|string} [size=30] - Icon size
 * @property {string} [color='var(--primary-c)'] - Icon color
 * @property {boolean} [disabled=false] - Whether the icon is disabled
 */

/** @type {LinkToggleIconProps} */
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tipLinked: {
    type: String,
    default: '',
  },
  tipUnlinked: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  size: {
    type: [Number, String],
    default: 30,
  },
  color: {
    type: String,
    default: 'var(--primary-c)',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

/**
 * @event update:modelValue - Emitted when the link state changes
 */
const emit = defineEmits(['update:modelValue'])

/**
 * Logic of the link values icon
 */
const { isLinked, toggleLinkedValue } = useLinkValuesIcon(props, emit)
</script>

<template>
  <BaseIcon :name="isLinked ? 'IconLinkValues' : 'IconUnLinkValues'" :size="size" :color="color"
    @click="toggleLinkedValue" :tip="isLinked ? tipLinked : tipUnlinked" :class="disabled ? 'disabled' : ''"
    :position="position" />
</template>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
