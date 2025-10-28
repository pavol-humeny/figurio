<script setup>
import ToolsSettingsTabs from './ToolsSettingsTabs.vue'
import { useImageStore } from '@/stores/imageStore'
import ColorPicker from '../common/ColorPicker.vue'
import NumberInput from '../common/NumberInput.vue'
import { useFrameTool } from '@/composables/tools/useFrameTool'
import { useHistoryStore } from '@/stores/historyStore'
import { useI18n } from 'vue-i18n'
import DropdownSelect from '../common/DropdownSelect.vue'
import ToggleButton from '../common/ToggleButton.vue'
import TimeInput from '../common/TimeInput.vue'
import ExplainItem from '../common/ExplainItem.vue'
import { useViewportStore } from '@/stores/viewportStore'

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
  setPhoneHeader,
  drawPhoneHeader,
  phoneHeaderTextColor,
  setPhoneHeaderTextColor,
  phoneHeaderBackgroundColor,
  setPhoneHeaderBackgroundColor,
  phoneHeaderTimeInMinutes,
  setPhoneHeaderTimeInMinutes,
  isPhoneFrame,
  isFrameWithOutline,
  isFrameWithMultiplier,
  isFrameWithFooter,
  drawPhoneButtons,
  setPhoneButtons,
  phoneButtonsCanBeDrawn,
  drawPhoneNavigation,
  setPhoneNavigation,
  headerOverlap,
  setHeaderOverlap,
  useMillimeters,
  setUseMillimeters,
  frameWidthMm,
  setFrameWidthMm,
  maxFrameWidthMm,
  setHeaderSize,
  setHeaderSizeMm,
  setFooterSize,
  setFooterSizeMm,
  maxHeaderFooterSize,
  headerSize,
  headerSizeMm,
  footerSize,
  footerSizeMm,
  isFrameWithHeader,
} = useFrameTool(useImageStore(), useHistoryStore(), useViewportStore(), t)
</script>

<template>
  <div class="tool-settings">
    <ToolsSettingsTabs :tabs="[]" />
    <div class="settings-wrapper">
      <div class="specific-settings">
        <!-- Frame variants -->
        <div class="settings-content-wrapper">
          <ExplainItem :text="$t('tools.frame.explain')" :title="$t('tools.frame.label')" />
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameVariants.label') }}
              </p>
            </div>
            <DropdownSelect v-model="selectedFrameVariant" :options="frameOptions" @update="handleFrameChange" />
          </div>
        </div>

        <!-- Use mm -->
        <div v-if="selectedFrameVariant !== 'none'" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p style="text-align: start">
                Use millimeters
              </p>
              <ToggleButton v-model="useMillimeters" :scale="0.6" :style="{ transform: 'translateX(16px)' }"
                @update="setUseMillimeters(useMillimeters)"
                :tip="$t('tools.backgroundRemoval.settings.auto.replaceSelection.tip')" position="bottom-left" />
            </div>
          </div>
        </div>

        <!-- Frame color -->
        <div v-if="selectedFrameVariant !== 'none'" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameColor.label') }}
              </p>
            </div>
            <ColorPicker v-model="frameColor" @update="setFrameColor(frameColor, false)"
              @commit="setFrameColor(frameColor, true)" />
          </div>
        </div>

        <!-- Frame outline -->
        <div v-if="isFrameWithOutline(selectedFrameVariant)" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.useFrameOutline.label') }}
              </p>
              <ToggleButton v-model="drawOutline" :scale="0.6" @update="setFrameOutline(drawOutline)"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
          </div>
        </div>

        <!-- Frame width px -->
        <div v-if="(selectedFrameVariant === 'frameSolid' || drawOutline) && !useMillimeters"
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

        <!-- Frame width mm -->
        <div
          v-if="((selectedFrameVariant === 'frameSolid' || drawOutline) || isPhoneFrame(selectedFrameVariant)) && useMillimeters"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.frameWidth.label') }}
              </p>
            </div>
            <NumberInput ref="frameWidthRef" v-model="frameWidthMm" :min="1" :max="maxFrameWidthMm" :step="1" unit="mm"
              @update="setFrameWidthMm(frameWidthMm)" icon="IconArrowWidth" :color="'var(--primary-c)'" size="22"
              :onReset="() => setFrameWidthMm(-1)" :tip="t('tools.frame.settings.general.frameWidth.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Phone buttons -->
        <div v-if="isPhoneFrame(selectedFrameVariant)" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.usePhoneButtons.label') }}
              </p>
              <ToggleButton v-model="drawPhoneButtons" @update="setPhoneButtons(drawPhoneButtons)" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" :disabled="!phoneButtonsCanBeDrawn" />
            </div>
          </div>
        </div>

        <!-- Phone navigation -->
        <div v-if="isPhoneFrame(selectedFrameVariant)" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.usePhoneHomeIndicator.label') }}
              </p>
              <ToggleButton v-model="drawPhoneNavigation" @update="setPhoneNavigation(drawPhoneNavigation)" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
          </div>
        </div>

        <!-- Phone header -->
        <div v-if="isPhoneFrame(selectedFrameVariant)" class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.usePhoneHeader.label') }}
              </p>
              <ToggleButton v-model="drawPhoneHeader" @update="setPhoneHeader(drawPhoneHeader)" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
          </div>
          <div v-if="drawPhoneHeader" class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.useExpandedPhoneHeader.label') }}
              </p>
              <ToggleButton v-model="headerOverlap" @update="setHeaderOverlap(headerOverlap)" :scale="0.6"
                :style="{ transform: 'translateX(16px)' }" />
            </div>
          </div>
          <div v-if="drawPhoneHeader && headerOverlap" class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.phoneHeaderBackgroundColor.label') }}
              </p>
              <ColorPicker v-model="phoneHeaderBackgroundColor"
                @update="setPhoneHeaderBackgroundColor(phoneHeaderBackgroundColor, false)"
                @commit="setPhoneHeaderBackgroundColor(phoneHeaderBackgroundColor, true)" />
            </div>
          </div>
          <div v-if="drawPhoneHeader" class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.phoneHeaderTextColor.label') }}
              </p>
              <ColorPicker v-model="phoneHeaderTextColor" @update="setPhoneHeaderTextColor(phoneHeaderTextColor, false)"
                @commit="setPhoneHeaderTextColor(phoneHeaderTextColor, true)" />
            </div>
          </div>
          <div v-if="drawPhoneHeader" class="content-wrapper">
            <div class="content-aligned two-items">
              <p>
                {{ t('tools.frame.settings.general.phoneHeaderTime.label') }}
              </p>
              <TimeInput v-model="phoneHeaderTimeInMinutes"
                @update="setPhoneHeaderTimeInMinutes(phoneHeaderTimeInMinutes)" />
            </div>
          </div>
        </div>

        <!-- Header size px -->
        <div
          v-if="isFrameWithMultiplier(selectedFrameVariant) && isFrameWithHeader(selectedFrameVariant) && !useMillimeters"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.headerSize.label') }}
              </p>
            </div>
            <NumberInput ref="frameWidthRef" v-model="headerSize" :min="5" :max="maxHeaderFooterSize" :step="1"
              unit="px" @update="setHeaderSize(headerSize)" icon="IconArrowWidth" :color="'var(--primary-c)'" size="22"
              :onReset="() => setHeaderSize(-1)" :tip="t('tools.frame.settings.general.headerSize.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Footer size px -->
        <div
          v-if="isFrameWithMultiplier(selectedFrameVariant) && isFrameWithFooter(selectedFrameVariant) && !useMillimeters"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.footerSize.label') }}
              </p>
            </div>
            <NumberInput ref="frameWidthRef" v-model="footerSize" :min="5" :max="maxHeaderFooterSize" :step="1"
              unit="px" @update="setFooterSize(footerSize)" icon="IconArrowWidth" :color="'var(--primary-c)'" size="22"
              :onReset="() => setFooterSize(-1)" :tip="t('tools.frame.settings.general.footerSize.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Header size mm -->
        <div
          v-if="isFrameWithMultiplier(selectedFrameVariant) && isFrameWithHeader(selectedFrameVariant) && useMillimeters"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.headerSize.label') }}
              </p>
            </div>
            <NumberInput ref="frameWidthRef" v-model="headerSizeMm" :min="5" :max="maxHeaderFooterSize" :step="1"
              unit="mm" @update="setHeaderSizeMm(headerSizeMm)" icon="IconArrowWidth" :color="'var(--primary-c)'"
              size="22" :onReset="() => setHeaderSizeMm(-1)" :tip="t('tools.frame.settings.general.headerSize.tip')"
              position="bottom-left" />
          </div>
        </div>

        <!-- Footer size mm -->
        <div
          v-if="isFrameWithMultiplier(selectedFrameVariant) && isFrameWithFooter(selectedFrameVariant) && useMillimeters"
          class="settings-content-wrapper">
          <div class="content-wrapper">
            <div class="content-title">
              <p>
                {{ t('tools.frame.settings.general.footerSize.label') }}
              </p>
            </div>
            <NumberInput ref="frameWidthRef" v-model="footerSizeMm" :min="5" :max="maxHeaderFooterSize" :step="1"
              unit="mm" @update="setFooterSizeMm(footerSizeMm)" icon="IconArrowWidth" :color="'var(--primary-c)'"
              size="22" :onReset="() => setFooterSizeMm(-1)" :tip="t('tools.frame.settings.general.footerSize.tip')"
              position="bottom-left" />
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
