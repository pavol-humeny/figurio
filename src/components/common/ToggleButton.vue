<script setup>
import ItemTip from './ItemTip.vue'
import { useToggleButton } from '@/composables/common/useToggleButton'

/**
 * @typedef {Object} ToggleSwitchProps
 * @property {boolean} [disabled=false] - Whether the toggle is disabled
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [modelValue=false] - Current toggle state (v-model)
 * @property {number} [scale=1] - Scale factor for the toggle
 */

/** @type {ToggleSwitchProps} */
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
  modelValue: {
    type: Boolean,
    default: false,
  },
  scale: {
    type: Number,
    default: 1,
  },
})

/**
 * @event update:modelValue - Emitted when toggle state changes (v-model)
 * @event update - Emitted when toggle state changes
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the toggle button
 */
const { isActive, toggleSwitch } = useToggleButton(props, emit)
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="toggle-switch" :style="{ transform: `scale(${props.scale})` }">
      <div class="toggle-switch-wrapper" :class="{ 'toggle-disabled': props.disabled, active: isActive }"
        @click="toggleSwitch">
        <div class="toggle-switch-slider" :class="{ active: isActive }"></div>
      </div>
    </div>
  </ItemTip>
</template>

<style scoped>
.toggle-switch {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-switch-wrapper {
  position: relative;
  display: flex;
  border: 2px solid var(--secondary-c);
  border-radius: 20px;
  padding: 5px;
  width: 80px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  transition: var(--default-transition);
}

.toggle-switch-wrapper.active {
  background: var(--secondary-c);
  transition: var(--default-transition);
}

.toggle-switch-wrapper.toggle-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.toggle-switch-slider {
  position: absolute;
  top: 3px;
  opacity: 0.8;
  left: 5px;
  width: calc(100% / 2 - 5px);
  height: 30px;
  background: var(--primary-c);
  border: 2px solid var(--primary-c);
  border-radius: 15px;
  transition: var(--default-transition);
}

.toggle-switch-slider.active {
  left: calc(100% / 2);
  opacity: 1;
  transition: var(--default-transition);
}
</style>
