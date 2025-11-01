<script setup>
import { ref } from 'vue';
import VisitCard from './VisitCard.vue';

const uniqueVisits = ref(50);

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
