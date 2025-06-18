<script setup>
import { useConfirmModal } from '@/composables/modals/useConfirmModal';
import DefaultButton from '../common/DefaultButton.vue';
import { useShaking } from '@/composables/common/useShaking';

const {
  isShaking,
  triggerShake
} = useShaking();

const {
  isVisible,
  title,
  message,
  confirm,
  confirmText,
  cancel,
  cancelText,
} = useConfirmModal();
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal-overlay" @click.self="triggerShake">
      <div
        class="modal-box"
        :class="{ shake: isShaking }"
      >
        <div class="title-wrapper">
          <p>{{ title }}</p>
        </div>
        <div class="message-wrapper">
          <p>{{ message }}</p>
        </div>
        <div class="button-wrapper">
          <DefaultButton
            :text="cancelText"
            :onClick="cancel"
            onlyText
          />
          <DefaultButton
            :text="confirmText"
            :onClick="confirm"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-modal-overlay{
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--overlay-c);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
}

.modal-box {
  background: var(--secondary-c);
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

</style>
