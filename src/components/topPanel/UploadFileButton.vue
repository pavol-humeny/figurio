<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ItemTip from '../common/ItemTip.vue';
import { useImageStore } from '@/stores/imageStore';
import { useUploadFileButton } from '@/composables/topPanel/useUploadFileButton';

const {
  disabled,
  uploadFile
} = useUploadFileButton(useImageStore());
</script>

<template>
  <ItemTip
    v-if="!disabled"
    :text="$t('topPanel.uploadFileButton.tip')"
    position="bottom"
  >
    <button
      class="button button-circle button-control"
      @click="uploadFile">
      <BaseIcon name="IconImport" :size="26"/>
    </button>
  </ItemTip>

  <button
    v-else
    class="button button-circle button-control button--disabled">
    <BaseIcon name="IconImport" :size="26"/>
  </button>
</template>

<style scoped>
</style>

