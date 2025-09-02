<script setup>
import { useGeneralModal } from '@/composables/modals/useGeneralModal'
import { useShaking } from '@/composables/common/useShaking'
import DefaultButton from '@/components/common/DefaultButton.vue'

/**
 * Logic for the general modal
 */
const {
  isVisible,
  title,
  cancelText,
  confirmText,
  confirm,
  cancel,
  payload,
} = useGeneralModal()

/**
 * Logic of the shake animation for modal
 */
const {
  isShaking,
  triggerShake
} = useShaking()

/**
 * Emits confirm event with selected page number
 */
const emitConfirm = () => {
  confirm(payload.value)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="confirm-modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">
        <div v-if="title" class="title-wrapper">
          <p>{{ title }}</p>
        </div>
        <div class="content-wrapper">
          <slot></slot>
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
  max-width: 600px;
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
