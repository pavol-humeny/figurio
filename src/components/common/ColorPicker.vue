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

const emit = defineEmits(['update:modelValue', 'update'])

const colorValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  colorValue.value = newVal
})

const onChange = () => {
  emit('update:modelValue', colorValue.value)
  emit('update', colorValue.value)
}

defineExpose({
  setValue: (val) => {
    colorValue.value = val
  },
})

</script>

<template>
  <ItemTip :text="props.tip" :position="props.position">
    <div class="color-wrapper">
      <input
        type="color"
        class="color-input"
        v-model="colorValue"
        :disabled="props.disabled"
        @change="onChange"
      />
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
