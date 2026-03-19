<script setup>
/**
 * @file: BlurToolSettings.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the blur tool settings. Renders the settings for the blur tool, including position, dimensions, blur strength, edge fade, and z-index control.
 */
import ToolsSettingsTabs from './ToolsSettingsTabs.vue';
import { useImageStore } from '@/stores/imageStore';
import { useBlurTool } from '@/composables/tools/useBlurTool';
import { useHistoryStore } from '@/stores/historyStore';
import { useI18n } from 'vue-i18n';
import { useEditorStore } from '@/stores/editorStore';
import NumberInput from '../common/NumberInput.vue';
import LinkValuesIcon from '../common/LinkValuesIcon.vue';
import DefaultSlider from '../common/DefaultSlider.vue';
import ExplainItem from '../common/ExplainItem.vue';
import { editorConfig } from '@/config/editorConfig'
import { useUiStore } from '@/stores/uiStore';
import SvgObjectsZIndexControl from './SvgObjectsZIndexControl.vue';
const { t } = useI18n();

/**
 * Logic of blur tool
 */
const {
  localBlurSettings,
  applyLocalBlurSettings,
  maxBlurPositionX,
  maxBlurPositionY,
  hidePositionAndDimensions,
  maxBlurWidth,
  maxBlurHeight,
  widthInputRef,
  heightInputRef,
  tmpBlurWidth,
  tmpBlurHeight,
  isDimensionsLinked,
  updateDimension,
  maxBlurStrength,
  maxEdgeFade,
} = useBlurTool(useImageStore(), useHistoryStore(), useEditorStore(), useUiStore(), t);

</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />

    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Position -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.blur.explain')" :title="$t('tools.blur.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.blur.settings.general.position.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="x-input">
                  {{ $t('tools.blur.settings.general.position.x') }}
                </label>
                <NumberInput ref="positionXInputRef" v-model="localBlurSettings.x"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurPositionX" :step="1"
                  @update="applyLocalBlurSettings" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper disabled"></div>

              <div class="content-input">
                <label for="y-input">
                  {{ $t('tools.blur.settings.general.position.y') }}
                </label>
                <NumberInput ref="positionYInputRef" v-model="localBlurSettings.y"
                  :min="editorConfig.objectResizingOverflow ? -Infinity : 0"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurPositionY" :step="1"
                  @update="applyLocalBlurSettings" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Dimensions -->
        <div v-if="!hidePositionAndDimensions" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.blur.settings.general.dimensions.label') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.blur.settings.general.dimensions.width') }}
                </label>
                <NumberInput ref="widthInputRef" v-model="tmpBlurWidth" :min="1"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurWidth"
                  @update="(val) => updateDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isDimensionsLinked"
                  :tipLinked="$t('tools.blur.settings.general.dimensions.tipLinked')"
                  :tipUnlinked="$t('tools.blur.settings.general.dimensions.tipUnlinked')" size="30"
                  position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.blur.settings.general.dimensions.height') }}
                </label>
                <NumberInput ref="heightInputRef" v-model="tmpBlurHeight" :min="1"
                  :max="editorConfig.objectResizingOverflow ? Infinity : maxBlurHeight"
                  @update="(val) => updateDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>

        <!-- Blur strength -->
        <div class="settings-content-wrapper">
          <ExplainItem v-if="hidePositionAndDimensions" :text="$t('tools.blur.explain')"
            :title="$t('tools.blur.label')" />
          <div class="content-title">
            <p>
              {{ $t('tools.blur.settings.general.blurStrength.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <DefaultSlider v-model="localBlurSettings.blurStrength" :min="1" :max="maxBlurStrength" :step="1"
              @update="applyLocalBlurSettings(false)" @commit="applyLocalBlurSettings(true)" showValue
              :tip="$t('tools.blur.settings.general.blurStrength.tip')" position="bottom-left" />
          </div>
        </div>

        <!-- Edge fade -->
        <div class="settings-content-wrapper">
          <div class="content-title">
            <p>
              {{ $t('tools.blur.settings.general.edgeFade.label') }}
            </p>
          </div>
          <div class="content-wrapper">
            <DefaultSlider v-model="localBlurSettings.edgeFade" :min="0" :max="maxEdgeFade" :step="1"
              @update="applyLocalBlurSettings(false)" @commit="applyLocalBlurSettings(true)" showValue
              :tip="$t('tools.blur.settings.general.edgeFade.tip')" position="bottom-left" valueUnit="%" />
          </div>
        </div>

        <!-- Z-index -->
        <SvgObjectsZIndexControl :isVisible="!hidePositionAndDimensions" type="blur" />

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped></style>
