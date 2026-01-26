<script setup>
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
 * @property {(value: string) => void} [onEnter]
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
}

.text-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
