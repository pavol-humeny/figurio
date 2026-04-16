<script setup>
/**
 * @file: AppRating.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the average app rating.
 */
import { ref, onMounted, computed } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';

const { getAppRating } = useApi();

/**
 * Reactive variable to store the average app rating fetched from the API
 */
const appRating = ref(null);

/**
 * Format rating to "x/5" and remove trailing .0
 */
const formattedRating = computed(() => {
  if (!appRating.value || appRating.value.averageRating == null) {
    return '0/5';
  }

  let value = Number(appRating.value.averageRating);

  // Remove trailing .0 (e.g. 5.0 -> 5)
  if (value % 1 === 0) {
    value = value.toFixed(0);
  } else {
    value = value.toFixed(1);
  }

  return `${value}/5`;
});

/**
 * Fetch app rating on component mount
 */
onMounted(async () => {
  appRating.value = await getAppRating();
});
</script>

<template>
  <div class="all-visits">
    <VisitCard :visitCount="formattedRating" :appRatingUserCount="appRating?.totalRatings" icon="IconStar"
      visitType="rating" />
  </div>
</template>

<style scoped>
.all-visits {
  width: 100%;
}
</style>
