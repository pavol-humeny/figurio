<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import LanguageSwitch from './LanguageSwitch.vue';
import ThemeSwitch from './ThemeSwitch.vue';
import DefaultButton from '@/components/common/DefaultButton.vue';
import ToggleButton from '@/components/common/ToggleButton.vue';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';
import { useUiStore } from '@/stores/uiStore';
import { useClickOutside } from '@/composables/common/useClickOutside';
import pkg from '../../../package.json';

/**
 * Logic for the settings panel.
 */
const {
  isVisible,
  closeSettingsPanel,
  enableShortcuts,
  resetPanelWidthDisabled,
  resetPanelWidth,
  openPrivacyModal,
  privacyModalVisible,
  enableRulers
} = useSettingsPanel(useUiStore());

/**
 * Logic for handling clicks outside the settings panel.
 */
const { wrapperRef } = useClickOutside({
  condition: () => !privacyModalVisible.value,
  onOutsideClick: () => closeSettingsPanel()
})

</script>

<template>
  <div class="settings-panel" v-if="isVisible" ref="wrapperRef">
    <!-- Title -->
    <div class="settings-panel-label">
      <BaseIcon name="IconSettings" :size="28" :color="'var(--text-c)'" />
      <p>
        {{ $t('topPanel.settingsPanel.title') }}
      </p>
    </div>

    <!-- Language -->
    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.language.label') }}
      </label>
      <LanguageSwitch />
    </div>

    <!-- Theme -->
    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.theme.label') }}
      </label>
      <ThemeSwitch />
    </div>

    <!-- Key Shortcuts -->
    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.enableShortcuts.label') }}
      </label>
      <ToggleButton v-model="enableShortcuts" :tip="$t('topPanel.settingsPanel.enableShortcuts.button.tip')"
        position="bottom-left" />
    </div>

    <!-- Rulers -->
    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.enableRulers.label') }}
      </label>
      <ToggleButton v-model="enableRulers" :tip="$t('topPanel.settingsPanel.enableRulers.button.tip')"
        position="bottom-left" />
    </div>

    <!-- Reset Sidebar Width -->
    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.resetSidebarWidth.label') }}
      </label>

      <DefaultButton :text="$t('topPanel.settingsPanel.resetSidebarWidth.button.text')"
        :tip="$t('topPanel.settingsPanel.resetSidebarWidth.button.tip')" position="bottom-left" @click="resetPanelWidth"
        :disabled="resetPanelWidthDisabled" />
    </div>

    <!-- Privacy and Data -->
    <div class="section">
      <label>
        <BaseIcon name="IconPrivacy" :size="20" :color="'var(--text-c)'" />
        {{ $t('topPanel.settingsPanel.openPrivacyAndData.label') }}
      </label>

      <DefaultButton :text="$t('topPanel.settingsPanel.openPrivacyAndData.button.text')"
        :tip="$t('topPanel.settingsPanel.openPrivacyAndData.button.tip')" position="bottom-left"
        @click="openPrivacyModal" />
    </div>

    <!-- Close Settings and version -->
    <div class="close-button-wrapper">
      <DefaultButton text="Close" @click="closeSettingsPanel" />
      <p class="version">{{ $t('topPanel.settingsPanel.appVersion.label') }}: {{ pkg.version }}</p>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  min-width: 400px;
  background: var(--background-c);
  border: var(--border-modal);
  border-radius: 20px;
  padding: 20px 25px;
  z-index: var(--z-index-settings);
}

.settings-panel-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--title-font-size);
  margin-bottom: 20px;
}

.section {
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section label {
  font-size: var(--text-font-size);
  color: var(--text-c);
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 7px;
}

.close-button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 35px;
}

.version {
  font-size: var(--text-font-size);
  color: var(--primary-c);
}
</style>
