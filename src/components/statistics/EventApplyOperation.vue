<script setup>
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/common/useApi';
import ProgressBar from '@/components/statistics/ProgressBar.vue';

const { getApplyOperation } = useApi();
const applyOperationEvents = ref([]);

// Fetch data on mount
onMounted(async () => {
  const res = await getApplyOperation();
  applyOperationEvents.value = res || [];
});

// Compute total number of applies
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
