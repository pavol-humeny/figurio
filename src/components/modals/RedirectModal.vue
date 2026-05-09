<script setup>
/**
 * @file: RedirectModal.vue
 * @author: Pavol Humeny
 * @date: 9.5.2026
 * @description: Modal that forces user redirect action via single button.
 */

import DefaultButton from '@/components/common/DefaultButton.vue'
import { useRedirectModal } from '@/composables/modals/useRedirectModal'

/**
 * Redirect modal logic (visibility + target URL)
 */
const { isVisible, redirect, registerModalClick } = useRedirectModal()
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible" class="redirect-modal-overlay modal-overlay">
      <div class="modal-box" @click="registerModalClick">
        <!-- Title -->
        <div class="title-wrapper">
          <p>{{ $t('general.redirectNotice.title') }}</p>
        </div>

        <!-- Description -->
        <p class="subtitle">
          {{ $t('general.redirectNotice.message') }}
        </p>

        <!-- Redirect button only -->
        <div class="button-wrapper">
          <DefaultButton :text="$t('general.redirectNotice.confirm')" main @click="redirect" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.redirect-modal-overlay {
  z-index: var(--z-index-modal);
  background: var(--background-overlay-modal);
  backdrop-filter: var(--backdrop-filter-modal);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Modal box */
.modal-box {
  background: var(--background-c);
  border: var(--border-modal);
  padding: 22px 26px;
  border-radius: 20px;
  width: 500px;
  box-shadow: var(--box-shadow-ui);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

/* Title */
.title-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.title-wrapper p {
  font-size: var(--title-font-size);
  font-weight: var(--title-font-weight);
  color: var(--primary-c);
}

/* Subtitle */
.subtitle {
  font-size: var(--text-font-size);
  color: var(--text-secondary-c);
  text-align: center;
}

/* Button */
.button-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
</style>
