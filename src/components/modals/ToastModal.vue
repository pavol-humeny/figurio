<script setup>
import { useToastModal } from '@/composables/modals/useToastModal'

/**
 * Logic of the toast modal system
 */
const {
  toasts,
  removeToastModal,
  getToastStyle,
  pauseAllToasts,
  resumeAllToasts,
} = useToastModal()
</script>

<template>
  <Teleport to="body">
    <div class="toast-wrapper">
      <div v-for="(toast, index) in toasts" :key="toast.id" class="toast" :class="toast.type"
        :style="getToastStyle(toast, index)" @mouseenter="pauseAllToasts" @mouseleave="resumeAllToasts">
        <button class="close-button" @click="removeToastModal(toast.id)">✕</button>

        <p class="title">{{ toast.title }}</p>
        <p class="message">{{ toast.message }}</p>

        <!-- Progress bar -->
        <div class="progress-bar">
          <div class="progress-fill" :style="{ transform: `scaleX(${toast.progress / 100})` }"> </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.close-button {
  position: absolute;
  top: 5px;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--text-c);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.toast-wrapper {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-index-toast);
  pointer-events: none;
}

.toast {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 10px;
  padding: 15px 20px 15px 20px;
  color: var(--text-c);
  max-width: 400px;
  min-width: 250px;
  border: 1px solid transparent;
  box-shadow: var(--box-shadow-ui);
  animation: fade-in 0.3s ease-out;
  pointer-events: auto;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.title {
  font-weight: 800;
  margin-bottom: 15px;
  padding-right: 20px;
}

.message {
  font-size: 13px;
  color: var(--text-c);
}

.error {
  background: var(--error-background-c);
  border-color: var(--error-c);
  color: var(--error-c);
}

.warning {
  background: var(--warning-background-c);
  border-color: var(--warning-c);
  color: var(--warning-c);
}

.success {
  background: var(--success-background-c);
  border-color: var(--success-c);
  color: var(--success-c);
}

.info {
  background: var(--notification-background-c);
  border-color: var(--notification-c);
  color: var(--notification-c);
}

/** Progress bar for toast duration */
.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  overflow: hidden;
  border-radius: 0 0 10px 10px;
  pointer-events: none;
}

.progress-fill {
  border-radius: 10px;
  height: 100%;
  width: 100%;
  background: currentColor;
  opacity: 0.1;
  transform-origin: left center;
  will-change: transform;
}
</style>
