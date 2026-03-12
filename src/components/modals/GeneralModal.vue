<script setup>
/**
 * @file: GeneralModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { computed } from 'vue'
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useShaking } from '@/composables/common/useShaking'
import DefaultButton from '@/components/common/DefaultButton.vue'
import SelectPdfPageModal from './SelectPdfPageModal.vue'
import CloseAllFilesModal from './CloseAllFilesModal.vue'

/**
 * Logic for the general modal
 */
const {
  isVisible,
  cancelText,
  confirmText,
  confirm,
  cancel,
  payload,
  modalType,
  canBeClosedByClickingOutside,
} = useGeneralModal()


/**
 * Mapping of modal types to their respective components
 */
const modalComponents = {
  selectPdfPage: SelectPdfPageModal,
  closeAllFiles: CloseAllFilesModal,
}

/**
 * Current modal component based on modal type
 */
const CurrentModal = computed(() => modalComponents[modalType.value])


/**
 * Logic of the shake animation for modal
 */
const {
  isShaking,
  triggerShake
} = useShaking()

/**
 * Handles outside click based on canBeClosedByClickingOutside
 */
const handleOutsideClick = () => {
  if (canBeClosedByClickingOutside.value) {
    cancel()
  } else {
    triggerShake()
  }
}

/**
 * Emits confirm event with selected page number
 */
const emitConfirm = () => {
  confirm(payload.value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal-overlay modal-overlay" @mousedown.self="handleOutsideClick">
      <div class="modal-box" :class="{ shake: isShaking }">
        <div class="content-wrapper">
          <component :is="CurrentModal" v-if="CurrentModal" />
        </div>
        <div class="button-wrapper">
          <DefaultButton :text="cancelText" @click="cancel" onlyText />
          <DefaultButton :text="confirmText" @click="emitConfirm" />
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
  background: var(--background-c);
  border: var(--border-modal);
  padding: 20px 25px;
  border-radius: 20px;
  max-width: 600px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.content-wrapper {
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
