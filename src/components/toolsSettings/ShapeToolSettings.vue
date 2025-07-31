<script setup>
import { useShapeTool } from '@/composables/tools/useShapeTool';
import { useEditorStore } from '@/stores/editorStore';
import { useImageStore } from '@/stores/imageStore';
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import ColorPicker from '../common/ColorPicker.vue';
import NumberInput from '../common/NumberInput.vue';
import NumberDropdownInput from '../common/NumberDropdownInput.vue';
import LinkValuesIcon from '../common/LinkValuesIcon.vue';
import ToggleButton from '../common/ToggleButton.vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * Available tabs for blur tool settings
 */
const tabs = ['rectangle', 'ellipse', 'line'];

const {
  localObjectSettings,
  maxShapePositionX,
  maxShapePositionY,
  applyLocalSettings,
  maxShapeWidth,
  maxShapeHeight,
  widthInputRef,
  heightInputRef,
  updateDimension,
  isDimensionsLinked,
  tmpShapeHeight,
  tmpShapeWidth,
  hidePositionAndDimensions
} = useShapeTool(useEditorStore(), useImageStore(), useHistoryStore(), t)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">

      <div class="specific-settings">
        <!-- Position -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>Rectangle position</p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  X
                </label>
                <NumberInput ref="positionXInputRef" v-model="localObjectSettings.x" :min="0" :max="maxShapePositionX"
                  @update="applyLocalSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  Y
                </label>
                <NumberInput ref="positionYInputRef" v-model="localObjectSettings.y" :min="0" :max="maxShapePositionY"
                  @update="applyLocalSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dimensions -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                Rectangle dimensions
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  Width
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpShapeWidth" :min="1" :max="maxShapeWidth"
                  @update="(val) => updateDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isDimensionsLinked" :tipLinked="'tipLinked'" :tipUnlinked="'tipUnlinked'"
                  size="30" position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.height') }}
                </label>
                <NumberInput ref="heightInputRef" v-model="tmpShapeHeight" :min="1" :max="maxShapeHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Fill color -->
        <div v-if="localObjectSettings.type !== 'line'" class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <p :class="{ disabled: localObjectSettings.strokeWidth === 0 }">
                Fill color
              </p>
              <ToggleButton v-model="localObjectSettings.fillEnabled" :scale="0.6" @update="applyLocalSettings"
                :disabled="localObjectSettings.strokeWidth === 0" />
            </div>

            <div class="content-wrapper">
              <div class="content-title">
                <p>Color</p>
              </div>
              <div class="content-inputs">
                <ColorPicker v-model="localObjectSettings.fillColor" @update="applyLocalSettings"
                  :disabled="!localObjectSettings.fillEnabled" />
              </div>
            </div>
          </div>
        </div>

        <!-- Line fill color (fill color is stroke color) -->
        <div v-if="localObjectSettings.type === 'line'" class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <div class="content-title">
                <p>Color</p>
              </div>
              <div class="content-inputs">
                <ColorPicker v-model="localObjectSettings.strokeColor" @update="applyLocalSettings" />
              </div>
            </div>
            <div class="content-wrapper">
              <div class="content-title">
                <p>Width</p>
              </div>
              <div class="content-inputs">
                <NumberDropdownInput v-model="localObjectSettings.strokeWidth" :min="1" :max="100"
                  @update="applyLocalSettings" :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Stroke color -->
        <div v-if="localObjectSettings.type !== 'line'" class="settings-content-wrapper">
          <div class="content-aligned two-items">
            <div class="content-wrapper">
              <div class="content-title">
                <p>Color</p>
              </div>
              <div class="content-inputs">
                <ColorPicker v-model="localObjectSettings.strokeColor" @update="applyLocalSettings"
                  :disabled="localObjectSettings.strokeWidth === 0" />
              </div>
            </div>
            <div class="content-wrapper">
              <div class="content-title">
                <p>Width</p>
              </div>
              <div class="content-inputs">
                <NumberDropdownInput v-model="localObjectSettings.strokeWidth"
                  :min="localObjectSettings.fillEnabled ? 0 : 1" :max="100" @update="applyLocalSettings"
                  :options="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" unit="px" />
              </div>
            </div>
          </div>

        </div>


        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>



    </div>
  </div>
</template>

<style scoped></style>
