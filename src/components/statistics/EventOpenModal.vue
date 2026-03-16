<script setup>
/**
 * @file: EventOpenModal.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of open modal events by modal type. It fetches the data from the API on component mount and displays it using the ProgressBar component, showing the percentage of opens for each modal type compared to the total number of opens.
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';
const { getOpenModal } = useApi();

/**
 * Reactive variable to store the open modal events fetched from the API
 */
const openModalEvents = ref([]);

/**
 * Fetch open modal events on component mount
 */
onMounted(async () => {
  const res = await getOpenModal();
  openModalEvents.value = res || [];
});

/**
 * Compute total number of open modal events
 */
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
