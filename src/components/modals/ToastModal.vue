<script setup>
import { useToast } from '@/composables/useToast'
const { toasts, removeToast } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toast-wrapper">
      <div
        v-for="(toast, index) in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
        :style="{ bottom: `${index * 10 + 20}px` }"
      >
        <button class="close-button" @click="removeToast(toast.id)">×</button>

        <p class="title">{{ toast.title }}</p>
        <p class="message">{{ toast.message }}</p>
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
  padding: 10px 15px;
  color: var(--text-c);
  width: 300px;
  /* border: 1px solid transparent; */
  /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4); */
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
.notification {
  background: var(--notification-background-c);
  border-color: var(--notification-c);
  color: var(--notification-c);
}


</style>
