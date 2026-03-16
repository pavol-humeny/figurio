<script setup>
/**
 * @file: CloseAllFilesModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for the close all files confirmation modal. It shows a message asking the user if they want to close all files, with a checkbox to also close all files and not just the current one. It syncs the checkbox state with the modal payload for further processing when the user confirms.
 */
import { ref, watch } from 'vue'
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { payload } = useGeneralModal()

/**
 * Close all files (default false)
 */
const closeAllFiles = ref(false)

/**
 * Syncs close all files with modal payload
 */
watch(closeAllFiles, (value) => {
  if (payload.value) payload.value = { ...payload.value, closeAllFiles: value },
    { immediate: true }
})
</script>

<template>
  <div class="close-all-files-modal">
    <div class="title-wrapper">
      <p>{{ t('topPanel.closeFileButton.confirmMultiple.title') }}</p>
    </div>
    <p class="modal-text">{{ t('topPanel.closeFileButton.confirmMultiple.message') }}</p>
    <div class="close-all-files-checkbox">
      <input type="checkbox" id="closeAllFiles" v-model="closeAllFiles" class="checkbox" />
      <label class="checkbox-label" for="closeAllFiles">{{ t('topPanel.closeFileButton.confirmMultiple.closeAll')
      }}</label>

    </div>
  </div>
</template>

<style scoped>
.close-all-files-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
}

.close-all-files-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-text {
  font-size: var(--text-font-size);
}

.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: left;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
}

/* Checkbox */
.checkbox {
  /* Remove default browser style */
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background-color: var(--background-c);
  border: 1px solid var(--primary-c);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

/* Add checkmark when checked */
.checkbox:checked::after {
  content: "✔";
  color: var(--text-c);
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}



.checkbox-label {
  cursor: pointer;
}
</style>
