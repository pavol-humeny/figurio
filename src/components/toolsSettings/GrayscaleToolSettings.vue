<script setup>
import DefaultButton from '../common/DefaultButton.vue'
import { useGrayscaleTool } from '@/composables/tools/useGrayscaleTool'
import { useImageStore } from '@/stores/imageStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/**
 * Logic of the grayscale tool settings panel
 */
const { applyGrayscale, isGrayscaleApplied } = useGrayscaleTool(
  useImageStore(),
  useHistoryStore(),
  t,
)
</script>

<template>
  <div class="tool-settings">
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Grayscale conversion button -->
        <div class="settings-content-wrapper">
          <div class="content-wrapper">
            <DefaultButton :text="$t('tools.grayscale.settings.convertToGrayscaleButton.text')" @click="applyGrayscale"
              :disabled="isGrayscaleApplied" />
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
