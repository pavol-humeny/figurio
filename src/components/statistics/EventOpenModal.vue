<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';

const { getOpenModal } = useApi();
const openModalEvents = ref([]);

// Fetch data on mount
onMounted(async () => {
  const res = await getOpenModal();
  openModalEvents.value = res || [];
});

// Compute total number of open modal events
const totalOpenModals = computed(() =>
  openModalEvents.value.reduce((sum, item) => sum + item.numberOfOpens, 0)
);
</script>

<template>
  <div class="single-event statistics-card">
    <div class="single-event-title">
      {{ $t('statistics.events.singleEvent.openModal.title') }}
      <div class="total-number-of-event">
        <p>{{ $t('statistics.events.singleEvent.openModal.totalEvents') }}
          {{ totalOpenModals }}
        </p>
      </div>
    </div>

    <div class="single-event-values">
      <div class="overview-item" v-for="(item, index) in openModalEvents" :key="index">
        <ProgressBar :progress="item.numberOfOpens" :total="totalOpenModals" :title="item.modal" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.single-event-values {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.overview-item {
  width: 100%;
}
</style>
