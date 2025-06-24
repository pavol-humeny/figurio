<script setup>
import { ref, watch, defineExpose } from 'vue'
import ItemTip from './ItemTip.vue'

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

// expose <input> element and methods for parent ref usage
defineExpose({
  setValue: (val) => {
    inputValue.value = val
  },
})

const showTip = props.tip !== ''
</script>

<template>
  <ItemTip v-if="showTip" :text="props.tip" :position="props.position">
    <input
      type="number"
      class="value-input"
      v-model.number="inputValue"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      :disabled="props.disabled"
      @blur="onBlurOrEnter"
      @keydown.enter="onBlurOrEnter"
    />
  </ItemTip>

  <input
    v-else
    type="number"
    class="value-input"
    v-model.number="inputValue"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :disabled="props.disabled"
    @blur="onBlurOrEnter"
    @keydown.enter="onBlurOrEnter"
  />
</template>

<style scoped>
input[type='number'] {
  text-align: center;
}

.value-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
}

.value-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
