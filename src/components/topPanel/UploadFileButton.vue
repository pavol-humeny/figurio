<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useImageStore } from '@/stores/imageStore'
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

/**
 * Logic for the upload file button.
 */
const { openDragAndDropModal } = useUploadFileButton(useImageStore(), t, router)
</script>

<template>
  <ItemTip :text="$t('topPanel.uploadFileButton.tip')" position="bottom">
    <button class="button button-circle button-control" @click="openDragAndDropModal">
      <BaseIcon name="IconImport" :size="26" />
    </button>
  </ItemTip>
</template>

<style scoped></style>
