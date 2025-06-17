<script setup>
import BaseIcon from '../icons/BaseIcon.vue';
import LanguageSwitch from './LanguageSwitch.vue';
import ThemeSwitch from './ThemeSwitch.vue';
import DefaultButton from '../common/DefaultButton.vue';
import ToggleButton from '../common/ToggleButton.vue';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';
import { useUiStore } from '@/stores/uiStore';
import { useClickOutside } from '@/composables/common/useClickOutside';

const {
    isVisible,
    closeSettingsPanel,
    enableShortcuts,
    resetPanelWidthDisabled,
    resetPanelWidth,
    openPrivacyModal,
} = useSettingsPanel(useUiStore());

const { wrapperRef } = useClickOutside({
  condition: () => !openPrivacyModal.value,
  onOutsideClick: () => closeSettingsPanel()
})

</script>

<template>
  <div
    class="settings-panel"
    v-if="isVisible"
    ref="wrapperRef">
    <div class="settings-panel-label">
      <BaseIcon name="IconSettings" :size="28" :color="'var(--text-c)'" />
      <p>
        {{ $t('topPanel.settingsPanel.title') }}
      </p>
    </div>

    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.language.label') }}
      </label>
      <LanguageSwitch />
    </div>

    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.theme.label') }}
      </label>
      <ThemeSwitch />
    </div>

    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.enableShortcuts.label') }}
      </label>
      <ToggleButton
        v-model="enableShortcuts"
        :tip="$t('topPanel.settingsPanel.enableShortcuts.button.tip')"
        position="bottom-left"
      />
    </div>

    <div class="section">
      <label>
        {{ $t('topPanel.settingsPanel.resetSidebarWidth.label') }}
      </label>

      <DefaultButton
        :text="$t('topPanel.settingsPanel.resetSidebarWidth.button.text')"
        :tip="$t('topPanel.settingsPanel.resetSidebarWidth.button.tip')"
        position="bottom-left"
        :onClick="resetPanelWidth"
        :disabled="resetPanelWidthDisabled"
      />
    </div>

    <div class="section">
      <label>
        <BaseIcon name="IconPrivacy" :size="20" :color="'var(--text-c)'" />
        {{ $t('topPanel.settingsPanel.openPrivacyAndData.label') }}
      </label>

      <DefaultButton
        :text="$t('topPanel.settingsPanel.openPrivacyAndData.button.text')"
        :tip="$t('topPanel.settingsPanel.openPrivacyAndData.button.tip')"
        position="bottom-left"
        :onClick="openPrivacyModal"
      />
    </div>

    <div class="close-button-wrapper">
      <DefaultButton
        text="Close"
        :onClick="closeSettingsPanel"
      />
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

.settings-panel-label{
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
  justify-content: start;
  margin-top: 35px;
}
</style>
