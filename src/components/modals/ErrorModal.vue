<script setup>
import { useErrorModal } from '@/composables/modals/useErrorModal'
import DefaultButton from '@/components/common/DefaultButton.vue'
import { useShaking } from '@/composables/common/useShaking'

/**
 * Logic of the error modal
 */
const {
  isVisible,
  refresh,
} = useErrorModal()

/**
 * Logic of the shaking animation (used when clicking outside modal)
 */
const { isShaking, triggerShake } = useShaking()
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="error-modal-overlay modal-overlay" @click.self="triggerShake">
      <div class="modal-box" :class="{ shake: isShaking }">
        <div class="title-wrapper">
          <p>{{ $t('help.unexpectedError.title') }}</p>
        </div>

        <div class="message-wrapper">
          <p>{{ $t('help.unexpectedError.message') }}</p>
        </div>

        <div class="button-wrapper">
          <DefaultButton :text="$t('help.unexpectedError.refreshButton')" @click="refresh" class="refresh-button"
            error />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.error-modal-overlay {
  z-index: var(--z-index-modal);
}

.modal-box {
  position: relative;
  background: var(--error-background-c);
  border: var(--border-modal);
  border-color: var(--error-c);
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
  color: var(--error-c);
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
  justify-content: flex-end;
  margin-top: 10px;
}
</style>
