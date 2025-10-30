<script setup>
import DropdownSelect from '@/components/common/DropdownSelect.vue'
import { useI18n } from 'vue-i18n'
import NumberInput from '@/components/common/NumberInput.vue'
import { useImageStore } from '@/stores/imageStore'
import LinkValuesIcon from '@/components/common/LinkValuesIcon.vue'
import { usePresetNewOperation } from '@/composables/tools/usePresetNewOperation'
import { editorConfig } from '@/config/editorConfig'

const { t } = useI18n()

/**
 * @typedef {Object} NewPresetOperationProps
 * @property {Object} operation - Operation object being configured
 */

/** @type {NewPresetOperationProps} */
const props = defineProps({
  operation: {
    type: Object,
    required: true,
  },
  localImageOperations: {
    type: Array,
    required: true,
  },
})

/**
 * @event update:operation - Emitted when the operation parameters change
 */
const emit = defineEmits(['update:operation'])

/**
 * Logic of the new preset operation form
 */
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
  presetGrayscaleOptions,
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
      <p v-else-if="selectedType === 'grayscale'">
        {{ t('tools.preset.settings.myPresets.presetValues.grayscale.grayscaleType') }}
      </p>

      <!-- Rotate -->
      <DropdownSelect v-if="selectedType === 'rotation'" v-model="params.angle" :options="rotationOptions" />

      <!-- Flip -->
      <DropdownSelect v-if="selectedType === 'flip'" v-model="params.direction" :options="flipOptions" />

      <!-- Grayscale -->
      <DropdownSelect v-if="selectedType === 'grayscale'" v-model="params.grayscaleType"
        :options="presetGrayscaleOptions" />

      <!-- Crop -->
      <div class="crop-inputs" v-if="selectedType === 'crop'">
        <div class="content-inputs">
          <div class="content-input">
            <label for="x-input">
              {{ $t('tools.crop.settings.general.cropPosition.x') }}
            </label>
            <NumberInput ref="cropPositionXInputRef" v-model="params.cropBox.x" :min="0" :max="maxCropPositionX"
              @update="(val) => updatePosition('x', val)" unit="px" />
          </div>
          <div class="content-between-inputs-icon-wrapper disabled"></div>
          <div class="content-input">
            <label for="y-input">
              {{ $t('tools.crop.settings.general.cropPosition.y') }}
            </label>
            <NumberInput ref="cropPositionYInputRef" v-model="params.cropBox.y" :min="0" :max="maxCropPositionY"
              @update="(val) => updatePosition('y', val)" unit="px" />
          </div>
        </div>
        <div class="content-inputs" :style="{ marginTop: '10px' }">
          <div class="content-input">
            <label for="width-input">
              {{ $t('tools.crop.settings.general.cropDimensions.width') }}
            </label>
            <NumberInput ref="cropWidthInputRef" v-model="tmpCropWidth" :min="0" :max="maxCropWidth"
              @update="(val) => updateDimension('width', val)" unit="px" />
          </div>

          <div class="content-between-inputs-icon-wrapper">
            <LinkValuesIcon v-model="isDimensionsLinked"
              :tipLinked="$t('tools.crop.settings.general.cropDimensions.tipLinked')"
              :tipUnlinked="$t('tools.crop.settings.general.cropDimensions.tipUnlinked')" size="30"
              position="bottom-left" />
          </div>

          <div class="content-input">
            <label for="height-input">
              {{ $t('tools.crop.settings.general.cropDimensions.height') }}
            </label>
            <NumberInput ref="cropHeightInputRef" v-model="tmpCropHeight" :min="0" :max="maxCropHeight"
              @update="(val) => updateDimension('height', val)" unit="px" />
          </div>
        </div>
      </div>

      <!-- Resize -->
      <div class="resize-inputs" v-if="selectedType === 'resize'">
        <div class="content-inputs">
          <div class="content-input">
            <label for="width-input">
              {{ $t('tools.transform.settings.resize.resizeDimensions.width') }}
            </label>
            <NumberInput v-model="params.resizeDimensions.width" :min="0" :max="editorConfig.maxFileDimensionWidth"
              unit="px" />
          </div>

          <div class="content-between-inputs-icon-wrapper disabled">
          </div>

          <div class="content-input">
            <label for="height-input">
              {{ $t('tools.transform.settings.resize.resizeDimensions.height') }}
            </label>
            <NumberInput v-model="params.resizeDimensions.height" :min="0" :max="editorConfig.maxFileDimensionHeight"
              unit="px" />
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

.crop-inputs,
.resize-inputs {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
