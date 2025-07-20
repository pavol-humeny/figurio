<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useImageStore } from '@/stores/imageStore'
import { useCloseFileButton } from '@/composables/topPanel/useCloseFileButton'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const { t } = useI18n()

/**
 * Logic for the close file button.
 */
const { disabled, closeFile } = useCloseFileButton(useImageStore(), useWorkspaceStore(), t)
</script>

<template>
  <ItemTip :text="!disabled ? $t('topPanel.closeFileButton.tip') : ''" position="bottom">
    <button class="button button-circle button-control" @click="closeFile" :class="{ disabled: disabled }">
      <BaseIcon name="IconCross" :size="26" />
    </button>
  </ItemTip>
</template>

<style scoped></style>
