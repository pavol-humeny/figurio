<script setup>
/**
 * @file: CloseFileButton.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the close file button in the top panel. Renders a button that allows users to close the currently open file. The button is disabled when there are no files to close or when closing is not possible.
 */
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useImageStore } from '@/stores/imageStore'
import { useCloseFileButton } from '@/composables/topPanel/useCloseFileButton'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()

/**
 * Logic for the close file button.
 */
const { disabled, closeFile } = useCloseFileButton(useImageStore(), useWorkspaceStore(), t)
</script>

<template>
  <ItemTip
    :text="!disabled ? (workspaceStore.numberOfTabs > 1 ? $t('topPanel.closeFileButton.tipMultiple') : $t('topPanel.closeFileButton.tip')) : ''"
    position="bottom">
    <button class="button button-circle button-control button-clickable" @click="closeFile" :class="{ disabled: disabled }">
      <BaseIcon name="IconCross" :size="26" />
    </button>
  </ItemTip>
</template>

<style scoped></style>
