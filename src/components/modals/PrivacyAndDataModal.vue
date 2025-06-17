<script setup>
import { usePrivacyAndDataModal } from '@/composables/modals/usePrivacyAndDataModal';

const {
  isVisible,
  closePrivacyAndDataModal
} = usePrivacyAndDataModal();
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="privacy-modal-overlay">
      <div class="modal-box">
        <button @click="closePrivacyAndDataModal">Close</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.privacy-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-box {
  background: var(--background-c);
  color: var(--text-c);
  border: 1px solid var(--primary-c);
  border-radius: 20px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
}

.section {
  margin-top: 1rem;
}

.button-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
