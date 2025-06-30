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
  disabled: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
    default: '',
  },
  onReset: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'update'])

const value = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    value.value = val
  },
)

const increase = () => {
  if (!props.disabled && value.value + props.step <= props.max) {
    value.value += props.step
    emitChange()
  }
}

const decrease = () => {
  if (!props.disabled && value.value - props.step >= props.min) {
    value.value -= props.step
    emitChange()
  }
}

const emitChange = () => {
  emit('update:modelValue', value.value)
  emit('update', value.value)
}

const handleReset = () => {
  if (typeof props.onReset === 'function') {
    props.onReset()
  }
}

defineExpose({
  setValue: (val) => {
    value.value = val
    emitChange()
  },
})

const disableIncrease = () => {
  return props.disabled || value.value + props.step > props.max
}
const disableDecrease = () => {
  return props.disabled || value.value - props.step < props.min
}

const changeValue = (event) => {
  if (event.deltaY < 0) {
    increase()
  } else if (event.deltaY > 0) {
    decrease()
  }
}
</script>

<template>
  <ItemTip :text="tip" position="bottom">
    <div class="stepper">
      <BaseIcon
        name="IconMinus"
        :color="'var(--primary-c)'"
        :size="16"
        @click="decrease"
        :disabled="disableDecrease()"
        class="increase-decrease-icon"
      />
      <span class="value" @dblclick="handleReset" @wheel="changeValue">{{ value }}</span>
      <BaseIcon
        name="IconPlus"
        :color="'var(--primary-c)'"
        :size="16"
        @click="increase"
        :disabled="disableIncrease()"
        class="increase-decrease-icon"
      />
    </div>
  </ItemTip>
</template>

<style scoped>
.stepper {
  display: flex;
  align-items: center;
  background: var(--secondary-c);
  border-radius: 10px;
  padding: 4px 8px;
  user-select: none;
  gap: 10px;
  font-size: 14px;
}

.increase-decrease-icon {
  cursor: pointer;
}

.value {
  min-width: 30px;
  text-align: center;
  color: var(--text-c);
  cursor: pointer;
}
</style>
