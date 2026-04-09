<script setup>
/**
 * @file: ExportToolSettings.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the export tool settings panel. Renders the settings for exporting the edited image, including file format selection, quality adjustment, file name input, expected file size, and a preview of the exported image. The component also includes functionality for copying the image to the clipboard.
 */
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings'
import DefaultButton from '@/components/common/DefaultButton.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useImageStore } from '@/stores/imageStore'
import { useI18n } from 'vue-i18n'
import DefaultSlider from '@/components/common/DefaultSlider.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useMath } from '@/composables/common/useMath'
import DropdownSelect from '../common/DropdownSelect.vue'
import { useViewportStore } from '@/stores/viewportStore'
import { useUiStore } from '@/stores/uiStore'

const { t } = useI18n()
const { round } = useMath()

/**
 * Logic of the export tool settings panel
 */
const {
  isVisible,
  inputFileNameRef,
  fileName,
  fileFormat,
  fileDimensions,
  updateQuality,
  saveNewFileName,
  closeExportToolSettings,
  exportFileFunction,
  previewUrl,
  copyImageToClipboardFunction,
  expectedPreviewSize,
  fileFormatOptions
} = useExportToolSettings(useImageStore(), useEditorStore(), useHistoryStore(), useViewportStore(), useUiStore(), t)
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="export-overlay" @mousedown.self="closeExportToolSettings">
      <div class="export-box">
        <div class="export-settings">
          <div class="title-wrapper">
            <BaseIcon name="IconExportTool" size="32" color="var(--text-c)" />
            <p>{{ $t('tools.export.settings.general.title') }}</p>
          </div>

          <!-- File format -->
          <div class="export-settings-item">
            <label>{{ $t('tools.export.settings.general.fileFormat') }}</label>
            <DropdownSelect v-model="fileFormat" :options="fileFormatOptions" />
          </div>

          <!-- Quality setting -->
          <div class="export-settings-item"
            v-if="fileFormat === 'jpg' || fileFormat === 'webp' || fileFormat === 'jpeg'">
            <label for="file-quality">{{
              $t('tools.export.settings.general.fileQuality.label')
            }}</label>
            <p>{{ round(fileDimensions.quality) }} %</p>
            <DefaultSlider v-model="fileDimensions.quality" :min="1" :max="100" :step="1"
              @update:modelValue="(value) => updateQuality(value)" />
          </div>

          <!-- File name -->
          <div class="export-settings-item">
            <label for="file-name">{{ $t('tools.export.settings.general.fileName.label') }}</label>
            <input ref="inputFileNameRef" type="text" v-model="fileName" id="file-name"
              :placeholder="$t('tools.export.settings.general.fileName.placeholder')" @blur="saveNewFileName"
              @keydown.enter="saveNewFileName" />
          </div>

          <!-- File dimensions -->
          <div class="export-settings-item">
            <label>{{
              $t('tools.export.settings.general.fileDimensions.label')
              }}</label>
            <div class="export-settings-item-value">
              <div class="width disabled">
                <p>
                  {{ $t('tools.export.settings.general.fileDimensions.width') }}
                </p>
                <p>
                  : {{ round(fileDimensions.width) }}px
                </p>
              </div>

              <div class="height disabled">
                <p>
                  {{ $t('tools.export.settings.general.fileDimensions.height') }}
                </p>
                <p>
                  : {{ round(fileDimensions.height) }}px
                </p>
              </div>
            </div>
          </div>

          <!-- Expected file size -->
          <div v-if="fileFormat === 'png' || fileFormat === 'jpg' || fileFormat === 'webp' || fileFormat === 'jpeg'"
            class="export-settings-item">
            <label>{{ $t('tools.export.settings.general.expectedFileSize.label') }}</label>
            <div class="export-settings-item-value ">
              <p class="disabled">{{ expectedPreviewSize }} kB</p>
            </div>
          </div>

          <!-- Copy to clipboard button for PNG format -->
          <div class="export-settings-item">
            <div class="copy-to-clipboard-item">
              <DefaultButton :text="$t('tools.export.settings.general.copyToClipboardButton.text')"
                :tip="$t('tools.export.settings.general.copyToClipboardButton.tip')"
                @click="copyImageToClipboardFunction" position="bottom-right" />
            </div>
          </div>

          <!-- Export or close -->
          <div class="buttons-wrapper">
            <DefaultButton :text="$t('tools.export.settings.general.cancelButton.text')"
              @click="closeExportToolSettings" onlyText />
            <DefaultButton :text="$t('tools.export.settings.general.exportButton.text')" @click="exportFileFunction" />
          </div>
        </div>

        <!-- Export preview -->
        <div class="export-preview">
          <img v-if="previewUrl" loading="lazy" decoding="async" :src="previewUrl" alt="Export Preview"
            class="export-preview-img" :style="{
              aspectRatio: fileDimensions.width + ' / ' + fileDimensions.height,
              boxShadow: 'var(--box-shadow-content)'
            }" />
          <div v-else class="export-preview-placeholder">
            {{ $t('tools.export.settings.general.preview.previewUnavailable') }}
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.export-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);

  display: flex;
  overflow-y: auto;

  padding: 40px 20px;

  z-index: var(--z-index-export);
}

.export-box {
  background: var(--background-c);
  border: var(--border-modal);
  padding: 40px 50px;
  border-radius: 20px;

  width: 900px;
  height: max-content;

  max-width: 90vw;

  margin: auto;

  flex-shrink: 0;

  box-shadow: var(--box-shadow-ui);

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 50px;
}

.export-settings {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
}

.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
}

.export-settings-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.copy-to-clipboard-item {
  display: flex;
  justify-content: left;
}

.export-settings-item label {
  font-size: var(--subtitle-font-size);
  font-weight: var(--subtitle-font-weight);
  user-select: none;
}

.export-settings-item select,
.export-settings-item input {
  width: 100%;
  padding: 7px 25px 7px 10px;
  border-radius: 10px;
  border: none;
  background: var(--secondary-c);
  color: var(--text-c);
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.input-unit {
  position: absolute;
  right: 8px;
  top: 45%;
  transform: translateY(-50%);
  font-size: 13px;
  color: var(--text-c);
  pointer-events: none;
}

.export-settings-item-value {
  background-color: var(--secondary-c);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
}

.export-settings-item-value .width,
.export-settings-item-value .height {
  display: flex;
  flex-direction: row;
  gap: 2px;
}

.export-settings-item p {
  font-size: var(--text-font-size);
}

.icon-wrapper {
  padding-top: 20px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.buttons-wrapper {
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.export-preview {
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background: rgb(255, 255, 255);
}

.export-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  overflow: hidden;
  width: 300px;
  height: 300px;
  position: relative;
}

.export-preview-img {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.export-preview-placeholder {
  color: var(--text-c);
  font-size: var(--text-font-size);
  width: 100%;
  aspect-ratio: 1 / 1;
  border: var(--border-ui);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
}
</style>
