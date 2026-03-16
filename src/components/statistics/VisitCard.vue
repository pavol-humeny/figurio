<script setup>
/**
 * @file: VisitCard.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying a card with visit statistics. It takes in props for the type of visits (all or unique), the count of visits, and an optional icon. The card displays the visit count along with a description and an icon if provided. It is used in the UniqueVisits and AllVisits components to show the respective statistics.
 */
import BaseIcon from '../icons/BaseIcon.vue';

/**
 * @typedef {Object} VisitCardProps
 * @property {string} visitType - The type of visits to display (e.g., 'all' or 'unique').
 * @property {number} visitCount - The count of visits to display.
 * @property {string} [icon] - Optional name of the icon to display on the card.
 */

/** @type {VisitCardProps} */
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
  <div class="visit-card statistics-card">
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
