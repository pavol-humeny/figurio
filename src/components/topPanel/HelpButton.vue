<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useHelpModal } from '@/composables/modals/useHelpModal'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore'
import { useRouter } from 'vue-router'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useUserModeStore } from '@/stores/userModeStore'

const { t } = useI18n()

/**
 * Logic for the help button.
 */
const {
  openHelpModal
} = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), useRouter(), t)
</script>

<template>
  <ItemTip :text="$t('topPanel.helpButton.tip')" position="bottom-left">
    <button class="button button-circle button-control" @click="openHelpModal">
      <BaseIcon name="IconQuestionMark" :size="23" />
    </button>
  </ItemTip>
</template>

<style scoped>
</style>
