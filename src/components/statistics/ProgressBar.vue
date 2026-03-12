<script setup>
/**
 * @file: ProgressBar.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
const props = defineProps({
  progress: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: false,
    default: '',
  },
  subtitle: {
    type: String,
    required: false,
    default: '',
  },
});
</script>

<template>
  <div class="progress-bar">
    <div class="progress-texts-wrapper">
      <div class="progress-title">
        <p>
          {{ props.title }}
        </p>
        <p v-if="props.subtitle" class="progress-subtitle">
          ({{ props.subtitle }})
        </p>
      </div>
      <div class="progress-value-wrapper">
        <div class="progress-value">{{ props.progress }}</div>
        <div class="progress-percentage">
          {{ ((props.progress / props.total) * 100).toFixed(2) }}%
        </div>
      </div>
    </div>
    <div class="progress-bar-track">
      <div class="progress-bar-fill" :style="{ width: ((props.progress / props.total) * 100) + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.progress-texts-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-c);
}

.progress-title {
  font-weight: 600;
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.progress-value-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.progress-value {
  color: var(--text-c);
}

.progress-percentage {
  color: var(--primary-c);
  font-size: 0.85rem;
}

.progress-bar-track {
  width: 100%;
  height: 12px;
  border-radius: 8px;
  background-color: var(--background-c);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 8px;
  background: linear-gradient(90deg,
      var(--primary-c),
      color-mix(in srgb, var(--primary-c) 70%, white));
  transition: width 0.4s ease;
}
</style>
