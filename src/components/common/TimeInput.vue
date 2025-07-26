<script setup>
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import { ref, watch } from 'vue'

/**
 * @typedef {Object} TimeInputProps
 * @property {number} modelValue - Total time in minutes (v-model)
 * @property {string} [tip=''] - Tooltip text
 * @property {string} [position='bottom'] - Tooltip position
 * @property {boolean} [disabled=false] - Whether the input is disabled
 * @property {string} [icon=''] - Optional icon on the left
 * @property {number} [iconTop=50] - Vertical offset (%) for icon
 * @property {string} [color='var(--text-c)'] - Icon color
 * @property {string|number} [size='16'] - Icon size
 * @property {Function|null} [onReset=null] - Optional reset handler on icon double-click
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
})

/**
 * @event update:modelValue - Emitted when the value is updated (v-model)
 * @event update - Emitted when the value is updated
 */
const emit = defineEmits(['update:modelValue', 'update'])

/**
 * Local hour and minute inputs
 */
const hours = ref(Math.floor(props.modelValue / 60))
const minutes = ref(props.modelValue % 60)

watch(
  () => props.modelValue,
  (val) => {
    hours.value = Math.floor(val / 60)
    minutes.value = val % 60
  },
)

/**
 * Displayed as 2-digit string, but stored as number
 */
const onHoursInput = (e) => {
  const val = e.target.value
  const parsed = parseInt(val, 10)

  if (isNaN(parsed) || parsed < 0 || parsed > 23) {
    hours.value = 10 // Default to 10 hours if invalid
  } else {
    hours.value = parsed
  }

  // Always update visible value to match internal state
  e.target.value = hours.value.toString().padStart(2, '0')
}

const onMinutesInput = (e) => {
  const val = e.target.value
  const parsed = parseInt(val, 10)

  if (isNaN(parsed) || parsed < 0 || parsed > 59) {
    minutes.value = props.modelValue % 60
  } else {
    minutes.value = parsed
  }

  // Always update visible value to match internal state
  e.target.value = minutes.value.toString().padStart(2, '0')
}

/**
 * Emit updated total minutes
 */
const updateTime = () => {
  const clampedHours = Math.max(0, hours.value)
  const clampedMinutes = Math.min(59, Math.max(0, minutes.value))
  const total = clampedHours * 60 + clampedMinutes
  emit('update:modelValue', total)
  emit('update', total)
}

const onIconDoubleClick = () => {
  if (props.onReset) props.onReset()
}

/**
 * Expose manual update method
 */
defineExpose({ updateTime })
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="input-wrapper time">
      <input
        type="text"
        class="value-input"
        :disabled="props.disabled"
        :value="hours.toString().padStart(2, '0')"
        @input="onHoursInput"
        @blur="updateTime"
        @keydown.enter="updateTime"
      />

      <span class="colon">:</span>

      <input
        type="text"
        class="value-input"
        :disabled="props.disabled"
        :value="minutes.toString().padStart(2, '0')"
        @input="onMinutesInput"
        @blur="updateTime"
        @keydown.enter="updateTime"
      />
      <BaseIcon
        v-if="props.icon"
        :name="props.icon"
        class="input-icon"
        :size="props.size"
        :color="props.color"
        @dblclick="onIconDoubleClick"
        :class="{ 'not-allowed': props.disabled, disabled: props.disabled }"
        :style="{ top: props.iconTop + '%' }"
      />
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
  padding: 7px 8px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
}

.value-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.colon {
  font-size: 18px;
  color: var(--text-c);
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
</style>
