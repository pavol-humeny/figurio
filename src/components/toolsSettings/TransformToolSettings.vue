<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import DefaultButton from '../common/DefaultButton.vue'
import LinkValuesIcon from '../common/LinkValuesIcon.vue'
import BaseIcon from '../icons/BaseIcon.vue'
import NumberInput from '../common/NumberInput.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useImageStore } from '@/stores/imageStore'
import { useFlipTool } from '@/composables/tools/useFlipTool'
import { useRotateTool } from '@/composables/tools/useRotateTool'
import { useHistoryStore } from '@/stores/historyStore'
import { useResizeTool } from '@/composables/tools/useResizeTool'
import { useI18n } from 'vue-i18n'
import { useViewportStore } from '@/stores/viewportStore'
import ExplainItem from '../common/ExplainItem.vue'
import { useUiStore } from '@/stores/uiStore'

const { t } = useI18n()

const editorStore = useEditorStore()

/**
 * Logic of the flip tool
 */
const { applyFlip } = useFlipTool(useImageStore(), useHistoryStore(), useUiStore(), t)

/**
 * Logic of the rotate tool
 */
const { applyRotation } = useRotateTool(useImageStore(), useHistoryStore(), useUiStore(), t)

/**
 * Logic of the resize tool
 */
const {
  fileDimensionWidth,
  fileDimensionHeight,
  maxFileDimensionWidth,
  maxFileDimensionHeight,
  minFileDimensionWidth,
  minFileDimensionHeight,
  updateFileDimension,
  FileDimensionWidthInputRef,
  FileDimensionHeightInputRef,
  isFileDimensionsLinked,
  resetResize,
  applyResize,
  canBeApplied,
  canBeReset
} = useResizeTool(useImageStore(), useHistoryStore(), useViewportStore(), useUiStore(), t)

/**
 * Tabs for the transform tool settings
 */
const tabs = ['rotate', 'flip', 'resize']
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="tabs" />

    <div class="settings-wrapper">
      <!-- Rotate -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'rotate'" class="specific-settings">
        <!-- Rotate left -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.transform.subTools.rotate.explain')"
            :title="$t('tools.transform.subTools.rotate.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconRotateLeft" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.rotateLeft') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation(-90)" main />
            </div>
          </div>
        </div>

        <!-- Rotate right -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconRotateRight" size="25" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.rotate.rotateRight') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton :text="$t('tools.transform.settings.rotate.applyRotationButton.text')"
                @click="applyRotation(90)" main />
            </div>
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Flip -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'flip'" class="specific-settings">
        <!-- Flip horizontal -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.transform.subTools.flip.explain')"
            :title="$t('tools.transform.subTools.flip.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconFlipHorizontal" size="30" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.flip.horizontal') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton :text="$t('tools.transform.settings.flip.applyFlipButton.text')"
                @click="applyFlip('horizontal')" main />
            </div>
          </div>
        </div>

        <!-- Flip vertical -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <BaseIcon name="IconFlipVertical" size="30" :color="'var(--primary-c)'" />
              <p>
                {{ $t('tools.transform.settings.flip.vertical') }}
              </p>
            </div>
            <div class="content-button">
              <DefaultButton :text="$t('tools.transform.settings.flip.applyFlipButton.text')"
                @click="applyFlip('vertical')" main />
            </div>
          </div>
        </div>

        <!-- Empty space -->
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>

      <!-- Resize -->
      <div v-if="editorStore.selectedTabPerTool[editorStore.selectedToolKey] === 'resize'" class="specific-settings">
        <!-- Resize dimensions -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.transform.subTools.resize.explain')"
            :title="$t('tools.transform.subTools.resize.label')" position="left" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ $t('tools.transform.settings.resize.resizeDimensions.title') }}
              </p>
            </div>
            <div class="content-inputs">
              <div class="content-input">
                <label for="width-input">
                  {{ $t('tools.transform.settings.resize.resizeDimensions.width') }}
                </label>
                <NumberInput ref="FileDimensionWidthInputRef" v-model="fileDimensionWidth" :min="minFileDimensionWidth"
                  :max="maxFileDimensionWidth" @update="(val) => updateFileDimension('width', val)" unit="px" />
              </div>

              <div class="content-between-inputs-icon-wrapper">
                <LinkValuesIcon v-model="isFileDimensionsLinked"
                  :tipLinked="$t('tools.transform.settings.resize.resizeDimensions.tipLinked')"
                  :tipUnlinked="$t('tools.transform.settings.resize.resizeDimensions.tipUnlinked')" size="30"
                  position="bottom-left" />
              </div>

              <div class="content-input">
                <label for="height-input">
                  {{ $t('tools.transform.settings.resize.resizeDimensions.height') }}
                </label>
                <NumberInput ref="FileDimensionHeightInputRef" v-model="fileDimensionHeight"
                  :min="minFileDimensionHeight" :max="maxFileDimensionHeight"
                  @update="(val) => updateFileDimension('height', val)" unit="px" />
              </div>
            </div>
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.transform.settings.resize.resetResizeButton.text')"
              :tip="$t('tools.transform.settings.resize.resetResizeButton.tip')" position="bottom-left"
              @click="resetResize" :disabled="!canBeReset" />
          </div>
        </div>

        <!-- Apply resize -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.transform.settings.resize.applyResizeButton.text')" @click="applyResize"
              main :disabled="!canBeApplied" />
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
.crop-variants-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: center;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.crop-variant {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  height: 70px;
  width: 60px;
  background: none;
  font-size: 12px;
}

.crop-variant.active {
  background: var(--secondary-c);
  border-radius: 10px;
}
</style>
