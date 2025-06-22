<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useImageStore } from '@/stores/imageStore';
import { useFileNameDisplay } from '@/composables/topPanel/useFileNameDisplay';
import { useI18n } from 'vue-i18n'

import ItemTip from '@/components/common/ItemTip.vue';

const { t } = useI18n()

const {
  editEnabled,
  disabled,
  fileNameInput,
  inputRef,
  startEditing,
  saveNewFileName
} = useFileNameDisplay(useImageStore(), t)

</script>

<template>
  <ItemTip
    :text="disabled ? $t('topPanel.fileNameDisplay.tipDisabled') : $t('topPanel.fileNameDisplay.tip')"
    position="bottom-right"
  >
    <div
      class="file-name-display-wrapper"
      :class="{'file-name-display-wrapper--disabled': disabled}"
      >
      <input
        ref="inputRef"
        name="fileName"
        v-model="fileNameInput"
        @blur="saveNewFileName"
        @keydown.enter="saveNewFileName"
        @click="startEditing"
        class="file-name-display-input"
        type="text"
      />
      <BaseIcon
        :name="editEnabled ? 'IconTick' : 'IconEditPencil'"
        :size="30"
        :color="'var(--primary-c)'"
        @click="editEnabled ? saveNewFileName() : startEditing()"
      />
    </div>
  </ItemTip>
</template>

<style scoped>
.file-name-display-wrapper{
  display: flex;
  align-items: center;
  cursor: pointer;
  background: var(--secondary-c);
  border-radius: 20px;
  height: 40px;
  width: 200px;
  padding: 8px 16px;
  gap: 8px;
}
.file-name-display-wrapper--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.file-name-display-input {
  height: 100%;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-placeholder-c);
  font-size: var(--text-font-size);
  outline: none;
}

.file-name-display-text {
  color: var(--text-primary);
  font-size: 15px;
  cursor: text;
}

</style>
