<script setup>
/**
 * @file: AllVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the total number of visits. It fetches the total visits from the API on component mount and displays it using the VisitCard component.
 */
import { ref, onMounted } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';
const { getAllVisits } = useApi();

/**
 * Reactive variable to store the total number of visits fetched from the API
 */
const allVisits = ref(0);

/**
 * Fetch total visits on component mount
 */
onMounted(async () => {
  allVisits.value = await getAllVisits();
});
</script>

<template>
  <div class="all-visits">
    <VisitCard :visitCount="allVisits" icon="IconAllVisits" visitType="all" />
  </div>

</template>

<style scoped>
.all-visits {
  width: 100%;
}
</style>
