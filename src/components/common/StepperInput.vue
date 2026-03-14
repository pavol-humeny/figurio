<script setup>
/**
 * @file: StepperInput.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable stepper input component that allows users to increment or decrement a numeric value using plus and minus buttons. The component supports minimum and maximum values, step increments, disabled state, and an optional tooltip. It emits update:modelValue and update events when the value changes, and it includes logic for continuous increment/decrement when the buttons are held down.
 */
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { useStepperInput } from '@/composables/common/useStepperInput'
import { useHoldButton } from '@/composables/common/useHoldButton'

/**
 * @typedef {Object} StepperInputProps
 * @property {number} modelValue - Current value (v-model)
 * @property {number} [min=-Infinity] - Minimum allowed value
 * @property {number} [max=Infinity] - Maximum allowed value
 * @property {number} [step=1] - Step amount for increasing/decreasing
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {string} [tip=''] - Tooltip text
 */

/** @type {StepperInputProps} */
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: -Infinity,
  },
  max: {
    type: Number,
    default: Infinity,
  },
  step: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
    default: '',
  },
})

/**
 * @event update:modelValue - Emitted when the value changes (v-model)
 * @event update - Emitted when the value changes
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the stepper input component
 */
const {
  inputValue,
  increase,
  decrease,
  setValue,
  disableIncrease,
  disableDecrease,
  changeValue,
  onInput,
  onBlur,
} = useStepperInput(props, emit)

/**
 * Logic of the hold button for continuous action on hold
 */
const {
  startHold,
  stopHold,
} = useHoldButton()

/**
 * Expose methods for external use
 * @type {{ setValue: (val: number) => void }}
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="tip" position="bottom">
    <div class="stepper-inline">
      <BaseIcon name="IconMinus" :size="16" @mousedown="startHold(decrease)" @mouseup="stopHold" @mouseleave="stopHold"
        @touchstart.prevent="startHold(decrease)" @touchend="stopHold" @touchcancel="stopHold"
        :disabled="disableDecrease()" class="increase-decrease-icon button-clickable" />

      <input class="value-input" type="number" :value="inputValue" :min="min" :max="max" :step="step"
        :disabled="disabled" @input="onInput" @blur="onBlur" @keydown.enter.prevent="onBlur" @wheel="changeValue" />

      <BaseIcon name="IconPlus" :size="16" @mousedown="startHold(increase)" @mouseup="stopHold" @mouseleave="stopHold"
        @touchstart.prevent="startHold(increase)" @touchend="stopHold" @touchcancel="stopHold"
        :disabled="disableIncrease()" class="increase-decrease-icon button-clickable" />
    </div>
  </ItemTip>
</template>

<style scoped>
.stepper-inline {
  display: flex;
  align-items: center;
  background: var(--secondary-c);
  border-radius: 10px;
  padding: var(--input-top-padding) var(--input-top-padding);
  user-select: none;
  font-size: var(--input-text-size);
}

.increase-decrease-icon {
  cursor: pointer;
  color: var(--primary-c);
}

.increase-decrease-icon:hover {
  color: var(--text-c);
}

.value-inline {
  min-width: 30px;
  text-align: center;
  color: var(--text-c);
  cursor: pointer;
}

.value-input {
  width: 40px;
  text-align: center;
  background: transparent;
  border: none;
  color: var(--text-c);
  font-size: var(--input-text-size);
  outline: none;
}

/* Hide native number arrows */
.value-input::-webkit-outer-spin-button,
.value-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.value-input[type='number'] {
  -moz-appearance: textfield;
}
</style>
