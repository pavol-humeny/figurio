<script setup>
import { computed } from 'vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useConsole } from '@/composables/common/useConsole.js'
const { warn } = useConsole()

/**
 * @typedef {Object} BaseIconProps
 * @property {string} name - Name of the icon component 
 * @property {number|string} [size=20] - Icon size in pixels
 * @property {string} [color='currentColor'] - Icon color
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the icon is disabled
 */

/** @type {BaseIconProps} */
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
  tip: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    default: 'bottom',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

/**
 * Emits a click event when the icon is pressed
 * @event click
 */
const emit = defineEmits(['click'])

/**
 * All available icons loaded via Vite's glob import
 */
const icons = import.meta.glob('@/components/icons/Icon*.vue', { eager: true, import: 'default' })

/**
 * Selected icon component based on the provided name
 */
const iconComponent = computed(() => {
  const path = `/src/components/icons/${props.name}.vue`
  const component = icons[path]

  if (!component) {
    warn(`Icon ${props.name} does not exist: ${path}`)
    return null
  }

  return component
})
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position" @click="emit('click')">
    <component :is="iconComponent" class="icon" :style="{ width: size + 'px', height: size + 'px', color: color }"
      :class="{ 'disabled': props.disabled }" />
  </ItemTip>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
