<script setup>
/**
 * @file: ToggleHoldButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable toggle hold button component that can be used throughout the application. The button has an active state that is triggered when the user holds down the button and deactivates when released. It supports tooltips, disabled state, and customizable scaling. The component emits startFunction when the hold starts and endFunction when the hold ends.
 */
import ItemTip from './ItemTip.vue'
import { useToggleHoldButton } from '@/composables/common/useToggleHoldButton'

/**
 * @typedef {Object} ToggleHoldButtonProps
 * @property {boolean} [defaultValue=false] - Initial active state of the button
 * @property {(start: boolean) => void} startFunction - Function to call when hold starts (receives true when activated)
 * @property {(start: boolean) => void} endFunction - Function to call when hold ends (receives false when deactivated)
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {number} [scale=1] - Scale factor for the button
 * @property {boolean} [disabled=false] - Whether the button is disabled
 */

/** @type {ToggleHoldButtonProps} */
const props = defineProps({
  defaultValue: {
    type: Boolean,
    default: false
  },
  startFunction: {
    type: Function,
    required: true
  },
  endFunction: {
    type: Function,
    required: true
  },
  tip: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'bottom'
  },
  scale: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

/**
 * Logic of the toggle hold button
 */
const {
  isActive,
  holdStart,
  holdEnd
} = useToggleHoldButton(props)
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="toggle-switch" :style="{ transform: `scale(${props.scale})` }">
      <div class="toggle-switch-wrapper" :class="{ 'toggle-disabled': props.disabled, active: isActive }"
        @mousedown="holdStart" @mouseup="holdEnd" @mouseleave="holdEnd" @touchstart.prevent="holdStart"
        @touchend="holdEnd" @touchcancel="holdEnd">
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
}
</style>
