<script setup>
import { useImageStore } from '@/stores/imageStore'
import ColorPicker from '../common/ColorPicker.vue'
import NumberInput from '../common/NumberInput.vue'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import { useHistoryStore } from '@/stores/historyStore'
import { useEditorStore } from '@/stores/editorStore'
import { useI18n } from 'vue-i18n'
import DropdownSelect from '../common/DropdownSelect.vue'
import ToggleButton from '../common/ToggleButton.vue'

const { t } = useI18n()

/**
 * Logic of the frame tool settings panel
 */
const {
  frameColor,
  frameWidthRef,
  frameWidth,
  setFrameWidth,
  selectedFrameVariant,
  frameOptions,
  handleFrameChange,
  drawOutline,
  setFrameColor,
  setFrameOutline,
} = useFrameTool(useImageStore(), useHistoryStore(), useEditorStore(), t)
</script>

<template>
  <div class="tool-settings">
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Frame color -->
        <div v-if="selectedFrameVariant !== 'none'" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="frameColor" @update="setFrameColor(frameColor)" />
          </div>
        </div>

        <!-- Frame width -->
        <div
          v-if="selectedFrameVariant === 'frameSolid' || selectedFrameVariant === 'frameMacBrowser' || selectedFrameVariant === 'frameWindowsBrowser' || selectedFrameVariant === 'frameWindowsTaskBar'"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p :class="{ disabled: selectedFrameVariant !== 'frameSolid' && !drawOutline }">
                {{ t('tools.frame.settings.general.frameWidth.label') }}
              </p>
            </div>
            <NumberInput ref="frameWidthRef" v-model="frameWidth" :min="0" :max="100" :step="1" unit="px"
              @update="setFrameWidth(frameWidth)" icon="IconArrowWidth" :color="'var(--primary-c)'" size="22"
              :onReset="() => setFrameWidth(-1)" :tip="t('tools.frame.settings.general.frameWidth.tip')"
              position="bottom-left" :disabled="selectedFrameVariant !== 'frameSolid' && !drawOutline" />
          </div>
        </div>

        <!-- Frame variants -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameVariants.label') }}
              </p>
            </div>
            <DropdownSelect v-model="selectedFrameVariant" :options="frameOptions" @update="handleFrameChange" />
          </div>
        </div>

        <!-- Frame outline -->
        <div
          v-if="selectedFrameVariant === 'frameWindowsBrowser' || selectedFrameVariant === 'frameMacBrowser' || selectedFrameVariant === 'frameWindowsTaskBar'"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.useFrameOutline.label') }}
              </p>
              <ToggleButton v-model="drawOutline" style="transform: scale(0.6);"
                @update="setFrameOutline(drawOutline)" />
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
