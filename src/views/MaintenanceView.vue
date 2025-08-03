<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="maintenance-view">
    <div class="svg-container">
      <BaseIcon name="IconMaintenance" size="160" color="var(--primary-c)" class="pulsing-icon" />
    </div>

    <h1>{{ t('maintenance.message') }}</h1>
    <p class="sub">{{ t('maintenance.sub') }}</p>
  </div>
</template>

<style scoped>
.maintenance-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  min-height: 100vh;
  text-align: center;
  background: var(--background-c);
}

.svg-container {
  margin-bottom: 30px;
  animation: fadeIn 0.6s ease;
}

.pulsing-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

h1 {
  font-size: 35px;
  font-weight: bold;
  color: var(--primary-c);
  margin-bottom: 10px;
}

.sub {
  font-size: 18px;
  color: var(--text-c);
  max-width: 600px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
