<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemHint from '@/components/common/ItemTip.vue'
import { useHelpModal } from '@/composables/modals/useHelpModal'

/**
 * Logic for the help button.
 */
const {
  openHelpModal
} = useHelpModal()
</script>

<template>
  <ItemHint :text="$t('topPanel.helpButton.tip')" position="bottom-left">
    <button class="button button-circle button-control" @click="openHelpModal">
      <BaseIcon name="IconQuestionMark" :size="23" />
    </button>
  </ItemHint>
</template>

<style scoped></style>
