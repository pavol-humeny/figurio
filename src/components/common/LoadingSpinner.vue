<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { computed } from 'vue'

const uiStore = useUiStore()

onMounted(() => {
  const blockAll = (e) => {
    if (uiStore.isLoading) {
      console.log('Blocking interaction due to loading state')
      e.stopImmediatePropagation()
      e.preventDefault()
    }
  }

  window.addEventListener('click', blockAll, true)
  window.addEventListener('mousedown', blockAll, true)
  window.addEventListener('keydown', blockAll, true)
  window.addEventListener('pointerdown', blockAll, true)

  onBeforeUnmount(() => {
    window.removeEventListener('click', blockAll, true)
    window.removeEventListener('mousedown', blockAll, true)
    window.removeEventListener('keydown', blockAll, true)
    window.removeEventListener('pointerdown', blockAll, true)
  })
})


/**
 * Whether to show the loading overlay
 */
const isVisible = computed(() => uiStore.isLoading)
</script>

<template>
  <div>

    <div v-if="isVisible" class="loading-overlay">
      <div class="spinner"></div>
    </div>

    <teleport to="body">
      <div v-if="isVisible" class="click-blocker">
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  z-index: var(--z-index-loading-wheel);
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

.click-blocker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: all;
  cursor: progress;
  z-index: var(--z-index-loading);
  /* backdrop-filter: blur(20px); */

}
</style>
