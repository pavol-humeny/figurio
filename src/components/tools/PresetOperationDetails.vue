<script setup>
/**
 * @file: PresetOperationDetails.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the details of a preset operation in the preset details view. Renders the operation type and its parameters in a readable format. The component uses the usePresetNewOperation composable to format the operation parameters for display.
 */
import DropdownSelect from '@/components/common/DropdownSelect.vue'
import { useI18n } from 'vue-i18n'
import NumberInput from '@/components/common/NumberInput.vue'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { usePresetOperationDetails } from '@/composables/tools/usePresetOperationDetails'
import { editorConfig } from '@/config/editorConfig'
import { computed } from 'vue'

const { t } = useI18n()

/**
 * @typedef {Object} PresetOperationDetailsProps
 * @property {Object} operation - The selected preset operation object
 */

/** @type {PresetOperationDetailsProps} */
const props = defineProps({
  operation: {
    type: Object,
    required: true,
  },
})


/**
 * @event update:operation - Emitted when the operation is modified
 */
const emit = defineEmits(['update:operation'])

/**
 * Logic of the preset operation details panel
 */
const {
  localOperation,
  update,
  tmpCropWidth,
  tmpCropHeight,
  cropPositionXInputRef,
  cropPositionYInputRef,
  cropWidthInputRef,
  cropHeightInputRef,
  updatePosition,
  updateDimension,
  maxCropPositionX,
  maxCropPositionY,
  maxCropWidth,
  maxCropHeight,
} = usePresetOperationDetails(useImageStore(), useEditorStore(), t, props, emit)

/**
 * Dropdown options for rotation angles
 * @type {{ label: string, value: number }[]}
 */
const presetRotationOptions = [
  { label: '180°', value: 180 },
  { label: '90°', value: 90 },
  { label: '0°', value: 0 },
  { label: '-90°', value: -90 },
  { label: '-180°', value: -180 },
]

/**
 * Dropdown options for flip directions
 * @type {{ label: string, value: string }[]}
 */
const presetFlipOptions = [
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.horizontalFlip'),
    value: 'horizontal',
  },
  {
    label: t('tools.preset.settings.myPresets.presetValues.transformations.verticalFlip'),
    value: 'vertical',
  },
]

const presetGrayscaleOptions = computed(() => [
  { value: 'luminance', label: t('tools.grayscale.settings.options.luminance') },
  { value: 'average', label: t('tools.grayscale.settings.options.average') },
  { value: 'lightness', label: t('tools.grayscale.settings.options.lightness') },
])
</script>

<template>
  <div class="operation-details" v-if="localOperation.type !== 'autoCrop'">
    <div class="content-title" :style="{ padding: '10px 0' }">
      <p>
        {{ t('tools.preset.settings.myPresets.modifyOperation') }}
      </p>
    </div>

    <!-- Rotation -->
    <template v-if="localOperation.type === 'rotation'">
      <div class="content-aligned two-items">
        <p>
          {{ t('tools.preset.settings.myPresets.presetValues.transformations.rotation') }}
        </p>
        <DropdownSelect v-model="localOperation.angle" :options="presetRotationOptions" @update="update" />
      </div>
    </template>

    <!-- Flip -->
    <template v-else-if="localOperation.type === 'flip'">
      <div class="content-aligned two-items">
        <p>
          {{ t('tools.preset.settings.myPresets.presetValues.transformations.flip') }}
        </p>
        <DropdownSelect v-model="localOperation.direction" :options="presetFlipOptions" @update="update" />
      </div>
    </template>

    <!-- Grayscale -->
    <template v-else-if="localOperation.type === 'grayscale'">
      <div class="content-aligned two-items">
        <p>
          {{ t('tools.preset.settings.myPresets.presetValues.grayscale.grayscaleType') }}
        </p>
        <DropdownSelect v-model="localOperation.grayscaleType" :options="presetGrayscaleOptions" @update="update" />
      </div>
    </template>

    <!-- Crop -->
    <template v-else-if="localOperation.type === 'crop'">
      <div class="content-inputs">
        <div class="content-input">
          <label for="x-input">
            {{ $t('tools.crop.settings.general.cropPosition.x') }}
          </label>
          <NumberInput ref="cropPositionXInputRef" v-model="localOperation.cropBox.x" :min="editorConfig.minCropSize"
            :max="maxCropPositionX" @update="(val) => updatePosition('x', val)" unit="px" />
        </div>
        <div class="content-between-inputs-icon-wrapper disabled"></div>
        <div class="content-input">
          <label for="y-input">
            {{ $t('tools.crop.settings.general.cropPosition.y') }}
          </label>
          <NumberInput ref="cropPositionYInputRef" v-model="localOperation.cropBox.y" :min="editorConfig.minCropSize"
            :max="maxCropPositionY" @update="(val) => updatePosition('y', val)" unit="px" />
        </div>
      </div>
      <div class="content-inputs" :style="{ marginTop: '10px' }">
        <div class="content-input">
          <label for="width-input">
            {{ $t('tools.crop.settings.general.cropDimensions.width') }}
          </label>
          <NumberInput ref="cropWidthInputRef" v-model="tmpCropWidth" :min="editorConfig.minCropSize"
            :max="maxCropWidth" @update="(val) => updateDimension('width', val)" unit="px" />
        </div>

        <div class="content-between-inputs-icon-wrapper disabled"></div>

        <div class="content-input">
          <label for="height-input">
            {{ $t('tools.crop.settings.general.cropDimensions.height') }}
          </label>
          <NumberInput ref="cropHeightInputRef" v-model="tmpCropHeight" :min="editorConfig.minCropSize"
            :max="maxCropHeight" @update="(val) => updateDimension('height', val)" unit="px" />
        </div>
      </div>
    </template>

    <!-- Resize -->
    <template v-else-if="localOperation.type === 'resize'">
      <div class="content-inputs">
        <div class="content-input">
          <label for="width-input">
            {{ $t('tools.transform.settings.resize.resizeDimensions.width') }}
          </label>
          <NumberInput ref="FileDimensionWidthInputRef" v-model="localOperation.resizeDimensions.width" :min="0"
            :max="editorConfig.maxFileDimensionWidth" unit="px" />
        </div>

        <div class="content-between-inputs-icon-wrapper disabled">
        </div>

        <div class="content-input">
          <label for="height-input">
            {{ $t('tools.transform.settings.resize.resizeDimensions.height') }}
          </label>
          <NumberInput ref="FileDimensionHeightInputRef" v-model="localOperation.resizeDimensions.height" :min="1"
            :max="editorConfig.maxFileDimensionHeight" unit="px" />
        </div>
      </div>
    </template>

    <!-- UPDATE new tool - add new template -->
  </div>
</template>

<style scoped>
.operation-details {
  width: 80%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.content-aligned {
  width: 100%;
}
</style>
