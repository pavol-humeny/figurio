<script setup>
import { useExportToolSettings } from '@/composables/toolsSettings/useExportToolSettings'
import DefaultButton from '@/components/common/DefaultButton.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useShaking } from '@/composables/common/useShaking'
import { useImageStore } from '@/stores/imageStore'
import { useI18n } from 'vue-i18n'
import DefaultSlider from '@/components/common/DefaultSlider.vue'
import { useEditorStore } from '@/stores/editorStore'
import { useHistoryStore } from '@/stores/historyStore'

const { t } = useI18n()

/**
 * Logic of the shaking animation (used when clicking outside modal)
 */
const { isShaking, triggerShake } = useShaking()

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
  exportFile,
  previewUrl,
  copyImageToClipboard,
  expectedPreviewSize
} = useExportToolSettings(useImageStore(), useEditorStore(), useHistoryStore(), t)
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="export-overlay" @click.self="triggerShake">
      <div class="export-box" :class="{ shake: isShaking }">
        <div class="export-settings">
          <div class="title-wrapper">
            <BaseIcon name="IconExportTool" size="32" color="var(--text-c)" />
            <p>{{ $t('tools.export.settings.general.title') }}</p>
          </div>

          <!-- File format -->
          <div class="export-settings-item">
            <label for="file-format">{{ $t('tools.export.settings.general.fileFormat') }}</label>
            <select id="file-format" v-model="fileFormat">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="pdf">PDF</option>
              <option value="webp">WebP</option>
              <option value="svg">SVG</option>
            </select>
          </div>

          <!-- Quality setting -->
          <div class="export-settings-item" v-if="fileFormat === 'jpg' || fileFormat === 'webp'">
            <label for="file-quality">{{
              $t('tools.export.settings.general.fileQuality.label')
            }}</label>
            <p>{{ fileDimensions.quality }} %</p>
            <DefaultSlider v-model="fileDimensions.quality" :min="0" :max="100" :step="1"
              @update:modelValue="(value) => updateQuality(value)" :backgroundColor="'var(--background-c)'" />
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
                  : {{ fileDimensions.width }}px
                </p>
              </div>

              <div class="height disabled">
                <p>
                  {{ $t('tools.export.settings.general.fileDimensions.height') }}
                </p>
                <p>
                  : {{ fileDimensions.height }}px
                </p>
              </div>
            </div>
          </div>

          <!-- Expected file size -->
          <div v-if="fileFormat === 'png' || fileFormat === 'jpg' || fileFormat === 'webp'"
            class="export-settings-item">
            <label>{{ $t('tools.export.settings.general.expectedFileSize.label') }}</label>
            <div class="export-settings-item-value ">
              <p class="disabled">{{ expectedPreviewSize }} kB</p>
            </div>
          </div>

          <!-- Copy to clipboard button for PNG format -->
          <div v-if="fileFormat === 'png'" class="export-settings-item">
            <DefaultButton :text="$t('tools.export.settings.general.copyToClipboardButton.text')"
              :tip="$t('tools.export.settings.general.copyToClipboardButton.tip')" @click="copyImageToClipboard" />
          </div>

          <!-- Export or close -->
          <div class="buttons-wrapper">
            <DefaultButton :text="$t('tools.export.settings.general.cancelButton.text')"
              @click="closeExportToolSettings" onlyText />
            <DefaultButton :text="$t('tools.export.settings.general.exportButton.text')" @click="exportFile" />
          </div>
        </div>

        <!-- Export preview -->
        <div class="export-preview">
          <img v-if="previewUrl" :src="previewUrl" alt="Export Preview" class="export-preview-img" :style="{
            aspectRatio: fileDimensions.width + ' / ' + fileDimensions.height,
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
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-export);
}

.export-box {
  background: var(--secondary-c);
  border: var(--border-modal);
  padding: 40px 50px;
  border-radius: 20px;
  min-width: 900px;
  max-width: 80vh;
  min-height: 500px;
  max-height: 80vh;
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
  background: var(--background-c);
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
  background-color: var(--background-c);
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
  background: rgb(255, 255, 255);
}

/*********** Baseline, reset styles ***********/
input[type='range'] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  padding: 0;
}

/******** Chrome, Safari, Opera and Edge Chromium styles ********/
/* slider track */
input[type='range']::-webkit-slider-runnable-track {
  background-color: var(--background-c);
  border-radius: 10px;
  height: 10px;
}

/* slider thumb */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* Override default look */
  appearance: none;
  margin-top: -5px;
  /* Centers thumb on the track */
  background-color: var(--primary-c);
  border-radius: 10px;
  height: 20px;
  width: 20px;
}

/*********** Firefox styles ***********/
/* slider track */
input[type='range']::-moz-range-track {
  background-color: var(--background-c);
  border-radius: 10px;
  height: 10px;
}

/* slider thumb */
input[type='range']::-moz-range-thumb {
  background-color: var(--primary-c);
  border: none;
  border-radius: 10px;
  height: 20px;
  width: 20px;
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
