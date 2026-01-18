<script setup>
import { useUiStore } from '@/stores/uiStore'
import { useLoadingSpinner } from '@/composables/common/useLoadingSpinner'

/**
 * Logic for the loading spinner component
 */
const { isLoading, showApplyingSpinner, blockClicks } = useLoadingSpinner(useUiStore())

</script>

<template>
  <div>

    <div v-if="isLoading || showApplyingSpinner" class="overlay" :class="{ 'loading-overlay': isLoading }">
      <div class="spinner"></div>
    </div>

    <teleport to="body">
      <div v-if="blockClicks" class="click-blocker">
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.overlay {
  position: absolute;
  z-index: var(--z-index-loading-wheel);
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  user-select: none;
  background-color: var(--background-c-transparent, rgba(0, 0, 0, 0.3));
}

.loading-overlay {
  backdrop-filter: blur(2px);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid var(--border-c);
  border-top: 4px solid var(--primary-c);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.click-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
  cursor: progress;
  z-index: var(--z-index-loading);
}
</style>
