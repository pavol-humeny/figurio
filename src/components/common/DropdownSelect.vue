<script setup>
import { ref, watch, defineExpose } from 'vue'
import ItemTip from './ItemTip.vue'
import BaseIcon from '../icons/BaseIcon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
    // { label: 'Text', value: 'value' }
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

const emit = defineEmits(['update:modelValue', 'update'])

const selectedValue = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  selectedValue.value = newVal
})

const onChange = () => {
  emit('update:modelValue', selectedValue.value)
  emit('update', selectedValue.value)
}

const onIconDoubleClick = () => {
  if (typeof props.onReset === 'function') {
    props.onReset()
  }
}

defineExpose({
  setValue: (val) => {
    selectedValue.value = val
  },
})

const showTip = props.tip !== ''
const showIcon = props.icon !== ''
</script>

<template>
  <ItemTip v-if="showTip" :text="props.tip" :position="props.position">
    <div class="select-wrapper">
      <select
        class="select-input"
        v-model="selectedValue"
        :disabled="props.disabled"
        :style="{ paddingLeft: showIcon ? '30px' : '10px', paddingRight: '25px' }"
        @change="onChange"
      >
        <option v-for="option in props.options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <BaseIcon
        v-if="showIcon"
        :name="props.icon"
        class="input-icon-left"
        :size="props.size"
        :color="props.color"
        @dblclick="onIconDoubleClick"
      />

      <BaseIcon
        name="IconArrowDown"
        class="input-icon-right"
        size="20"
        color="var(--text-c)"
      />
    </div>
  </ItemTip>

  <div v-else class="select-wrapper">
    <select
      class="select-input"
      v-model="selectedValue"
      :disabled="props.disabled"
      :style="{ paddingLeft: showIcon ? '30px' : '10px', paddingRight: '25px' }"
      @change="onChange"
    >
      <option v-for="option in props.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <BaseIcon
      v-if="showIcon"
      :name="props.icon"
      class="input-icon-left"
      :size="props.size"
      :color="props.color"
      @dblclick="onIconDoubleClick"
    />

    <BaseIcon
      name="IconArrowDown"
      class="input-icon-right"
      size="16"
      color="var(--primary-c)"
    />
  </div>
</template>

<style scoped>
.select-wrapper {
  position: relative;
  /* width: 100%; */
}

.select-input {
  width: 100%;
  padding: 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
  appearance: none;
}

.select-input:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.input-icon-left {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
  cursor: pointer;
}

.input-icon-right {
  position: absolute;
  right: 8px;
  /* transform: translateY(-50%); */
  transform: rotate(180deg);
  top: 25%;
  pointer-events: none;
}
</style>
