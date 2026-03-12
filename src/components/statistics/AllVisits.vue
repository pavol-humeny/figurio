<script setup>
/**
 * @file: AllVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';

const allVisits = ref(0);

const { getAllVisits } = useApi();

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
