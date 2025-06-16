<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useImageStore } from '@/stores/imageStore';
import { useFileNameDisplay } from '@/composables/topPanel/useFileNameDisplay';

const {
  editEnabled,
  fileNameInput,
  inputRef,
  startEditing,
  saveNewFileName
} = useFileNameDisplay(useImageStore())

</script>

<template>
  <div class="file-name-display-wrapper">
    <input
      ref="inputRef"
      v-model="fileNameInput"
      @blur="saveNewFileName"
      @keydown.enter="saveNewFileName"
      @click="startEditing"
      class="file-name-display-input"
      type="text"
      autofocus
    />
    <BaseIcon
      :name="editEnabled ? 'IconTick' : 'IconEditPencil'"
      :size="30"
      :color="'var(--primary-c)'"
      @click="editEnabled ? saveNewFileName() : startEditing()"
    />
  </div>
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
.file-name-display-input {
  height: 100%;
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-placeholder-c);
  font-size: 15px;
  outline: none;
}

.file-name-display-text {
  color: var(--text-primary);
  font-size: 15px;
  cursor: text;
}

</style>
