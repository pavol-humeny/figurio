<script setup>
import { ref } from 'vue';
import VisitCard from './VisitCard.vue';

const allVisits = ref(100);

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
