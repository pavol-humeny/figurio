<script setup>
import DropdownSelect from './DropdownSelect.vue'
import { useI18n } from 'vue-i18n'
import ColorPicker from './ColorPicker.vue'
import NumberInput from './NumberInput.vue'
import { useImageStore } from '@/stores/imageStore'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import { usePresetNewOperation } from '@/composables/common/usePresetNewOperation'

const { t } = useI18n()

const props = defineProps({
  operation: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:operation'])

const {
  rotationOptions,
  flipOptions,
  operationOptions,
  selectedType,
  params,
  isDimensionsLinked,
  tmpCropWidth,
  tmpCropHeight,
  cropPositionXInputRef,
  cropPositionYInputRef,
  cropWidthInputRef,
  cropHeightInputRef,
  maxCropPositionX,
  maxCropPositionY,
  maxCropWidth,
  maxCropHeight,
  updatePosition,
  updateDimension,
} = usePresetNewOperation(useImageStore(), props, emit, t)
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

      <DropdownSelect v-if="selectedType === 'rotation'" v-model="params.angle" :options="rotationOptions" />

      <DropdownSelect v-if="selectedType === 'flip'" v-model="params.direction" :options="flipOptions" />

      <ColorPicker v-if="selectedType === 'smartCrop'" v-model="params.color" />

      <div class="crop-inputs" v-if="selectedType === 'crop'">
        <div class="content-inputs">
          <div class="content-input">
            <label for="x-input">
              {{ $t('tools.transform.settings.crop.cropPosition.x') }}
            </label>
            <NumberInput ref="cropPositionXInputRef" v-model="params.cropBox.x" :min="0" :max="maxCropPositionX"
              @update="(val) => updatePosition('x', val)" unit="px" />
          </div>
          <div class="content-between-inputs-icon-wrapper disabled"></div>
          <div class="content-input">
            <label for="y-input">
              {{ $t('tools.transform.settings.crop.cropPosition.y') }}
            </label>
            <NumberInput ref="cropPositionYInputRef" v-model="params.cropBox.y" :min="0" :max="maxCropPositionY"
              @update="(val) => updatePosition('y', val)" unit="px" />
          </div>
        </div>
        <div class="content-inputs" :style="{ marginTop: '10px' }">
          <div class="content-input">
            <label for="width-input">
              {{ $t('tools.transform.settings.crop.cropDimensions.width') }}
            </label>
            <NumberInput ref="cropWidthInputRef" v-model="tmpCropWidth" :min="0" :max="maxCropWidth"
              @update="(val) => updateDimension('width', val)" unit="px" />
          </div>

          <div class="content-between-inputs-icon-wrapper">
            <LinkValuesIcon v-model="isDimensionsLinked"
              :tipLinked="$t('tools.transform.settings.crop.cropDimensions.tipLinked')"
              :tipUnlinked="$t('tools.transform.settings.crop.cropDimensions.tipUnlinked')" size="30"
              position="bottom-left" />
          </div>

          <div class="content-input">
            <label for="height-input">
              {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
            </label>
            <NumberInput ref="cropHeightInputRef" v-model="tmpCropHeight" :min="0" :max="maxCropHeight"
              @update="(val) => updateDimension('height', val)" unit="px" />
          </div>
        </div>
      </div>

      <div class="resize-inputs" v-if="selectedType === 'resize'">
        <!-- TODO -->
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

.crop-inputs {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
