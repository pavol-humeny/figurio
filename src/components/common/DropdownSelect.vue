<script setup>
import { ref, watch, defineExpose } from 'vue'
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'

/**
 * @typedef {Object} DropdownSelectProps
 * @property {string|number} modelValue - Currently selected value (v-model)
 * @property {{label: string, value: string|number}[]} options - Available options for the select input
 * @property {string} [tip=''] - Tooltip text to show on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the select input is disabled
 * @property {string} [icon=''] - Optional icon name to display on the left
 * @property {string} [color='var(--text-c)'] - Icon color
 * @property {string|number} [size='16'] - Icon size in px
 * @property {Function|null} [onReset=null] - Optional function to call on double-clicking the icon
 */

/** @type {DropdownSelectProps} */
const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
    // { label: 'Text', value: 'value' }
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
})

/**
 * @event update:modelValue - Emitted when the selected value changes (for v-model)
 * @event update - Emitted when the selected value changes
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Selected option value used internally for two-way binding
 * @type {import('vue').Ref<string|number>}
 */
const selectedValue = ref(props.modelValue)

// Sync with external changes to modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    selectedValue.value = newVal
  },
)

/**
 * Handle value change from select input
 */
const onChange = () => {
  emit('update:modelValue', selectedValue.value)
  emit('update', selectedValue.value)
}

/**
 * Handle double-click on icon
 */
const onIconDoubleClick = () => {
  if (typeof props.onReset === 'function') {
    props.onReset()
  }
}

/**
 * Expose function to programmatically set selected value
 * @param {string|number} value
 */
defineExpose({
  setValue: (value) => {
    selectedValue.value = value
  },
})

/**
 * Whether to display the icon
 * @type {boolean}
 */
const showIcon = props.icon !== ''
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="select-wrapper">
      <select class="select-input" v-model="selectedValue" :disabled="props.disabled"
        :style="{ paddingLeft: showIcon ? '30px' : '10px', paddingRight: '25px' }" @change="onChange">
        <option v-for="option in props.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <BaseIcon v-if="showIcon" :name="props.icon" class="input-icon-left" :size="props.size" :color="props.color"
        @dblclick="onIconDoubleClick" />

      <BaseIcon name="IconDropDown" class="input-icon-right" size="12" color="var(--primary-c)" />
    </div>
  </ItemTip>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  /* width: 100%; */
}

.select-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  appearance: none;
}

.select-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.input-icon-left {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
  cursor: pointer;
}

.input-icon-right {
  position: absolute;
  right: 8px;
  transform: translateY(0%);
  top: 10%;
  pointer-events: none;
}
</style>
