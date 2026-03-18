<script setup>
/**
 * @file: NumberOfPWA.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of how many times the app has been used as a PWA.
 */
import { ref, onMounted } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';
const { getNumberOfPWAVisits } = useApi();

/**
 * Reactive variable to store the total number of PWA visits fetched from the API
 */
const numberOfPWAVisits = ref(0);

/**
 * Fetch PWA visit count on component mount
 */
onMounted(async () => {
  numberOfPWAVisits.value = await getNumberOfPWAVisits();
});
</script>

<template>
  <div class="all-visits">
    <VisitCard :visitCount="numberOfPWAVisits" icon="IconPWAUsage" visitType="pwa" />
  </div>

</template>

<style scoped>
.all-visits {
  width: 100%;
}
</style>
