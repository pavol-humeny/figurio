<script setup>
/**
 * @file: DataCard.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying a single data card with a description, main value, and an optional icon.
 */
import BaseIcon from '../icons/BaseIcon.vue';

const props = defineProps({
  description: {
    type: String,
    required: true,
  },
  mainValue: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    required: false,
    default: '',
  },
})
</script>

<template>
  <div class="visit-card statistics-card">
    <div class="visit-count">
      <p class="description">
        {{ props.description }}
      </p>
      <p class="count">
        {{ props.mainValue }}
      </p>
    </div>
    <div class="visit-icon" v-if="props.icon">
      <BaseIcon :name="props.icon" :size="40" color="var(--primary-c)" />
    </div>
  </div>
</template>

<style scoped>
.visit-card {
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.visit-count {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.visit-count .description {
  font-size: 14px;
  color: var(--text-c);
  opacity: 0.8;
}

.visit-count .count {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-c);
}
</style>
