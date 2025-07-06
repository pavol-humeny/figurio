<script setup>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import DropdownSelect from './DropdownSelect.vue'
import { useI18n } from 'vue-i18n'
import ColorPicker from './ColorPicker.vue'
import NumberInput from './NumberInput.vue'
import { useImageStore } from '@/stores/imageStore'
import { useMath } from '@/composables/common/useMath'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'

const imageStore = useImageStore()
const { clamp } = useMath()

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
  {
    label: t('tools.preset.settings.myPresets.presetValues.crop.label'),
    value: 'crop',
  },
  // UPDATE
]

const selectedType = ref(props.operation?.type || '')

const params = reactive({
  angle: 0,
  direction: 'horizontal',
  color: '#000000',
  cropBox: { x: 0, y: 0, width: 0, height: 0 },
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
  } else if (type === 'crop') {
    op = { type, cropBox: { x: 0, y: 0, width: 0, height: 0 } }
  } else {
    op = null
  }
  emit('update:operation', op)
})

watch(
  () => [params.angle, params.direction, params.color, params.cropBox],
  () => {
    if (!selectedType.value) return
    const op = { type: selectedType.value }
    if (selectedType.value === 'rotation') op.angle = params.angle
    if (selectedType.value === 'flip') op.direction = params.direction
    if (selectedType.value === 'smartCrop') op.color = params.color
    if (selectedType.value === 'grayscale') op.enable = true
    if (selectedType.value === 'crop') {
      op.cropBox = { ...params.cropBox }
    }
    // UPDATE

    emit('update:operation', op)
  },
  { deep: true, immediate: true },
)

const isDimensionsLinked = ref(true)
const tmpCropWidth = ref(0)
const tmpCropHeight = ref(0)

const cropPositionXInputRef = ref(null)
const cropPositionYInputRef = ref(null)
const cropWidthInputRef = ref(null)
const cropHeightInputRef = ref(null)

const maxCropPositionX = computed(() => {
  return imageStore.fileDimensions.width - params.cropBox.width
})
const maxCropPositionY = computed(() => {
  return imageStore.fileDimensions.height - params.cropBox.height
})
const maxCropWidth = computed(() => {
  return imageStore.fileDimensions.width - params.cropBox.x
})
const maxCropHeight = computed(() => {
  return imageStore.fileDimensions.height - params.cropBox.y
})
const updatePosition = (key, value) => {
  if (key === 'x') {
    params.cropBox.x = Math.round(clamp(value, 0, maxCropPositionX.value))
  } else if (key === 'y') {
    params.cropBox.y = Math.round(clamp(value, 0, maxCropPositionY.value))
  }
  nextTick(() => {
    cropPositionXInputRef.value?.setValue(params.cropBox.x)
    cropPositionYInputRef.value?.setValue(params.cropBox.y)
  })
}

const updateDimension = (key, value) => {
  const originalWidth = params.cropBox.width
  const originalHeight = params.cropBox.height

  if (key === 'width') {
    const clampedWidth = Math.round(clamp(value, 0, maxCropWidth.value))
    if (isDimensionsLinked.value) {
      const aspectRatio = originalHeight / originalWidth || 1
      params.cropBox.width = clampedWidth
      params.cropBox.height = Math.round(clamp(clampedWidth * aspectRatio, 0, maxCropHeight.value))
    } else {
      params.cropBox.width = clampedWidth
    }
  } else if (key === 'height') {
    const clampedHeight = Math.round(clamp(value, 0, maxCropHeight.value))
    if (isDimensionsLinked.value) {
      const aspectRatio = originalWidth / originalHeight || 1
      params.cropBox.height = clampedHeight
      params.cropBox.width = Math.round(clamp(clampedHeight * aspectRatio, 0, maxCropWidth.value))
    } else {
      params.cropBox.height = clampedHeight
    }
  }
  nextTick(() => {
    cropHeightInputRef.value?.setValue(params.cropBox.height)
    cropWidthInputRef.value?.setValue(params.cropBox.width)
  })
}
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

      <div class="crop-inputs" v-if="selectedType === 'crop'">
        <div class="content-inputs">
          <div class="content-input">
            <label for="x-input">
              {{ $t('tools.transform.settings.crop.cropPosition.x') }}
            </label>
            <NumberInput
              ref="cropPositionXInputRef"
              v-model="params.cropBox.x"
              :min="0"
              :max="maxCropPositionX"
              @update="(val) => updatePosition('x', val)"
              unit="px"
            />
          </div>
          <div class="content-between-inputs-icon-wrapper disabled"></div>
          <div class="content-input">
            <label for="y-input">
              {{ $t('tools.transform.settings.crop.cropPosition.y') }}
            </label>
            <NumberInput
              ref="cropPositionYInputRef"
              v-model="params.cropBox.y"
              :min="0"
              :max="maxCropPositionY"
              @update="(val) => updatePosition('y', val)"
              unit="px"
            />
          </div>
        </div>
        <div class="content-inputs" :style="{ marginTop: '10px' }">
          <div class="content-input">
            <label for="width-input">
              {{ $t('tools.transform.settings.crop.cropDimensions.width') }}
            </label>
            <NumberInput
              ref="cropWidthInputRef"
              v-model="tmpCropWidth"
              :min="0"
              :max="maxCropWidth"
              @update="(val) => updateDimension('width', val)"
              unit="px"
            />
          </div>

          <div class="content-between-inputs-icon-wrapper">
            <LinkValuesIcon
              v-model="isDimensionsLinked"
              :tipLinked="$t('tools.transform.settings.crop.cropDimensions.tipLinked')"
              :tipUnlinked="$t('tools.transform.settings.crop.cropDimensions.tipUnlinked')"
              size="30"
              position="bottom-left"
            />
          </div>

          <div class="content-input">
            <label for="height-input">
              {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
            </label>
            <NumberInput
              ref="cropHeightInputRef"
              v-model="tmpCropHeight"
              :min="0"
              :max="maxCropHeight"
              @update="(val) => updateDimension('height', val)"
              unit="px"
            />
          </div>
        </div>
      </div>
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

.crop-inputs{
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
