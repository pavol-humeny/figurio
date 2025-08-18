<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useImageStore } from '@/stores/imageStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useCropTool } from '@/composables/tools/useCropTool'
import { useI18n } from 'vue-i18n'
import NumberInput from '../common/NumberInput.vue'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import DefaultButton from '../common/DefaultButton.vue'

const { t } = useI18n()

/**
 * Logic of the crop tool
 */
const {
  maxCropHeight,
  tmpCropHeight,
  maxCropWidth,
  tmpCropWidth,
  updateDimension,
  isDimensionsLinked,
  heightInputRef,
  widthInputRef,
  cropPositionX,
  cropPositionY,
  maxCropPositionX,
  maxCropPositionY,
  updatePosition,
  positionXInputRef,
  positionYInputRef,
  applyCrop,
} = useCropTool(useImageStore(), useViewportStore(), useEditorStore(), useHistoryStore(), t)

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Crop position -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.transform.settings.crop.cropPosition.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.transform.settings.crop.cropPosition.x') }}
                </label>
                <NumberInput ref="positionXInputRef" v-model="cropPositionX" :min="0" :max="maxCropPositionX"
                  @update="(val) => updatePosition('x', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.transform.settings.crop.cropPosition.y') }}
                </label>
                <NumberInput ref="positionYInputRef" v-model="cropPositionY" :min="0" :max="maxCropPositionY"
                  @update="(val) => updatePosition('y', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Crop dimensions -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.transform.settings.crop.cropDimensions.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.transform.settings.crop.cropDimensions.width') }}
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpCropWidth" :min="0" :max="maxCropWidth"
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
                <NumberInput ref="heightInputRef" v-model="tmpCropHeight" :min="0" :max="maxCropHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Apply crop -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-button">
              <DefaultButton :text="$t('tools.transform.settings.crop.applyCropButton.text')" @click="applyCrop" />
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

<style scoped>
</style>
