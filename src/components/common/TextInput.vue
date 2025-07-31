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
  onBlurOrEnter,
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
      :placeholder="props.placeholder" @blur="onBlurOrEnter" @keydown.enter="onBlurOrEnter" @input="onInput"
      ref="inputRef" />
  </ItemTip>
</template>

<style scoped>
.text-input {
  /* width: 100%; */
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
}

.text-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
