<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useImageStore } from '@/stores/imageStore'
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserModeStore } from '@/stores/userModeStore'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useUiStore } from '@/stores/uiStore'
import { useViewportStore } from '@/stores/viewportStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useEditorStore } from '@/stores/editorStore'

const { t } = useI18n()
const router = useRouter()

/**
 * Logic for the upload file button.
 */
const { openDragAndDropModal } = useUploadFileButton(useImageStore(), t, router, useUserModeStore(), useWorkspaceStore(), useUiStore(), useViewportStore(), useHistoryStore(), useEditorStore())
</script>

<template>
  <ItemTip :text="$t('topPanel.uploadFileButton.tip')" position="bottom">
    <button class="button button-circle button-control button-clickable" @click="openDragAndDropModal">
      <BaseIcon name="IconImport" :size="22" />
    </button>
  </ItemTip>
</template>

<style scoped></style>
