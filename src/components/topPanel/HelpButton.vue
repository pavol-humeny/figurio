<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemHint from '@/components/common/ItemTip.vue'
import { useHelpModal } from '@/composables/modals/useHelpModal'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore'

const { t } = useI18n()

/**
 * Logic for the help button.
 */
const {
  openHelpModal
} = useHelpModal(useUiStore(), t)
</script>

<template>
  <ItemHint :text="$t('topPanel.helpButton.tip')" position="bottom-left">
    <button class="button button-circle button-control" @click="openHelpModal">
      <BaseIcon name="IconQuestionMark" :size="23" />
    </button>
  </ItemHint>
</template>

<style scoped></style>
