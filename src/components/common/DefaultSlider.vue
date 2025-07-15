<script setup>
import ItemTip from './ItemTip.vue'

/**
 * @typedef {Object} SliderProps
 * @property {number} modelValue - The current value of the slider (v-model)
 * @property {number} [min=0] - Minimum allowed slider value
 * @property {number} [max=100] - Maximum allowed slider value
 * @property {number} [step=1] - Increment step of the slider
 * @property {boolean} [disabled=false] - Whether the slider is disabled
 * @property {string} [tip=''] - Tooltip text shown on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [showValue=false] - Whether to display the current value
 * @property {string} [valueDescription=''] - Optional description label next to value
 * @property {string} [valueUnit=''] - Unit displayed after the value
 * @property {string} [backgroundColor='var(--secondary-c)'] - Background color of the slider track
 */

/** @type {SliderProps} */
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
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
  position: {
    type: String,
    default: 'bottom',
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  valueDescription: {
    type: String,
    default: '',
  },
  valueUnit: {
    type: String,
    default: '',
  },
  backgroundColor: {
    type: String,
    default: 'var(--secondary-c)',
  },
})

/**
 * @event update:modelValue - Emitted when the slider value changes (for v-model)
 * @event dblclick - Emitted when the slider is double-clicked (can be used to reset)
 */
const emit = defineEmits(['update:modelValue', 'dblclick'])

/**
 * Handles input change and emits updated value.
 * @param {Event} event - Input event from range element
 */
const onInput = (event) => {
  const value = Number(event.target.value)
  emit('update:modelValue', value)
}
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="slider-wrapper">
      <div v-if="props.showValue" class="slider-value-wrapper">
        <p v-if="props.valueDescription !== ''" class="slider-value-description">
          {{ props.valueDescription + ':' }}
        </p>
        <p class="slider-value">{{ modelValue }}</p>
        <p v-if="props.valueUnit !== ''" class="slider-value-unit">{{ props.valueUnit }}</p>
      </div>
      <input type="range" :min="props.min" :max="props.max" :step="props.step" :value="modelValue"
        :disabled="props.disabled" @input="onInput" @dblclick="$emit('dblclick')"
        :style="{ '--slider-bg': props.backgroundColor }" />
    </div>
  </ItemTip>
</template>

<style scoped>
.slider-wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
}

.slider-value-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
}

.slider-value-wrapper p {
  font-size: var(--text-font-size);
  color: var(--text-c);
}

.slider-value-description {
  margin-right: 3px;
}

/*********** Baseline, reset styles ***********/
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  padding: 0;
}

/******** Chrome, Safari, Opera and Edge Chromium styles ********/
/* slider track */
input[type='range']::-webkit-slider-runnable-track {
  background-color: var(--slider-bg);
  border-radius: 10px;
  height: 10px;
}

/* slider thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Override default look */
  appearance: none;
  margin-top: -5px;
  /* Centers thumb on the track */
  background-color: var(--primary-c);
  border-radius: 10px;
  height: 20px;
  width: 20px;
}

/*********** Firefox styles ***********/
/* slider track */
input[type='range']::-moz-range-track {
  background-color: var(--slider-bg);
  border-radius: 10px;
  height: 10px;
}

/* slider thumb */
input[type='range']::-moz-range-thumb {
  background-color: var(--primary-c);
  border: none;
  border-radius: 10px;
  height: 20px;
  width: 20px;
}
</style>
