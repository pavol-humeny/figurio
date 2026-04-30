<script setup>
/**
 * @file: SettingsButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the settings button in the top panel. Renders a button that opens the settings panel when clicked.
 */
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ItemTip from '@/components/common/ItemTip.vue';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';
import { useUiStore } from '@/stores/uiStore';
import { useUserModeStore } from '@/stores/userModeStore';
import { useViewportStore } from '@/stores/viewportStore';

/**
 * Logic for the settings button.
 */
const {
  isVisible,
  openSettingsPanel,
  closeSettingsPanel
} = useSettingsPanel(useUiStore(), useUserModeStore(), useViewportStore());

</script>

<template>
  <ItemTip :text="$t('topPanel.settingsButton.tip')" position="bottom-left">
    <button class="button button-circle button-control button-clickable"
      @click.stop="isVisible ? closeSettingsPanel() : openSettingsPanel()">
      <BaseIcon name="IconSettings" :size="26" />
    </button>
  </ItemTip>
</template>

<style scoped></style>
