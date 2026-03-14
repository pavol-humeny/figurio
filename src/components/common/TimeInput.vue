DefaultSlider
<script setup>
/**
 * @file: TimeInput.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable time input component that allows users to input time in hours and minutes. The component supports tooltips, disabled state, and emits events when the value changes. It includes logic for handling input changes, blur events, pressing the Enter key, and mouse wheel adjustments for both hours and minutes.
 */
import ItemTip from './ItemTip.vue'
import { useTimeInput } from '@/composables/common/useTimeInput'

/**
 * @typedef {Object} TimeInputProps
 * @property {number} modelValue - Total time in minutes (v-model)
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the input is disabled
 */

/** @type {TimeInputProps} */
const props = defineProps({
  modelValue: {
    type: Number,
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
  disabled: {
    type: Boolean,
    default: false,
  },
})

/**
 * @event update:modelValue - Emitted when the value is updated (v-model)
 * @event update - Emitted when the value is updated
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the time input component
 */
const {
  hours,
  minutes,
  onHoursInput,
  onMinutesInput,
  updateTime,
  onWheel,
} = useTimeInput(props, emit)
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="input-wrapper time">
      <input type="text" class="value-input" :disabled="props.disabled" :value="hours" @input="onHoursInput"
        @wheel="onWheel('hours', $event)" @blur="updateTime" @keydown.enter.prevent="updateTime" />

      <span class="colon">:</span>

      <input type="text" class="value-input" :disabled="props.disabled" :value="minutes" @input="onMinutesInput"
        @wheel="onWheel('minutes', $event)" @blur="updateTime" @keydown.enter.prevent="updateTime" />
    </div>
  </ItemTip>
</template>

<style scoped>
.input-wrapper.time {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

input[type='text'] {
  text-align: center;
}

.value-input {
  width: 5ch;
  padding: var(--input-top-padding) 8px;
  border-radius: var(--input-border-radius);
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  font-size: var(--input-text-size);
}

.value-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.colon {
  font-size: 18px;
  color: var(--text-c);
}
</style>
