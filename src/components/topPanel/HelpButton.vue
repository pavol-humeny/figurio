<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemHint from '../common/ItemTip.vue'
import { useHelpModal } from '@/composables/modals/useHelpModal'

const {
  showHelpModal
} = useHelpModal()
</script>

<template>
  <ItemHint
    :text="$t('topPanel.helpButton.tip')"
    position="bottom-left"
  >
    <button class="button button-circle button-control" @click="showHelpModal">
      <BaseIcon name="IconQuestionMark" :size="23" />
    </button>
  </ItemHint>
</template>

<style scoped></style>
