<script setup>
import { useImageStore } from '@/stores/imageStore'
import ColorPicker from '../common/ColorPicker.vue'
import NumberInput from '../common/NumberInput.vue'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import { useHistoryStore } from '@/stores/historyStore'
import { useEditorStore } from '@/stores/editorStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { frameColor, frameWidthRef, frameWidth, setFrameWidth } = useFrameTool(
  useImageStore(),
  useHistoryStore(),
  useEditorStore(),
  t,
)
</script>

<template>
  <div class="tool-settings">
    <div class="settings-wrapper">
      <div class="specific-settings">
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="frameColor" />
          </div>
        </div>
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameWidth.label') }}
              </p>
            </div>
            <NumberInput
              ref="frameWidthRef"
              v-model="frameWidth"
              :min="0"
              :max="100"
              :step="1"
              unit="px"
              @update="setFrameWidth(frameWidth)"
              icon="IconArrowWidth"
              :color="'var(--primary-c)'"
              size="22"
              :onReset="() => setFrameWidth(0)"
              :tip="t('tools.frame.settings.general.frameWidth.tip')"
              position="bottom-left"
            />
          </div>
        </div>
        <div class="settings-content-wrapper" style="border: none">
          <!-- Empty space -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
