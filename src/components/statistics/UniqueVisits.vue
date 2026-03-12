<script setup>
/**
 * @file: UniqueVisits.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 */
import { ref, onMounted } from 'vue';
import VisitCard from './VisitCard.vue';
import { useApi } from '@/composables/common/useApi';

const uniqueVisits = ref(0);

const { getUniqueVisits } = useApi();

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
