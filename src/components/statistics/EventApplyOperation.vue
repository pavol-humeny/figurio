<script setup>
/**
 * @file: EventApplyOperation.vue
 * @author: Pavol Humeny
 * @date: 15.5.2026
 * @description: Component for displaying the number of apply operations for each tool/tab. It fetches the data from the API on component mount and displays it using the ProgressBar component, showing the percentage of applies for each tool/tab compared to the total number of applies.
 */
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';
const { getApplyOperation } = useApi();

/**
 * Reactive variable to store the apply operation events fetched from the API
 */
const applyOperationEvents = ref([]);

/**
 * Fetch apply operation events on component mount
 */
onMounted(async () => {
  const res = await getApplyOperation();
  applyOperationEvents.value = res || [];
});

/**
 * Compute total number of applies across all tools/tabs to calculate percentages for the ProgressBar component
 */
const totalApplies = computed(() =>
  applyOperationEvents.value.reduce((sum, item) => sum + item.numberOfApplies, 0)
);
</script>

<template>
  <div class="single-event statistics-card">
    <div class="single-event-title">
      {{ $t('statistics.events.singleEvent.applyOperation.title') }}
      <div class="total-number-of-event">
        <p>{{ $t('statistics.events.singleEvent.applyOperation.totalEvents') }}
          {{ totalApplies }}
        </p>
      </div>
    </div>

    <div class="single-event-values">
      <div class="overview-item" v-for="(item, index) in applyOperationEvents" :key="index">
        <ProgressBar :progress="item.numberOfApplies" :total="totalApplies" :title="item.tool"
          :subtitle="item.tab !== 'null' ? item.tab : ''" />
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
