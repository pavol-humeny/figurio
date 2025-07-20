<script setup>
import { useUiStore } from '@/stores/uiStore'
import { computed } from 'vue'

const uiStore = useUiStore()

/**
 * Whether to show the loading overlay
 */
const isVisible = computed(() => uiStore.isLoading)
</script>

<template>
  <div v-if="isVisible" class="loading-overlay">
    <div class="spinner"></div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  z-index: var(--z-index-loading);
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-c-transparent, rgba(0, 0, 0, 0.3));
  backdrop-filter: blur(2px);
  pointer-events: none;
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
</style>
