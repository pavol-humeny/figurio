<script setup>
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { useNumberDropdownInput } from '@/composables/common/useNumberDropdownInput'

/**
 * @typedef {Object} NumberDropdownInputProps
 * @property {number} modelValue - Current input value (v-model)
 * @property {Array<number>} options - Dropdown options
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {string} [icon=''] - Icon name to display in the input
 * @property {string} [color='var(--text-c)'] - Icon color
 * @property {string|number} [size='16'] - Icon size
 * @property {number} [min=0] - Minimum value for the input
 * @property {number} [max=Infinity] - Maximum value for the input
 * @property {number} [step=1] - Step value for the input
 */

/** @type {NumberDropdownInputProps} */
const props = defineProps({
  modelValue: Number,
  options: Array,
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
})

/**
 * @event update:modelValue - Emitted when the input value changes
 */
const emit = defineEmits(['update:modelValue'])

/**
 * Logic of the number dropdown input component
 */
const { inputValue,
  showDropdown,
  inputRef,
  onInput,
  onSelect,
  toggleDropdown,
  setValue
} = useNumberDropdownInput(props, emit)


/**
 * Expose methods for external use
 * @type {{ setValue: (val: string) => void }}
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="combo-wrapper">
      <BaseIcon v-if="props.icon" :name="props.icon" :size="props.size" :color="props.color" class="input-icon" />

      <input ref="inputRef" class="combo-input" type="number" :disabled="props.disabled" :min="props.min"
        :max="props.max" :step="props.step" v-model="inputValue" @input="onInput" />

      <BaseIcon name="IconDropDown" class="dropdown-icon" size="12" color="var(--primary-c)"
        :style="{ transform: showDropdown ? 'rotate(180deg) translateY(9px)' : 'rotate(0deg)' }"
        @click="toggleDropdown" />

      <ul v-if="showDropdown" class="dropdown-options">
        <li v-for="opt in props.options" :key="opt" @mousedown.prevent="onSelect(opt)">
          {{ opt }}
        </li>
      </ul>
    </div>
  </ItemTip>
</template>

<style scoped>
.combo-wrapper {
  position: relative;
  display: inline-block;
  width: 80px;
}

.combo-input {
  width: 100%;
  padding: 7px 25px 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  text-align: center;
}

.combo-input:disabled {
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

.dropdown-icon {
  position: absolute;
  right: 8px;
  top: 5px;
  transform: translateY(-50%);
  cursor: pointer;
  pointer-events: auto;
  height: 100%;
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--secondary-c);
  color: var(--text-c);
  list-style: none;
  margin: 4px 0 0 0;
  padding: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--box-shadow-ui);
  z-index: 10;
}

.dropdown-options li {
  padding: 6px 10px;
  cursor: pointer;
}

.dropdown-options li:hover {
  background: var(--primary-c);
  color: var(--background-c);
}
</style>
