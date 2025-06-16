<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemHint from '../common/ItemTip.vue'
</script>

<template>
  <ItemHint
    :text="$t('topPanel.helpButton.tip')"
    position="bottom"
  >
    <button class="button button-circle button-control">
      <BaseIcon name="IconQuestionMark" :size="23" />
    </button>
  </ItemHint>
</template>

<style scoped></style>
