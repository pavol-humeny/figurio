<script setup>
import { ref, watch, defineExpose } from 'vue'
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'

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

const emit = defineEmits(['update:modelValue', 'update'])

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal
  },
)

const onBlurOrEnter = () => {
  emit('update:modelValue', inputValue.value)
  emit('update', inputValue.value)
}

const onIconDoubleClick = () => {
  if (props.disabled) return
  if (typeof props.onReset === 'function') {
    props.onReset()
  }
}

defineExpose({
  setValue: (val) => {
    inputValue.value = val
  },
})

const showIcon = props.icon !== ''
const showUnit = props.unit !== ''
</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="input-wrapper">
      <input
        type="number"
        class="value-input"
        :style="{
          paddingLeft: showIcon ? '30px' : '10px',
          paddingRight: showUnit ? '25px' : '10px',
        }"
        v-model.number="inputValue"
        :min="props.min"
        :max="props.max"
        :step="props.step"
        :disabled="props.disabled"
        @blur="onBlurOrEnter"
        @keydown.enter="onBlurOrEnter"
      />
      <BaseIcon
        v-if="showIcon"
        :name="props.icon"
        class="input-icon"
        :size="props.size"
        :color="props.color"
        @dblclick="onIconDoubleClick"
        :class="{ 'not-allowed': props.disabled }"
        :style="{ top: props.iconTop + '%' }"
      />
      <span v-if="showUnit" class="input-unit">{{ props.unit }}</span>
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
  width: 12ch;
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
