<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ItemTip from '../common/ItemTip.vue';
</script>

<template>
  <ItemTip
    :text="$t('topPanel.settingsButton.tip')"
    position="bottom-left"
  >
    <button class="button button-circle button-control">
      <BaseIcon name="IconSettings" :size="26"/>
    </button>
  </ItemTip>
</template>

<style scoped>
</style>
