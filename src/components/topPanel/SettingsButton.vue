<script setup>
/**
 * @file: SettingsButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ItemTip from '@/components/common/ItemTip.vue';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';

/**
 * Logic for the settings button.
 */
const {
  isVisible,
  openSettingsPanel,
  closeSettingsPanel
} = useSettingsPanel();

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
