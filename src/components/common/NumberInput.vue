<script setup>
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { useNumberInput } from '@/composables/common/useNumberInput'

/**
 * @typedef {Object} NumberInputProps
 * @property {number} modelValue - Bound numeric value (v-model)
 * @property {number} [min=0] - Minimum allowed value
 * @property {number} [max=Infinity] - Maximum allowed value
 * @property {number} [step=1] - Step for numeric input
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {string} [icon=''] - Optional icon on the left
 * @property {number} [iconTop=50] - Vertical offset (%) for icon
 * @property {string} [color='var(--text-c)'] - Icon color
 * @property {string|number} [size='16'] - Icon size
 * @property {Function|null} [onReset=null] - Optional reset handler on icon double-click
 * @property {string} [unit=''] - Optional unit shown on the right
 */

/** @type {NumberInputProps} */
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
  icon: {
    type: String,
    default: '',
  },
  iconTop: {
    type: Number,
    default: 50,
  },
  color: {
    type: String,
    default: 'var(--text-c)',
  },
  size: {
    type: [String, Number],
    default: '16',
  },
  onReset: {
    type: Function,
    default: null,
  },
  unit: {
    type: String,
    default: '',
  },
})

/**
 * @event update:modelValue - Emitted when the value is updated (v-model)
 * @event update - Emitted when the value is updated
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the number input
 */
const {
  inputValue,
  onBlurOrEnter,
  onIconDoubleClick,
  setValue,
  showIcon,
  showUnit,
} = useNumberInput(props, emit)

/**
 * Expose methods for external use
 * @type {{ setValue: (val: number) => void }}
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="input-wrapper">
      <input type="number" class="value-input" :style="{
        paddingLeft: showIcon ? '30px' : '10px',
        paddingRight: showUnit ? '30px' : '10px',
      }" v-model.number="inputValue" :min="props.min" :max="props.max" :step="props.step" :disabled="props.disabled"
        @blur="onBlurOrEnter" @input="onBlurOrEnter" @keydown.enter="onBlurOrEnter" />
      <BaseIcon v-if="showIcon" :name="props.icon" class="input-icon" :size="props.size" :color="props.color"
        @dblclick="onIconDoubleClick" :class="{ 'not-allowed': props.disabled, disabled: props.disabled }"
        :style="{ top: props.iconTop + '%' }" />
      <span v-if="showUnit" class="input-unit" :class="{ disabled: props.disabled }">{{
        props.unit
        }}</span>
    </div>
  </ItemTip>
</template>

<style scoped>
.input-wrapper {
  position: relative;
}

input[type='number'] {
  text-align: center;
}

.value-input {
  width: 13ch;
  padding: 7px 10px 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
}

.value-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.input-icon {
  position: absolute;
  left: 8px;
  transform: translateY(-50%);
  pointer-events: auto;
  cursor: pointer;
}

.input-icon.not-allowed {
  cursor: default;
}

.input-unit {
  position: absolute;
  right: 8px;
  top: 45%;
  transform: translateY(-50%);
  font-size: 13px;
  color: var(--text-c);
  pointer-events: none;
}
</style>
