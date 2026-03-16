<script setup>
/**
 * @file: ImportModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the import modal. It shows a drag and drop area for importing files into the app.
 */
import DefaultButton from '@/components/common/DefaultButton.vue';
import { useImportModal } from '@/composables/modals/useImportModal';
import DragAndDropArea from '../editor/DragAndDropArea.vue';

/**
 * Logic for the import modal state
 */
const {
  isVisible,
  closeImportModal,
} = useImportModal();

</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="import-modal-overlay modal-overlay" @mousedown.self="closeImportModal">
      <div class="modal-box">
        <DragAndDropArea />
        <DefaultButton :text="$t('dragAndDropArea.closeButton.text')" @click="closeImportModal" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.import-modal-overlay {
  z-index: var(--z-index-import);
}

.modal-box {
  background: var(--background-c);
  border: var(--border-modal);
  padding: 25px 30px 15px 30px;
  border-radius: 20px;
  width: 70vw;
  height: 65vh;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
</style>
