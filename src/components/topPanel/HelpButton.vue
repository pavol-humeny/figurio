<script setup>
/**
 * @file: HelpButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the help button in the top panel. Renders a button that opens the help modal when clicked.
 */
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useHelpModal } from '@/composables/modals/useHelpModal'
import { useI18n } from 'vue-i18n'
import { useUiStore } from '@/stores/uiStore'
import { useImageStore } from '@/stores/imageStore'
import { useEditorStore } from '@/stores/editorStore'
import { useUserModeStore } from '@/stores/userModeStore'

const { t } = useI18n()

/**
 * Logic for the help button.
 */
const {
  openHelpModal
} = useHelpModal(useUiStore(), useImageStore(), useEditorStore(), useUserModeStore(), t)
</script>

<template>
  <ItemTip :text="$t('topPanel.helpButton.tip')" position="bottom-left">
    <button class="button button-circle button-control button-clickable" @click="openHelpModal">
      <BaseIcon name="IconQuestionMark" :size="23" />
    </button>
  </ItemTip>
</template>

<style scoped>
</style>
