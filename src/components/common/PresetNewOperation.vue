<script setup>
import { ref, reactive, watch } from 'vue'
import DropdownSelect from './DropdownSelect.vue'
import { useI18n } from 'vue-i18n'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  operation: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:operation'])

const { t } = useI18n()

const rotationOptions = [
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
  { label: '0°', value: 0 },
  { label: '-90°', value: -90 },
  { label: '-180°', value: -180 },
]

const flipOptions = [
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.horizontalFlip'),
    value: 'horizontal',
  },
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.verticalFlip'),
    value: 'vertical',
  },
]

const operationOptions = [
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.rotation'),
    value: 'rotation',
  },
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.flip'),
    value: 'flip',
  },
  {
    label: t('tools.preset.settings.myPresets.presetValues.smartCrop.label'),
    value: 'smartCrop',
  },
  {
    label: t('tools.preset.settings.myPresets.presetValues.grayscale.label'),
    value: 'grayscale',
  },
]

const selectedType = ref(props.operation?.type || '')

const params = reactive({
  angle: 0,
  direction: 'horizontal',
  color: '#000000',
})

watch(selectedType, (type) => {
  let op = null
  if (type === 'rotation') {
    op = { type, angle: 0 }
  } else if (type === 'flip') {
    op = { type, direction: 'horizontal' }
  } else if (type === 'smartCrop') {
    op = { type, color: '#000000' }
  } else if (type === 'grayscale') {
    op = { type, enable: true }
  } else {
    op = null
  }
  emit('update:operation', op)
})

watch(
  () => [params.angle, params.direction, params.color],
  () => {
    if (!selectedType.value) return
    const op = { type: selectedType.value }
    if (selectedType.value === 'rotation') op.angle = params.angle
    if (selectedType.value === 'flip') op.direction = params.direction
    if (selectedType.value === 'smartCrop') op.color = params.color
    emit('update:operation', op)
  },
)
</script>

<template>
  <div class="new-operation">
    <div class="content-aligned one-item">
      <DropdownSelect v-model="selectedType" :options="operationOptions" />
    </div>
    <div class="content-aligned two-items">
      <p v-if="selectedType === 'rotation'">
        {{ t('tools.preset.settings.myPresets.presetValues.transformations.rotation') }}
      </p>
      <p v-else-if="selectedType === 'flip'">
        {{ t('tools.preset.settings.myPresets.presetValues.transformations.flip') }}
      </p>
      <p v-else-if="selectedType === 'smartCrop'">
        {{ t('tools.preset.settings.myPresets.presetValues.smartCrop.label') }}
      </p>

      <DropdownSelect
        v-if="selectedType === 'rotation'"
        v-model="params.angle"
        :options="rotationOptions"
      />

      <DropdownSelect
        v-if="selectedType === 'flip'"
        v-model="params.direction"
        :options="flipOptions"
      />

      <ColorPicker v-if="selectedType === 'smartCrop'" v-model="params.color" />
    </div>
  </div>
</template>

<style scoped>
.new-operation {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
}
</style>
