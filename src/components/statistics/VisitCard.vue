<script setup>
import BaseIcon from '../icons/BaseIcon.vue';

const props = defineProps({
  visitType: {
    type: String,
    required: false,
    default: 'all', // 'all' | 'unique'
  },
  visitCount: {
    type: Number,
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
  <div class="visit-card">
    <div class="visit-count">
      <p class="description">
        {{ $t(`statistics.visits.${props.visitType}Visits`) }}
      </p>
      <p class="count">
        {{ props.visitCount }}
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
  background: var(--secondary-c);
  border-radius: 20px;
  padding: 30px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--box-shadow-hover);
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
