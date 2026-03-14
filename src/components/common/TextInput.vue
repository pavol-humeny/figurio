<script setup>
/**
 * @file: TextInput.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: A reusable text input component that supports tooltips, disabled state, and emits events when the value changes. The component includes logic for handling input changes, blur events, and pressing the Enter key. It also exposes a setValue method for programmatically updating the input value and a focus method to focus the input field.
 */
import ItemTip from './ItemTip.vue'
import { useTextInput } from '@/composables/common/useTextInput'

/**
 * @typedef {Object} TextInputProps
 * @property {string} modelValue - Current input value (v-model)
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {string} [placeholder=''] - Input placeholder text
 * @property {boolean} [updateOnChange=false] - If true, emits update on each input
 * @property {(value: string) => void} [onEnter] - Optional handler for Enter key press
 * @property {(value: string) => void} [onBlur] - Optional handler for input blur event
 */

/** @type {TextInputProps} */
const props = defineProps({
  modelValue: {
    type: String,
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
  placeholder: {
    type: String,
    default: '',
  },
  updateOnChange: {
    type: Boolean,
    default: false,
  },
  maxLength: {
    type: Number,
    default: null,
  },
  onEnter: {
    type: Function,
    default: null,
  },
  onBlur: {
    type: Function,
    default: null,
  },
})

/**
 * @event update:modelValue - Emitted when the input value changes
 * @event update - Emitted for compatibility with older versions
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the text input component
 */
const {
  inputValue,
  onBlur,
  onEnter,
  onInput,
  setValue,
  inputRef,
} = useTextInput(props, emit)

/**
 * Expose methods for external use
 * @type {{ setValue: (val: string) => void }}
 * @type {{ focus: () => void }}
 */
defineExpose({
  setValue,
  focus: () => inputRef.value?.focus(),
})
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <input type="text" class="text-input" v-model="inputValue" :disabled="props.disabled"
      :placeholder="props.placeholder" @blur="onBlur" @keydown.enter="onEnter" @input="onInput" ref="inputRef"
      :maxlength="props.maxLength" />
  </ItemTip>
</template>

<style scoped>
.text-input {
  /* width: 100%; */
  padding: var(--input-top-padding) 10px;
  border-radius: var(--input-border-radius);
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  font-size: var(--input-text-size);
  height: 27px;
}

.text-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
