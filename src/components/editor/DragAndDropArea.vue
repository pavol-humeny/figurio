<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import DefaultButton from '@/components/common/DefaultButton.vue'
import ItemTip from '@/components/common/ItemTip.vue'
import { useDragAndDropArea } from '@/composables/editor/useDragAndDropArea'
import { useI18n } from 'vue-i18n'
import { useImageStore } from '@/stores/imageStore'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const {
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  selectFile
} = useDragAndDropArea(useImageStore(), t, router)
</script>

<template>
  <div
    class="drag-and-drop-area"
    :class="{ dragging: isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <ItemTip :text="$t('dragAndDropArea.tip')" position="bottom">
      <div class="icon-wrap" @click="selectFile">
        <BaseIcon name="IconImport" size="74" :color="'var(--primary-c)'" />
      </div>
    </ItemTip>
    <div class="title-wrapper">
      <p>{{ $t('dragAndDropArea.title') }}</p>
    </div>
    <div class="subtitle-wrapper">
      <p>{{ $t('dragAndDropArea.subtitle') }}</p>
    </div>
    <div class="button-wrapper">
      <DefaultButton
        :text="$t('dragAndDropArea.button.text')"
        @click="selectFile"
      />
    </div>
  </div>
</template>

<style scoped>
.drag-and-drop-area {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  border: var(--border-drag-and-drop);
  background: var(--secondary-c);
}

.drag-and-drop-area.dragging {
  background: var(--drag-over-c, rgba(0, 0, 0, 0.05));
}

.icon-wrap {
  border-radius: 20px;
  padding: 2px;
  background: var(--background-c);
  cursor: pointer;
  transition: var(--default-transition);
}
.icon-wrap:hover {
  transition: var(--default-transition);
  box-shadow: var(--box-shadow-hover);
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
  margin-top: 20px;
  text-align: center;
}

.subtitle-wrapper {
  font-size: var(--subtitle-font-size);
  color: var(--primary-c);
}

.subtitle-wrapper p {
  text-align: center;
}

.button-wrapper {
  margin-top: 20px;
}
</style>
