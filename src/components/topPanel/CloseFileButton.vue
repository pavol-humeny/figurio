<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import ItemTip from '../common/ItemTip.vue';
import { useImageStore } from '@/stores/imageStore';
import { useCloseFileButton } from '@/composables/topPanel/useCloseFileButton';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const {
  disabled,
  closeFile
} = useCloseFileButton(useImageStore(), t);

</script>
<template>
  <ItemTip
    v-if="!disabled"
    :text="$t('topPanel.closeCurrentFileButton.tip')"
    position="bottom"
  >
    <button
      class="button button-circle button-control"
      @click="closeFile"
    >
      <BaseIcon name="IconCross" :size="26" />
    </button>
  </ItemTip>

  <button
    v-else
    class="button button-circle button-control button--disabled"
  >
    <BaseIcon name="IconCross" :size="26" />
  </button>
</template>

<style scoped>
</style>

