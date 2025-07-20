<script setup>
import ItemTip from './ItemTip.vue'
import { useColorPicker } from '@/composables/common/useColorPicker'

/**
 * @typedef {Object} ColorPickerProps
 * @property {string} modelValue - The currently selected color (hex format)
 * @property {string} [tip=''] - Tooltip text displayed on hover
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the input is disabled
 */

/** @type {ColorPickerProps} */
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
})

/**
 * Emits events:
 * @event update:modelValue - Emitted when the color value changes (for v-model binding)
 * @event update - Custom update event with the same value
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Logic of the color picker
 */
const {
  colorValue,
  onChange,
  setValue,
} = useColorPicker(props, emit)

/**
 * Expose methods for external use
 * @type {{ setValue: (val: string) => void }}
 */
defineExpose({ setValue })
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="color-wrapper">
      <input type="color" class="color-input" v-model="colorValue" :disabled="props.disabled" @change="onChange" />
    </div>
  </ItemTip>
</template>

<style scoped>
.color-wrapper {
  width: 35px;
  height: 35px;
}

.color-input {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 50%;
  background-color: transparent;
  appearance: none;
  cursor: pointer;
  padding: 0;
  border: var(--border-modal);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 50%;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 50%;
}

.color-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
