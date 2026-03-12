<script setup>
/**
 * @file: NumberSpinner.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { useNumberSpinner } from '@/composables/common/useNumberSpinner'
import { useHoldButton } from '@/composables/common/useHoldButton'

/**
 * @typedef {Object} NumberSpinnerProps
 * @property {number} modelValue - Current input value (v-model)
 * @property {string} [tip] - Tooltip text
 * @property {string} [position] - Tooltip position
 * @property {boolean} [disabled] - Whether the input is disabled
 * @property {string} [icon] - Icon name
 * @property {string} [color] - Icon color
 * @property {string|number} [size] - Icon size
 * @property {number} [min] - Minimum value
 * @property {number} [max] - Maximum value
 * @property {number} [step] - Step value
 * @property {string} [background] - Input background color
 */

/** @type {NumberSpinnerProps}*/
const props = defineProps({
  modelValue: Number,
  tip: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: 'bottom'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'var(--text-c)'
  },
  size: {
    type: [String, Number],
    default: '16'
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: Infinity
  },
  step: {
    type: Number,
    default: 1
  },
  background: {
    type: String,
    default: 'var(--secondary-c)'
  },
})

/**
 * Logic of the hold button for continuous action on hold
 */
const {
  startHold,
  stopHold,
} = useHoldButton()

/**
 * @event update:modelValue - Emitted when the input value changes
 * @event update - Emitted when the input value changes (alias of update:modelValue)
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic for number spinner
 */
const {
  inputValue,
  inputRef,
  onInput,
  onCommit,
  increment,
  decrement,
  setValue,
  onWheel,
  isHovered,
} = useNumberSpinner(props, emit)

defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="number-spinner-wrapper" @mouseenter="isHovered = true" @mouseleave="isHovered = false" @wheel="onWheel">
      <BaseIcon v-if="props.icon" :name="props.icon" :size="props.size" :color="props.color" class="input-icon" />

      <input ref="inputRef" class="text-input" type="number" :disabled="props.disabled" :min="props.min"
        :max="props.max" :step="props.step" v-model="inputValue" @input="onInput" @blur="onCommit"
        @keydown.enter="onCommit" :style="{ background: props.background }" />

      <div class="spinner-controls">
        <div class="spinner-btn spinner-btn-up">
          <BaseIcon name="IconArrowUp" size="20" class="spinner-btn-icon-up" @mousedown="startHold(increment)"
            @mouseup="stopHold" @mouseleave="stopHold" @touchstart.prevent="startHold(increment)"
            @touchend="stopHold" @touchcancel="stopHold" />
        </div>
        <div class="spinner-btn spinner-btn-down">
          <BaseIcon name="IconArrowDown" size="20" class="spinner-btn-icon-down" @mousedown="startHold(decrement)"
            @mouseup="stopHold" @mouseleave="stopHold" @touchstart.prevent="startHold(decrement)"
            @touchend="stopHold" @touchcancel="stopHold" />
        </div>
      </div>
    </div>
  </ItemTip>
</template>

<style scoped>
.number-spinner-wrapper {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 27px;
}

.text-input {
  width: 100%;
  height: 100%;
  padding: 5px 28px 5px 10px;
  border-radius: var(--input-border-radius);
  border: none;
  color: var(--text-c);
  text-align: center;
  font-family: var(--font-family);
}

.text-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.input-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.spinner-controls {
  position: absolute;
  height: 100%;
  right: 4px;
  top: 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.spinner-btn {
  cursor: default;
  color: var(--primary-c);
  overflow: hidden;
}

.spinner-btn-up:hover {
  background: #adadad;
  border-radius: 0px 3px 0px 0;
}

.spinner-btn-down:hover {
  background: #adadad;
  border-radius: 0px 0px 3px 0px;
}

.spinner-btn-icon-up {
  transform: translateY(-4px);
}

.spinner-btn-icon-down {
  transform: translateY(-4px);
}

.spinner-btn:active {
  transform: scale(0.9);
}
</style>
