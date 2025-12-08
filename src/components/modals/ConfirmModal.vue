<script setup>
import { useConfirmModal } from '@/composables/modals/useConfirmModal';
import DefaultButton from '@/components/common/DefaultButton.vue';

/**
 * Logic of the confirm modal state and handlers
 */
const {
  isVisible,
  title,
  message,
  confirm,
  confirmText,
  cancel,
  cancelText,
  close,
  useClose,
} = useConfirmModal();
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal-overlay modal-overlay" @mousedown.self="close">
      <div class="modal-box">
        <!-- Close icon -->
        <div v-if="useClose" class="close-icon" @click="close">✕</div>

        <div class="title-wrapper">
          <p>{{ title }}</p>
        </div>
        <div class="message-wrapper">
          <p>{{ message }}</p>
        </div>
        <div class="button-wrapper">
          <DefaultButton :text="cancelText" @click="cancel" onlyText />
          <DefaultButton :text="confirmText" @click="confirm" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-modal-overlay {
  z-index: var(--z-index-modal);
}

.modal-box {
  position: relative;
  background: var(--background-c);
  border: var(--border-modal);
  padding: 20px 25px;
  border-radius: 20px;
  max-width: 500px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
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

.message-wrapper {
  width: 100%;
  font-size: var(--text-font-size);
  display: flex;
  justify-content: left;
}

.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.close-icon {
  position: absolute;
  top: 10px;
  right: 15px;
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  opacity: 0.7;
}

.close-icon:hover {
  color: var(--primary-c);
}
</style>
