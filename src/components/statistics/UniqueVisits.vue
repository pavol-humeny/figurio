<script setup>
/**
 * @file: UniqueVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of unique visits. It fetches the data from the API on component mount and displays it in a VisitCard component, showing the total count of unique visits with an appropriate icon.
 */
import { ref, onMounted } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';
const { getUniqueVisits } = useApi();

/**
 * Reactive variable to store the number of unique visits
 */
const uniqueVisits = ref(0);

/**
 * Fetch unique visits on component mount
 */
onMounted(async () => {
  uniqueVisits.value = await getUniqueVisits();
});
</script>

<template>
  <div class="unique-visits">
    <VisitCard :visitCount="uniqueVisits" icon="IconUniqueVisits" visitType="unique" />
  </div>

</template>

<style scoped>
.unique-visits {
  width: 100%;
}
</style>
