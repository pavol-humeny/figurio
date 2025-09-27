<script setup>
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { useStepperInput } from '@/composables/common/useStepperInput'

/**
 * @typedef {Object} StepperInputProps
 * @property {number} modelValue - Current value (v-model)
 * @property {number} [min=-Infinity] - Minimum allowed value
 * @property {number} [max=Infinity] - Maximum allowed value
 * @property {number} [step=1] - Step amount for increasing/decreasing
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {string} [tip=''] - Tooltip text
 * @property {Function|null} [onReset=null] - Optional reset handler on double-click
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
  onReset: {
    type: Function,
    default: null,
  },
  type: {
    type: String,
    default: 'inline', // inline or block
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
  handleReset,
  setValue,
  disableIncrease,
  disableDecrease,
  changeValue,
  startHold,
  stopHold,
} = useStepperInput(props, emit)

/**
 * Expose methods for external use
 * @type {{ setValue: (val: number) => void }}
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="tip" position="bottom">
    <div v-if="type === 'inline'" class="stepper-inline">
      <BaseIcon name="IconMinus" :size="16" @mousedown="startHold(decrease)" @mouseup="stopHold" @mouseleave="stopHold"
        :disabled="disableDecrease()" class="increase-decrease-icon" />
      <span class="value-inline" @dblclick="handleReset" @wheel="changeValue">{{ inputValue }}</span>
      <BaseIcon name="IconPlus" :size="16" @mousedown="startHold(increase)" @mouseup="stopHold" @mouseleave="stopHold"
        :disabled="disableIncrease()" class="increase-decrease-icon" />
    </div>
    <div v-else-if="type === 'block'" class="stepper-block">
      <span class="value-block" @dblclick="handleReset" @wheel="changeValue">{{ inputValue }}</span>
      <div class="buttons-wrapper-block">
        <BaseIcon name="IconMinus" :size="16" @mousedown="startHold(decrease)" @mouseup="stopHold"
          @mouseleave="stopHold" :disabled="disableDecrease()" class="increase-decrease-icon" />
        <BaseIcon name="IconPlus" :size="16" @mousedown="startHold(increase)" @mouseup="stopHold" @mouseleave="stopHold"
          :disabled="disableIncrease()" class="increase-decrease-icon" />
      </div>
    </div>
  </ItemTip>
</template>

<style scoped>
.stepper-inline {
  display: flex;
  align-items: center;
  background: var(--secondary-c);
  border-radius: 10px;
  padding: 4px 8px;
  user-select: none;
  gap: 10px;
  font-size: 14px;
}

.increase-decrease-icon {
  cursor: pointer;
  color: var(--primary-c);
}

.increase-decrease-icon:hover {
  color: var(--text-c);
}

.value-inline,
.value-block {
  min-width: 30px;
  text-align: center;
  color: var(--text-c);
  cursor: pointer;
}

.stepper-block {
  display: flex;
  align-items: center;
  flex-direction: column;
  background: var(--secondary-c);
  border-radius: 10px;
  padding: 6px 8px;
  user-select: none;
  gap: 6px;
  font-size: 14px;
}

.buttons-wrapper-block {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  gap: 8px;
}
</style>
