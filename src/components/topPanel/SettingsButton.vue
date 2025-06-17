<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ItemTip from '../common/ItemTip.vue';
import { useSettingsPanel } from '@/composables/topPanel/useSettingsPanel';

const { openSettingsPanel } = useSettingsPanel();

</script>

<template>
  <ItemTip
    :text="$t('topPanel.settingsButton.tip')"
    position="bottom-left"
  >
    <button class="button button-circle button-control" @click="openSettingsPanel">
      <BaseIcon name="IconSettings" :size="26"/>
    </button>
  </ItemTip>
</template>

<style scoped>
</style>
