<script setup>
import { ref, watch, defineExpose } from 'vue'
import ItemTip from './ItemTip.vue'

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

const emit = defineEmits(['update:modelValue'])

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    inputValue.value = newVal
  },
)

const onBlurOrEnter = () => {
  emit('update:modelValue', inputValue.value)
}

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
      type="text"
      class="text-input"
      v-model="inputValue"
      :disabled="props.disabled"
      @blur="onBlurOrEnter"
      @keydown.enter="onBlurOrEnter"
    />
  </ItemTip>

  <input
    v-else
    type="text"
    class="text-input"
    v-model="inputValue"
    :disabled="props.disabled"
    @blur="onBlurOrEnter"
    @keydown.enter="onBlurOrEnter"
  />
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
